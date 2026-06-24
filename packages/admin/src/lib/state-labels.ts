export const STATE_LABELS_RU: Record<string, string> = {
  LANGUAGE_SELECTION: 'Выбор языка',
  WELCOME: 'Приветствие',
  MAIN_MENU: 'Главное меню',
  PRICES_OVERVIEW: 'Обзор цен',
  BRANCH_SELECTION: 'Выбор филиала',
  BRANCH_MENU: 'Меню филиала',
  BRANCH_PRICES: 'Цены филиала',
  BRANCH_PRICES_MONTHLY: 'Абонементы (месяц)',
  BRANCH_PRICES_LONGTERM: 'Абонементы (долгосрочные)',
  CONTACT_MANAGER: 'Связь с менеджером',
  BOOKING_BRANCH: 'Запись: выбор филиала',
  BOOKING_TYPE: 'Запись: тип тренировки',
  BOOKING_DATE: 'Запись: дата',
  BOOKING_TIME: 'Запись: время',
  BOOKING_CONFIRM: 'Запись: подтверждение',
  GROUP_CLASSES: 'Групповые занятия',
  CLASS_DETAIL: 'Описание занятия',
  TRAINERS: 'Тренеры',
  TRAINER_PROFILE: 'Профиль тренера',
  PROMOTIONS: 'Акции',
  PROMO_DETAIL: 'Описание акции',
};

export function stateLabel(state: string): string {
  return STATE_LABELS_RU[state] ?? state;
}
