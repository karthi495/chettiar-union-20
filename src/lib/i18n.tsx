import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ta";

const dict = {
  en: {
    home: "Home",
    browse: "Browse",
    sangams: "Sangams",
    dashboard: "Dashboard",
    myProfile: "My Profile",
    login: "Login",
    register: "Register",
    signOut: "Sign out",
    sangamDirectory: "Sangam Directory",
    findSangam: "Find a Chettiar Sangam near you",
    searchPlaceholder: "Search by sangam name, district or city...",
    allDistricts: "All Districts",
    allCommunities: "All Communities",
    contactSangam: "Contact Sangam",
    callNow: "Call Now",
    whatsapp: "WhatsApp",
    getDirections: "Get Directions",
    visitWebsite: "Visit Website",
    registerMember: "Register Member",
    foundedIn: "Founded in",
    members: "Members",
    families: "Families",
    marriages: "Marriages",
    activeEvents: "Active Events",
    about: "About",
    contact: "Contact",
    address: "Address",
    officeHours: "Office Hours",
    gallery: "Gallery",
    upcomingEvents: "Upcoming Events",
    services: "Community Services",
    bloodDonation: "Blood Donation Camp",
    marriageHelp: "Marriage Help",
    educationalSupport: "Educational Support",
    featured: "Featured Sangams",
    recent: "Recently Added",
    popular: "Popular Sangams",
    viewAll: "View All",
    noResults: "No sangams found",
    adminPanel: "Admin Panel",
    addSangam: "Add Sangam",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    approved: "Approved",
    pending: "Pending",
  },
  ta: {
    home: "முகப்பு",
    browse: "உலாவு",
    sangams: "சங்கங்கள்",
    dashboard: "டாஷ்போர்டு",
    myProfile: "என் சுயவிவரம்",
    login: "உள்நுழை",
    register: "பதிவு",
    signOut: "வெளியேறு",
    sangamDirectory: "சங்க அடைவு",
    findSangam: "உங்கள் அருகில் உள்ள செட்டியார் சங்கத்தைக் கண்டறியவும்",
    searchPlaceholder: "சங்கம், மாவட்டம் அல்லது நகரம் தேடுங்கள்...",
    allDistricts: "அனைத்து மாவட்டங்கள்",
    allCommunities: "அனைத்து சமூகங்கள்",
    contactSangam: "சங்கத்தை தொடர்பு கொள்ள",
    callNow: "அழைக்கவும்",
    whatsapp: "வாட்ஸ்அப்",
    getDirections: "திசைகளைப் பெறவும்",
    visitWebsite: "வலைத்தளம்",
    registerMember: "உறுப்பினராக பதிவு",
    foundedIn: "தொடங்கப்பட்ட ஆண்டு",
    members: "உறுப்பினர்கள்",
    families: "குடும்பங்கள்",
    marriages: "திருமணங்கள்",
    activeEvents: "செயலில் உள்ள நிகழ்வுகள்",
    about: "பற்றி",
    contact: "தொடர்பு",
    address: "முகவரி",
    officeHours: "அலுவலக நேரம்",
    gallery: "படத்தொகுப்பு",
    upcomingEvents: "வரவிருக்கும் நிகழ்வுகள்",
    services: "சமூக சேவைகள்",
    bloodDonation: "ரத்த தான முகாம்",
    marriageHelp: "திருமண உதவி",
    educationalSupport: "கல்வி உதவி",
    featured: "சிறப்பு சங்கங்கள்",
    recent: "புதிதாக சேர்க்கப்பட்டவை",
    popular: "பிரபல சங்கங்கள்",
    viewAll: "அனைத்தும் காண்க",
    noResults: "சங்கங்கள் எதுவும் கிடைக்கவில்லை",
    adminPanel: "நிர்வாக பலகை",
    addSangam: "சங்கத்தைச் சேர்",
    edit: "திருத்து",
    delete: "நீக்கு",
    save: "சேமி",
    cancel: "ரத்து",
    approved: "அங்கீகரிக்கப்பட்டது",
    pending: "நிலுவையில்",
  },
} as const;

type Key = keyof typeof dict.en;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved === "en" || saved === "ta") setLangState(saved);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (k: Key) => dict[lang][k] ?? dict.en[k];

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

/** Pick the right localized string from a row that has _en / _ta variants. */
export function pickLang(en?: string | null, ta?: string | null, lang: Lang = "en"): string {
  if (lang === "ta") return ta || en || "";
  return en || ta || "";
}
