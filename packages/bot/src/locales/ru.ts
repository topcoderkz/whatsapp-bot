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
    change: '🌐 Язык',
    change_desc: 'Сменить язык',
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
    no_image: 'Прайс-лист временно недоступен в виде изображения.\n\nПожалуйста, свяжитесь с менеджером для получения актуальной информации о ценах.',
    special_offers: 'Сейчас действуют выгодные предложения!',
    need_help: 'Нужна помощь или хотите записаться?',
    currency: 'тг',
  },

  // Booking
  booking: {
    title: 'Запись на тренировку ⭐',
    select_branch: 'Выберите филиал для записи',
    type: {
      title: 'Выберите тип тренировки:',
      individual: '🏃 Индивидуальная',
      group: '👥 Групповая',
      individual_label: 'Индивидуальная',
      group_label: 'Групповая',
    },
    date: {
      title: 'Выберите дату тренировки 📅',
      select_day: 'Выберите удобный день:',
      dates: 'Даты',
      upcoming: 'Ближайшие дни',
    },
    time: {
      title: 'Выберите время',
      morning: '🌅 Утро (с 7:00 до 17:00)',
      evening: '🌆 Вечер (с 17:00 до 23:00)',
      select: 'Выберите время тренировки ⏰',
      morning_slots: 'Утренние слоты ⏰',
      evening_slots: 'Дневные/вечерние слоты ⏰',
      morning_period: 'Утро 07–12',
      evening_period: 'День/Вечер 13–21',
      morning_range: 'Утро (07:00–12:00)',
      evening_range: 'День/Вечер (13:00–21:00)',
      time_label: 'Время',
      date_label: 'Дата:',
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
      all_correct: 'Всё верно?',
      success_title: 'Вы записаны! ✅',
      manager_contact: 'Менеджер филиала свяжется с вами для подтверждения.',
      incomplete: 'Данные записи неполные. Начнём сначала.',
      error_message: 'Произошла ошибка при записи. Попробуйте позже или свяжитесь с менеджером.',
      edit: '✏️ Изменить',
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

  // Navigation
  nav: {
    main_menu: '🏠 Главное меню',
    branch_menu: '🏠 Меню филиала',
    to_main: 'В главное меню',
    to_branch: 'В меню филиала',
  },

  // Trainers
  trainers: {
    title: 'Наши тренеры',
    specialization: 'Специализация',
    experience: 'Опыт',
    experience_years: 'лет опыта',
    no_trainers: 'Информация о тренерах скоро появится 👨‍🏫',
    contact_manager: 'Свяжитесь с менеджером для уточнения.',
    select_trainer: 'Выберите тренера для подробной информации:',
    not_found: 'Тренер не найден.',
    back_to_trainers: '⬅️ К тренерам',
  },

  // Classes
  classes: {
    title: 'Групповые занятия',
    schedule: 'Расписание',
    capacity: 'Мест',
    not_set: 'Не задано',
    no_classes: 'Расписание групповых занятий пока формируется 📋',
    contact_manager: 'Свяжитесь с менеджером для уточнения.',
    select_class: 'Выберите занятие для подробной информации:',
    classes_label: 'Занятия',
    trainer_label: 'Тренер:',
    not_found: 'Занятие не найдено.',
    back_to_classes: '⬅️ К занятиям',
    check_manager: 'Уточняйте у менеджера',
  },

  // Promotions
  promotions: {
    title: 'Акции и предложения 🎁',
    conditions: 'Условия',
    valid: 'Действует до',
    no_promos: 'Акций пока нет',
    no_active: 'Сейчас нет активных акций 🎁',
    follow_updates: 'Следите за обновлениями!',
    current: 'Текущие акции',
    not_found: 'Акция не найдена.',
    back_to_promos: '⬅️ К акциям',
  },

  // Manager
  manager: {
    title: 'Менеджер',
    our_manager: 'Наш менеджер:',
    phone: 'Телефон:',
    write: 'Напишите нам',
    branch_manager: 'Менеджер филиала',
    call_or_write: 'Вы можете позвонить или написать в WhatsApp по номеру выше.',
  },

  // Generic
  no_results: 'Ничего не найдено',
  try_again: 'Попробуйте снова',
  contact_for_help: 'Для помощи свяжитесь с менеджером',

  // Date formatting
  dates: {
    days_short: 'Вс,Пн,Вт,Ср,Чт,Пт,Сб',
    months_short: 'янв,фев,мар,апр,мая,июн,июл,авг,сен,окт,ноя,дек',
  },
};
