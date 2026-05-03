export type Language = 'ru' | 'kk' | 'en';

export interface Translations {
  // Common
  back: string;
  cancel: string;
  next: string;
  confirm: string;
  send: string;
  loading: string;
  error: string;
  select: string;

  // Welcome
  welcome: {
    greeting: string;
    title: string;
    subtitle: string;
    choose: string;
  };

  // Main Menu
  menu: {
    prices: { title: string; description: string };
    branch: { title: string; description: string };
    booking: { title: string; description: string };
    promos: { title: string; description: string };
    manager: { title: string; description: string };
  };

  // Language Selection
  language: {
    title: string;
    choose: string;
    ru: string;
    kk: string;
    en: string;
  };

  // Branches
  branches: {
    select: string;
    title: string;
    our_branches: string;
  };

  // Prices
  prices: {
    title: string;
    from: string;
    year: string;
    exact: string;
    select_branch: string;
    monthly: string;
    longterm: string;
    contact_manager: string;
    not_available: string;
  };

  // Booking
  booking: {
    select_branch: string;
    type: {
      title: string;
      individual: string;
      group: string;
    };
    date: {
      title: string;
      select_day: string;
    };
    time: {
      title: string;
      morning: string;
      evening: string;
    };
    confirm: {
      title: string;
      details: string;
      branch: string;
      type: string;
      date: string;
      time: string;
      confirm: string;
      cancel: string;
    };
    success: string;
    cancelled: string;
  };

  // Branch Menu
  branchMenu: {
    selected: string;
    address: string;
    interested: string;
    prices: string;
    classes: string;
    trainers: string;
    manager: string;
  };

  // Trainers
  trainers: {
    title: string;
    specialization: string;
    experience: string;
    experience_years: string;
  };

  // Classes
  classes: {
    title: string;
    schedule: string;
    capacity: string;
    not_set: string;
  };

  // Promotions
  promotions: {
    title: string;
    conditions: string;
    valid: string;
    no_promos: string;
  };

  // Manager
  manager: {
    title: string;
    our_manager: string;
    phone: string;
    write: string;
  };

  // Generic
  no_results: string;
  try_again: string;
  contact_for_help: string;
}
