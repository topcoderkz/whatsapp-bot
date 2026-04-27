import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';

export async function handleWelcome(input: UserInput, session: SessionData): Promise<void> {
  await whatsappClient.sendList(
    input.phone,
    'Здравствуйте! 👋\nДобро пожаловать в 100% Fitness Gym!\nПоможем подобрать удобный формат тренировок 💪\n\nВыберите, что вас интересует:',
    'Выбрать',
    [
      {
        title: 'Меню',
        rows: [
          { id: 'menu_prices', title: '📋 Узнать цены', description: 'Абонементы от 19 000 тг' },
          { id: 'menu_branch', title: '📍 Выбрать филиал', description: '4 филиала в Алматы' },
          { id: 'menu_booking', title: '⭐ Записаться', description: 'На тренировку' },
          { id: 'menu_promos', title: '🎁 Акции', description: 'Выгодные предложения' },
          { id: 'menu_manager', title: '📞 Менеджер', description: 'Связаться с менеджером' },
        ],
      },
    ]
  );

  await sessionStore.update(input.phone, { state: State.MAIN_MENU });
}
