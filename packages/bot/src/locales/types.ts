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
    change: string;
    change_desc: string;
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
    no_image: string;
    special_offers: string;
    need_help: string;
    currency: string;
  };

  // Booking
  booking: {
    title: string;
    select_branch: string;
    type: {
      title: string;
      individual: string;
      group: string;
      individual_label: string;
      group_label: string;
    };
    date: {
      title: string;
      select_day: string;
      dates: string;
      upcoming: string;
    };
    time: {
      title: string;
      morning: string;
      evening: string;
      select: string;
      morning_slots: string;
      evening_slots: string;
      morning_period: string;
      evening_period: string;
      morning_range: string;
      evening_range: string;
      time_label: string;
      date_label: string;
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
      all_correct: string;
      success_title: string;
      manager_contact: string;
      incomplete: string;
      error_message: string;
      edit: string;
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

  // Navigation
  nav: {
    main_menu: string;
    branch_menu: string;
    to_main: string;
    to_branch: string;
  };

  // Trainers
  trainers: {
    title: string;
    specialization: string;
    experience: string;
    experience_years: string;
    no_trainers: string;
    contact_manager: string;
    select_trainer: string;
    not_found: string;
    back_to_trainers: string;
  };

  // Classes
  classes: {
    title: string;
    schedule: string;
    capacity: string;
    not_set: string;
    no_classes: string;
    contact_manager: string;
    select_class: string;
    classes_label: string;
    trainer_label: string;
    not_found: string;
    back_to_classes: string;
    check_manager: string;
  };

  // Promotions
  promotions: {
    title: string;
    conditions: string;
    valid: string;
    no_promos: string;
    no_active: string;
    follow_updates: string;
    current: string;
    not_found: string;
    back_to_promos: string;
  };

  // Manager
  manager: {
    title: string;
    our_manager: string;
    phone: string;
    write: string;
    branch_manager: string;
    call_or_write: string;
  };

  // Generic
  no_results: string;
  try_again: string;
  contact_for_help: string;

  // Date formatting (comma-separated)
  dates: {
    days_short: string;
    months_short: string;
  };
}
