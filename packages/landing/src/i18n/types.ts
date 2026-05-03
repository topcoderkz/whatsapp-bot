export type Locale = 'kk' | 'ru' | 'en';

export interface LandingTranslations {
  meta: { title: string; description: string };
  nav: {
    about: string;
    branches: string;
    pricing: string;
    trainers: string;
    classes: string;
    promotions: string;
    contact: string;
    whatsapp_cta: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    cta_secondary: string;
  };
  about: {
    title: string;
    description: string;
    stat_branches: string;
    stat_branches_desc: string;
    stat_price: string;
    stat_price_desc: string;
    stat_schedule: string;
    stat_schedule_desc: string;
    stat_trainers: string;
    stat_trainers_desc: string;
  };
  branches: {
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    hours: string;
    view_map: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    membership: string;
    time: string;
    price: string;
    visits_12: string;
    unlimited: string;
    months_3: string;
    months_6: string;
    months_12: string;
    morning: string;
    full_day: string;
    currency: string;
    contact_cta: string;
    per_month: string;
  };
  trainers: {
    title: string;
    subtitle: string;
    experience: string;
    years: string;
    specialization: string;
    placeholder: string;
  };
  classes: {
    title: string;
    subtitle: string;
    schedule: string;
    trainer: string;
    capacity: string;
    spots: string;
    placeholder: string;
    all_branches: string;
  };
  promotions: {
    title: string;
    subtitle: string;
    valid_until: string;
    conditions: string;
    placeholder: string;
  };
  contact: {
    title: string;
    subtitle: string;
    whatsapp_cta: string;
    whatsapp_desc: string;
    call_us: string;
    follow_us: string;
    address: string;
  };
  footer: {
    description: string;
    nav_title: string;
    contact_title: string;
    social_title: string;
    copyright: string;
  };
}
