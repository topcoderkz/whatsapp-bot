export type Locale = 'kk' | 'ru' | 'en';

export interface LandingTranslations {
  meta: { title: string; description: string };
  nav: {
    branches: string;
    trainers: string;
    promotions: string;
    contact: string;
    whatsapp_cta: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    cta_secondary: string;
    app_title: string;
    app_description: string;
    badge: string;
    tiles: {
      whatsapp: string;
      instagram: string;
      ios: string;
      android: string;
    };
  };
  branches: {
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    hours: string;
    view_map: string;
    view_details: string;
    show_all_photos: string;
    show_all_trainers: string;
    trainers_count_label: string;
  };
  branch_page: {
    back_to_all: string;
    photos_title: string;
    pricing_title: string;
    trainers_title: string;
    classes_title: string;
    contact_title: string;
    no_trainers: string;
    no_classes: string;
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
  trainer_page: {
    back_to_all: string;
    bio_title: string;
    classes_title: string;
    branch_label: string;
    experience_label: string;
    whatsapp_direct: string;
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
    all_branches: string;
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
