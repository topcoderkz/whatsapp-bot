import type { Translations } from './types';

export const ru: Translations = {
  // Common
  back: '⬅️ Назад',
  cancel: 'Отмена',
  next: 'Далее',
  confirm: 'Подтвердить',
  send: 'Отправить',
  loading: 'Загрузка...',
  error: 'Произошла ошибка. Попробуйте снова.',
  select: 'Выбрать',

  // Welcome
  welcome: {
    greeting: 'Здравствуйте! 👋',
    title: 'Добро пожаловать в 100% Fitness Gym!',
    subtitle: 'Поможем подобрать удобный формат тренировок 💪',
    choose: 'Выберите, что вас интересует:',
  },

  // Main Menu
  menu: {
    prices: { title: '📋 Узнать цены', description: 'Абонементы от 19 000 тг' },
    branch: { title: '📍 Выбрать филиал', description: '4 филиала в Алматы' },
    booking: { title: '⭐ Записаться', description: 'На тренировку' },
    promos: { title: '🎁 Акции', description: 'Выгодные предложения' },
    manager: { title: '📞 Менеджер', description: 'Связаться с менеджером' },
  },

  // Language Selection
  language: {
    title: 'Выберите язык / Тілді таңдаңыз / Select language',
    choose: 'Выберите язык',
    ru: '🇷🇺 Русский',
    kk: '🇰🇿 Қазақша',
    en: '🇬🇧 English',
  },

  // Branches
  branches: {
    select: 'Выберите удобный филиал 🏋️‍♀️',
    title: 'Наши филиалы',
    our_branches: 'Наши филиалы',
  },

  // Prices
  prices: {
    title: 'Цены',
    from: 'от',
    year: 'Год',
    exact: 'Точные условия',
    select_branch: 'Чтобы показать точные условия — выберите удобный филиал:',
    monthly: 'На 1 месяц',
    longterm: 'Долгосрочные',
    contact_manager: 'Для покупки свяжитесь с менеджером:',
    not_available: 'Прайс-лист временно недоступен',
  },

  // Booking
  booking: {
    select_branch: 'Выберите филиал для записи',
    type: {
      title: 'Выберите тип тренировки',
      individual: '💪 Индивидуальная',
      group: '👥 Групповая',
    },
    date: {
      title: 'Выберите дату',
      select_day: 'Выберите удобный день:',
    },
    time: {
      title: 'Выберите время',
      morning: '🌅 Утро (с 7:00 до 17:00)',
      evening: '🌆 Вечер (с 17:00 до 23:00)',
    },
    confirm: {
      title: 'Подтвердите запись',
      details: 'Детали записи:',
      branch: '📍 Филиал:',
      type: '🏋️ Тип:',
      date: '📅 Дата:',
      time: '⏰ Время:',
      confirm: '✅ Подтвердить',
      cancel: '❌ Отменить',
    },
    success: 'Запись подтверждена! Ожидаем вас.',
    cancelled: 'Запись отменена.',
  },

  // Branch Menu
  branchMenu: {
    selected: 'Вы выбрали филиал',
    address: 'Адрес:',
    interested: 'Что вас интересует?',
    prices: '📋 Цены',
    classes: '👥 Групповые',
    trainers: '👨‍🏫 Тренеры',
    manager: '📞 Менеджер',
  },

  // Trainers
  trainers: {
    title: 'Наши тренеры',
    specialization: 'Специализация',
    experience: 'Опыт',
    experience_years: 'лет опыта',
  },

  // Classes
  classes: {
    title: 'Групповые занятия',
    schedule: 'Расписание',
    capacity: 'Мест',
    not_set: 'Не задано',
  },

  // Promotions
  promotions: {
    title: 'Акции',
    conditions: 'Условия',
    valid: 'Действует до',
    no_promos: 'Акций пока нет',
  },

  // Manager
  manager: {
    title: 'Менеджер',
    our_manager: 'Наш менеджер:',
    phone: 'Телефон:',
    write: 'Напишите нам',
  },

  // Generic
  no_results: 'Ничего не найдено',
  try_again: 'Попробуйте снова',
  contact_for_help: 'Для помощи свяжитесь с менеджером',
};
