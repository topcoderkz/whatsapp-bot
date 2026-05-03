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
    branch: { title: '📍 Филиалды таңдау', description: 'Алматыда 4 филиал' },
    booking: { title: '⭐ Жазылу', description: 'Жаттығуға жазылу' },
    promos: { title: '🎁 Акциялар', description: 'Тиімді ұсыныстар' },
    manager: { title: '📞 Менеджер', description: 'Менеджермен байланыс' },
  },

  // Language Selection
  language: {
    title: 'Выберите язык / Тілді таңдаңыз / Select language',
    choose: 'Тілді таңдаңыз',
    ru: '🇷🇺 Орысша',
    kk: '🇰🇿 Қазақша',
    en: '🇬🇧 English',
    change: '🌐 Тіл',
    change_desc: 'Тілді өзгерту',
  },

  // Branches
  branches: {
    select: 'Ыңғайлы филиалды таңдаңыз 🏋️‍♀️',
    title: 'Біздің филиалдар',
    our_branches: 'Біздің филиалдар',
  },

  // Prices
  prices: {
    title: 'Бағалар',
    from: 'бастап',
    year: 'Жыл',
    exact: 'Нақты шарттар',
    select_branch: 'Нақты шарттарды көру үшін — ыңғайлы филиалды таңдаңыз:',
    monthly: '1 айға',
    longterm: 'Ұзақ мерзімді',
    contact_manager: 'Сатып алу үшін менеджермен байланысыңыз:',
    not_available: 'Баға тізімі уақытша қолжетімсіз',
    no_image: 'Баға тізімі уақытша сурет түрінде қолжетімсіз.\n\nАқпарат алу үшін менеджермен байланысыңыз.',
    special_offers: 'Қазір тиімді акциялар бар!',
    need_help: 'Көмек керек пе немесе жазылғыңыз келе ме?',
    currency: 'теңге',
  },

  // Booking
  booking: {
    title: 'Жаттығуға жазылу ⭐',
    select_branch: 'Жазылу үшін филиалды таңдаңыз',
    type: {
      title: 'Жаттығу түрін таңдаңыз:',
      individual: '🏃 Жеке жаттығу',
      group: '👥 Топтық жаттығу',
      individual_label: 'Жеке',
      group_label: 'Топтық',
    },
    date: {
      title: 'Жаттығу күнін таңдаңыз 📅',
      select_day: 'Ыңғайлы күнді таңдаңыз:',
      dates: 'Күндер',
      upcoming: 'Жақын күндер',
    },
    time: {
      title: 'Уақытты таңдаңыз',
      morning: '🌅 Таңертең (7:00-ден 17:00-ге дейін)',
      evening: '🌆 Кешкі (17:00-ден 23:00-ге дейін)',
      select: 'Жаттығу уақытын таңдаңыз ⏰',
      morning_slots: 'Таңғы уақыттар ⏰',
      evening_slots: 'Күндізгі/кешкі уақыттар ⏰',
      morning_period: 'Таңертең 07–12',
      evening_period: 'Күн/Кеш 13–21',
      morning_range: 'Таңертең (07:00–12:00)',
      evening_range: 'Күн/Кеш (13:00–21:00)',
      time_label: 'Уақыт',
      date_label: 'Күні:',
    },
    confirm: {
      title: 'Жазылуды растаңыз',
      details: 'Жазылу мәліметтері:',
      branch: '📍 Филиал:',
      type: '🏋️ Түрі:',
      date: '📅 Күні:',
      time: '⏰ Уақыты:',
      confirm: '✅ Растау',
      cancel: '❌ Бас тарту',
      all_correct: 'Бәрі дұрыс па?',
      success_title: 'Сіз жазылдыңыз! ✅',
      manager_contact: 'Филиал менеджері сізбен растау үшін байланысады.',
      incomplete: 'Жазылу деректері толық емес. Басынан бастаймыз.',
      error_message: 'Жазылу кезінде қате орын алды. Кейінірек қайталаңыз немесе менеджермен байланысыңыз.',
      edit: '✏️ Өзгерту',
    },
    success: 'Жазылу расталды! Сізді күтеміз!',
    cancelled: 'Жазба тоқтатылды.',
  },

  // Branch Menu
  branchMenu: {
    selected: 'Сіз филиалды таңдадыңыз',
    address: 'Мекен-жайы:',
    interested: 'Сізді не қызықтырады?',
    prices: '📋 Бағалар',
    classes: '👥 Топтық',
    trainers: '👨‍🏫 Жаттықтырушылар',
    manager: '📞 Менеджер',
  },

  // Navigation
  nav: {
    main_menu: '🏠 Басты мәзір',
    branch_menu: '🏠 Филиал мәзірі',
    to_main: 'Басты мәзірге',
    to_branch: 'Филиал мәзіріне',
  },

  // Trainers
  trainers: {
    title: 'Біздің жаттықтырушылар',
    specialization: 'Мамандануы',
    experience: 'Тәжірибе',
    experience_years: 'жыл тәжірибе',
    no_trainers: 'Жаттықтырушылар туралы ақпарат жақында қосылады 👨‍🏫',
    contact_manager: 'Нақтылау үшін менеджермен байланысыңыз.',
    select_trainer: 'Толық ақпарат үшін жаттықтырушыны таңдаңыз:',
    not_found: 'Жаттықтырушы табылмады.',
    back_to_trainers: '⬅️ Жаттықтырушылар',
  },

  // Classes
  classes: {
    title: 'Топтық жаттығулар',
    schedule: 'Кесте',
    capacity: 'Орындар',
    not_set: 'Орнатылмаған',
    no_classes: 'Топтық жаттығулар кестесі әзірленуде 📋',
    contact_manager: 'Нақтылау үшін менеджермен байланысыңыз.',
    select_class: 'Толық ақпарат үшін жаттығуды таңдаңыз:',
    classes_label: 'Жаттығулар',
    trainer_label: 'Жаттықтырушы:',
    not_found: 'Жаттығу табылмады.',
    back_to_classes: '⬅️ Жаттығулар',
    check_manager: 'Менеджерден сұраңыз',
  },

  // Promotions
  promotions: {
    title: 'Акциялар мен ұсыныстар 🎁',
    conditions: 'Шарттар',
    valid: 'Мерзімі:',
    no_promos: 'Акциялар жоқ',
    no_active: 'Қазір белсенді акциялар жоқ 🎁',
    follow_updates: 'Жаңалықтарды қадағалаңыз!',
    current: 'Ағымдағы акциялар',
    not_found: 'Акция табылмады.',
    back_to_promos: '⬅️ Акциялар',
  },

  // Manager
  manager: {
    title: 'Менеджер',
    our_manager: 'Біздің менеджер:',
    phone: 'Телефон:',
    write: 'Бізге жазыңыз',
    branch_manager: 'Филиал менеджері',
    call_or_write: 'Жоғарыдағы нөмірге қоңырау шалыңыз немесе WhatsApp-та жазыңыз.',
  },

  // Generic
  no_results: 'Ештеңе табылмады',
  try_again: 'Қайталап көріңіз',
  contact_for_help: 'Көмек үшін менеджермен байланысыңыз',

  // Date formatting
  dates: {
    days_short: 'Жс,Дс,Сс,Ср,Бс,Жм,Сб',
    months_short: 'қаң,ақп,нау,сәу,мам,мау,шіл,там,қыр,қаз,қар,жел',
  },
};
