import type { Translations } from './types';

export const kk: Translations = {
  // Common
  back: '⬅️ Артқа',
  cancel: 'Бас тарту',
  next: 'Әрі',
  confirm: 'Растау',
  send: 'Жіберу',
  loading: 'Жүктелуде...',
  error: 'Қате орындалды. Қайталап көріңіз.',
  select: 'Таңдау',

  // Welcome
  welcome: {
    greeting: 'Сәлеметсіз бе! 👋',
    title: '100% Fitness Gym-ге қош келдіңіздер!',
    subtitle: 'Жаттығулар үшін ыңғайлы форматты таңдауға көмектесеміз 💪',
    choose: 'Сізді қызықтыратын нәрсені таңдаңыз:',
  },

  // Main Menu
  menu: {
    prices: { title: '📋 Бағаларды көру', description: '19 000 теңгеден бастап абонементтер' },
    branch: { title: '📍 Филиалды таңдаңыз', description: 'Алматыда 4 филиал' },
    booking: { title: '⭐ Жазылуге', description: 'Жаттығуға' },
    promos: { title: '🎁 Акциялар', description: 'Қолжетімді ұсыныстар' },
    manager: { title: '📞 Менеджер', description: 'Менеджермен байланыс' },
  },

  // Language Selection
  language: {
    title: 'Тілді таңдаңыз / Тілді таңдаңыз / Select language',
    choose: 'Тілді таңдаңыз',
    ru: '🇷🇺 Орысша',
    kk: '🇰🇿 Қазақша',
    en: '🇬🇧 English',
  },

  // Branches
  branches: {
    select: 'Қолжетімді филиалды таңдаңыз 🏋️‍♀️',
    title: 'Филиалдарымыз',
    our_branches: 'Біздің филиалдар',
  },

  // Prices
  prices: {
    title: 'Бағалар',
    from: 'бастап',
    year: 'Жыл',
    exact: 'Нақты шарттар',
    select_branch: 'Нақты шарттарды көру үшін — қолжетімді филиалды таңдаңыз:',
    monthly: '1 айға',
    longterm: 'Ұзақ мерзімді',
    contact_manager: 'Сатып алу үшін менеджермен байланысыңыз:',
    not_available: 'Баға тізімі уақытша қолжетімсіз',
  },

  // Booking
  booking: {
    select_branch: 'Жазу үшін филиалды таңдаңыз',
    type: {
      title: 'Жаттығу түрін таңдаңыз',
      individual: '💪 Жеке жаттығу',
      group: '👥 Топтық жаттығу',
    },
    date: {
      title: 'Күнді таңдаңыз',
      select_day: 'Қолжетімді күнді таңдаңыз:',
    },
    time: {
      title: 'Уақытты таңдаңыз',
      morning: '🌅 Таңертең (7:00-ден 17:00-ге дейін)',
      evening: '🌆 Кешкі (17:00-ден 23:00-ге дейін)',
    },
    confirm: {
      title: 'Жазылуды растаңыз',
      details: 'Жазбаның егжей-тегжейі:',
      branch: '📍 Филиал:',
      type: '🏋️ Түрі:',
      date: '📅 Күні:',
      time: '⏰ Уақыты:',
      confirm: '✅ Растау',
      cancel: '❌ Бас тарту',
    },
    success: 'Жазба расталды! Күтіңіз.',
    cancelled: 'Жазба жойылды.',
  },

  // Branch Menu
  branchMenu: {
    selected: 'Сіз филиалды таңдадыңыз',
    address: 'Мекен-жайы:',
    interested: 'Сізді қызықтырады:',
    prices: '📋 Бағалар',
    classes: '👥 Топтық',
    trainers: '👨‍🏫 Жаттықтырушылар',
    manager: '📞 Менеджер',
  },

  // Trainers
  trainers: {
    title: 'Жаттықтырушылар',
    specialization: 'Мамандануы',
    experience: 'Тәжірибе',
    experience_years: 'жыл тәжірибе',
  },

  // Classes
  classes: {
    title: 'Топтық жаттығулар',
    schedule: 'Кесте',
    capacity: 'Орындар',
    not_set: 'Орнатылмаған',
  },

  // Promotions
  promotions: {
    title: 'Акциялар',
    conditions: 'Шарттар',
    valid: 'Мерзімі:',
    no_promos: 'Акциялар жоқ',
  },

  // Manager
  manager: {
    title: 'Менеджер',
    our_manager: 'Біздің менеджер:',
    phone: 'Телефон:',
    write: 'Бізге жазыңыз',
  },

  // Generic
  no_results: 'Ештеңе табылмады',
  try_again: 'Қайталап көріңіз',
  contact_for_help: 'Көмек үшін менеджермен байланысыңыз',
};
