import type { Translations } from './types';

export const en: Translations = {
  // Common
  back: '⬅️ Back',
  cancel: 'Cancel',
  next: 'Next',
  confirm: 'Confirm',
  send: 'Send',
  loading: 'Loading...',
  error: 'An error occurred. Please try again.',
  select: 'Select',

  // Welcome
  welcome: {
    greeting: 'Hello! 👋',
    title: 'Welcome to 100% Fitness Gym!',
    subtitle: 'Let us help you find the perfect workout format 💪',
    choose: 'Choose what interests you:',
  },

  // Main Menu
  menu: {
    prices: { title: '📋 View Prices', description: 'Memberships from 19,000 KZT' },
    branch: { title: '📍 Select Branch', description: '4 branches in Almaty' },
    booking: { title: '⭐ Book Now', description: 'Book a workout' },
    promos: { title: '🎁 Promotions', description: 'Special offers' },
    manager: { title: '📞 Manager', description: 'Contact our manager' },
  },

  // Language Selection
  language: {
    title: 'Выберите язык / Тілді таңдаңыз / Select language',
    choose: 'Select language',
    ru: '🇷🇺 Русский',
    kk: '🇰🇿 Қазақша',
    en: '🇬🇧 English',
    change: '🌐 Language',
    change_desc: 'Change language',
  },

  // Branches
  branches: {
    select: 'Select a convenient branch 🏋️‍♀️',
    title: 'Our Branches',
    our_branches: 'Our branches',
  },

  // Prices
  prices: {
    title: 'Prices',
    from: 'from',
    year: 'Year',
    exact: 'Exact conditions',
    select_branch: 'Select a branch to see exact pricing:',
    monthly: 'Monthly',
    longterm: 'Long-term',
    contact_manager: 'Contact manager to purchase:',
    not_available: 'Price list temporarily unavailable',
    no_image: 'Price list is temporarily unavailable as an image.\n\nPlease contact our manager for pricing information.',
    special_offers: 'Special offers available now!',
    need_help: 'Need help or want to book?',
    currency: 'KZT',
  },

  // Booking
  booking: {
    title: 'Book a Workout ⭐',
    select_branch: 'Select branch for booking',
    type: {
      title: 'Select workout type:',
      individual: '🏃 Individual',
      group: '👥 Group',
      individual_label: 'Individual',
      group_label: 'Group',
    },
    date: {
      title: 'Select workout date 📅',
      select_day: 'Select a convenient day:',
      dates: 'Dates',
      upcoming: 'Upcoming days',
    },
    time: {
      title: 'Select time',
      morning: '🌅 Morning (7:00 - 17:00)',
      evening: '🌆 Evening (17:00 - 23:00)',
      select: 'Select workout time ⏰',
      morning_slots: 'Morning slots ⏰',
      evening_slots: 'Afternoon/evening slots ⏰',
      morning_period: 'Morning 07–12',
      evening_period: 'Day/Evening 13–21',
      morning_range: 'Morning (07:00–12:00)',
      evening_range: 'Day/Evening (13:00–21:00)',
      time_label: 'Time',
      date_label: 'Date:',
    },
    confirm: {
      title: 'Confirm Booking',
      details: 'Booking Details:',
      branch: '📍 Branch:',
      type: '🏋️ Type:',
      date: '📅 Date:',
      time: '⏰ Time:',
      confirm: '✅ Confirm',
      cancel: '❌ Cancel',
      all_correct: 'Is everything correct?',
      success_title: 'You are booked! ✅',
      manager_contact: 'The branch manager will contact you to confirm.',
      incomplete: 'Booking data is incomplete. Let\'s start over.',
      error_message: 'An error occurred while booking. Please try again later or contact the manager.',
      edit: '✏️ Edit',
    },
    success: 'Booking confirmed! See you there.',
    cancelled: 'Booking cancelled.',
  },

  // Branch Menu
  branchMenu: {
    selected: 'You selected branch',
    address: 'Address:',
    interested: 'What interests you?',
    prices: '📋 Prices',
    classes: '👥 Group Classes',
    trainers: '👨‍🏫 Trainers',
    manager: '📞 Manager',
  },

  // Navigation
  nav: {
    main_menu: '🏠 Main Menu',
    branch_menu: '🏠 Branch Menu',
    to_main: 'To main menu',
    to_branch: 'To branch menu',
  },

  // Trainers
  trainers: {
    title: 'Our Trainers',
    specialization: 'Specialization',
    experience: 'Experience',
    experience_years: 'years of experience',
    no_trainers: 'Trainer information coming soon 👨‍🏫',
    contact_manager: 'Contact the manager for details.',
    select_trainer: 'Select a trainer for more information:',
    not_found: 'Trainer not found.',
    back_to_trainers: '⬅️ Trainers',
  },

  // Classes
  classes: {
    title: 'Group Classes',
    schedule: 'Schedule',
    capacity: 'Capacity',
    not_set: 'Not set',
    no_classes: 'Group class schedule is being prepared 📋',
    contact_manager: 'Contact the manager for details.',
    select_class: 'Select a class for more information:',
    classes_label: 'Classes',
    trainer_label: 'Trainer:',
    not_found: 'Class not found.',
    back_to_classes: '⬅️ Classes',
    check_manager: 'Check with manager',
  },

  // Promotions
  promotions: {
    title: 'Promotions & Offers 🎁',
    conditions: 'Conditions',
    valid: 'Valid until',
    no_promos: 'No promotions available',
    no_active: 'No active promotions right now 🎁',
    follow_updates: 'Stay tuned for updates!',
    current: 'Current promotions',
    not_found: 'Promotion not found.',
    back_to_promos: '⬅️ Promotions',
  },

  // Manager
  manager: {
    title: 'Manager',
    our_manager: 'Our manager:',
    phone: 'Phone:',
    write: 'Write to us',
    branch_manager: 'Branch Manager',
    call_or_write: 'Call or message on WhatsApp using the number above.',
  },

  // Generic
  no_results: 'No results found',
  try_again: 'Please try again',
  contact_for_help: 'Contact manager for assistance',

  // Date formatting
  dates: {
    days_short: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat',
    months_short: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',
  },
};
