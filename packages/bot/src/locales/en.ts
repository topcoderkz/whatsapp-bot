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
    title: 'Тілді таңдаңыз / Тілді таңдаңыз / Select language',
    choose: 'Select language',
    ru: '🇷🇺 Русский',
    kk: '🇰🇿 Қазақша',
    en: '🇬🇧 English',
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
  },

  // Booking
  booking: {
    select_branch: 'Select branch for booking',
    type: {
      title: 'Select workout type',
      individual: '💪 Individual',
      group: '👥 Group',
    },
    date: {
      title: 'Select date',
      select_day: 'Select a convenient day:',
    },
    time: {
      title: 'Select time',
      morning: '🌅 Morning (7:00 - 17:00)',
      evening: '🌆 Evening (17:00 - 23:00)',
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

  // Trainers
  trainers: {
    title: 'Our Trainers',
    specialization: 'Specialization',
    experience: 'Experience',
    experience_years: 'years of experience',
  },

  // Classes
  classes: {
    title: 'Group Classes',
    schedule: 'Schedule',
    capacity: 'Capacity',
    not_set: 'Not set',
  },

  // Promotions
  promotions: {
    title: 'Promotions',
    conditions: 'Conditions',
    valid: 'Valid until',
    no_promos: 'No promotions available',
  },

  // Manager
  manager: {
    title: 'Manager',
    our_manager: 'Our manager:',
    phone: 'Phone:',
    write: 'Write to us',
  },

  // Generic
  no_results: 'No results found',
  try_again: 'Please try again',
  contact_for_help: 'Contact manager for assistance',
};
