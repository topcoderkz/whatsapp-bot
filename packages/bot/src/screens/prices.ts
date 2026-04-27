import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';
import { handleBranchSelection } from './branch-selection';

export async function handlePricesOverview(input: UserInput, session: SessionData): Promise<void> {
  // If user selected a button from this screen, handle it
  const selection = input.listId || input.buttonId;

  if (selection === 'prices_branch') {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    await handleBranchSelection(input, session);
    return;
  }

  if (selection === 'prices_manager') {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.CONTACT_MANAGER });
    await handleBranchSelection(input, session);
    return;
  }

  if (selection === 'back_main') {
    const { handleWelcome } = await import('./welcome');
    await sessionStore.update(input.phone, { state: State.WELCOME });
    await handleWelcome(input, session);
    return;
  }

  // Show prices overview
  await whatsappClient.sendButtons(
    input.phone,
    'Наши абонементы:\n\n— Месяц от 19 000 тг\n— Год от 130 000 тг\n\n🔥 Сейчас действуют выгодные предложения!\n\nЧтобы показать точные условия — выберите удобный филиал:',
    [
      { id: 'prices_branch', title: '📍 Выбрать филиал' },
      { id: 'prices_manager', title: '📞 Менеджер' },
      { id: 'back_main', title: '⬅️ Назад' },
    ]
  );

  await sessionStore.update(input.phone, { state: State.PRICES_OVERVIEW });
}
