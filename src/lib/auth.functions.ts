// Server function: send & verify OTP via Brevo gateway.
// Uses Supabase admin to create users and issue magic-link tokens that the
// client exchanges for a real session.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomInt } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BREVO_GATEWAY = "https://connector-gateway.lovable.dev/brevo";
const SENDER_EMAIL = "ablelov252@gmail.com";
const SENDER_NAME = "Chettiar Connect";

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

async function sendBrevoEmail(toEmail: string, code: string) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY missing");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fdf8f0;border-radius:12px">
      <h1 style="font-family:Georgia,serif;color:#5a1a1a;margin:0 0 8px">Chettiar Connect</h1>
      <p style="color:#7a4a4a;margin:0 0 24px;font-size:14px">Premium Tamil Matrimony</p>
      <div style="background:linear-gradient(135deg,#f5d182,#d4a04a);padding:24px;border-radius:8px;text-align:center">
        <p style="margin:0 0 8px;color:#3a1a1a;font-size:13px;letter-spacing:1px">YOUR VERIFICATION CODE</p>
        <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:#3a1a1a;font-family:Georgia,serif">${code}</p>
      </div>
      <p style="color:#7a4a4a;margin:24px 0 0;font-size:13px">This code expires in 5 minutes. Do not share it with anyone.</p>
      <p style="color:#aaa;margin:24px 0 0;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  const res = await fetch(`${BREVO_GATEWAY}/smtp/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail }],
      subject: `${code} is your Chettiar Connect verification code`,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Brevo send failed [${res.status}]: ${txt}`);
  }
}

export const sendOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(255) }).parse(d),
  )
  .handler(async ({ data }) => {
    const email = data.email;

    // Rate limit: max 1 OTP per 30s, 5 per hour
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabaseAdmin
      .from("otp_codes")
      .select("created_at")
      .eq("email", email)
      .gte("created_at", since)
      .order("created_at", { ascending: false });
    if (recent && recent.length >= 5) {
      throw new Error("Too many OTP requests. Try again in an hour.");
    }
    if (recent && recent.length > 0) {
      const last = new Date(recent[0].created_at).getTime();
      if (Date.now() - last < 30_000) {
        throw new Error("Please wait 30 seconds before requesting another code.");
      }
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: insErr } = await supabaseAdmin.from("otp_codes").insert({
      email,
      code_hash: hashCode(code),
      expires_at: expiresAt,
    });
    if (insErr) throw new Error(insErr.message);

    await sendBrevoEmail(email, code);
    return { ok: true, expiresAt };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; code: string }) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email().max(255),
        code: z.string().trim().regex(/^\d{6}$/),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { email, code } = data;

    const { data: rows } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("consumed", false)
      .order("created_at", { ascending: false })
      .limit(1);
    const row = rows?.[0];
    if (!row) throw new Error("No active code. Request a new one.");
    if (new Date(row.expires_at).getTime() < Date.now()) {
      throw new Error("Code expired. Request a new one.");
    }
    const attempts = row.attempts ?? 0;
    if (attempts >= 5) {
      throw new Error("Too many attempts. Request a new code.");
    }
    if (row.code_hash !== hashCode(code)) {
      await supabaseAdmin
        .from("otp_codes")
        .update({ attempts: attempts + 1 })
        .eq("id", row.id);
      throw new Error("Invalid code.");
    }

    await supabaseAdmin.from("otp_codes").update({ consumed: true }).eq("id", row.id);

    // Find or create user — paginate listUsers to find by email
    let userId: string | null = null;
    for (let page = 1; page <= 20 && !userId; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) break;
      const found = list.users.find((u) => u.email?.toLowerCase() === email);
      if (found) userId = found.id;
      if (list.users.length < 200) break;
    }
    if (!userId) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (created.error) throw new Error(created.error.message);
      userId = created.data.user!.id;
    }

    // Generate a magic link, return token_hash for client to verify
    const linkRes = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkRes.error) throw new Error(linkRes.error.message);
    const tokenHash =
      // @ts-ignore
      linkRes.data?.properties?.hashed_token ??
      // @ts-ignore
      linkRes.data?.hashed_token;
    if (!tokenHash) throw new Error("Could not issue session token.");

    return { tokenHash, userId, email };
  });
