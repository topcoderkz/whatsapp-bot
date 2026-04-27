import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handleBranchMenu(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'bmenu_prices') {
    await sessionStore.update(input.phone, { state: State.BRANCH_PRICES });
    const { handleBranchPrices } = await import('./branch-prices');
    await handleBranchPrices(input, { ...session, state: State.BRANCH_PRICES });
    return;
  }

  if (selection === 'bmenu_classes') {
    await sessionStore.update(input.phone, { state: State.GROUP_CLASSES });
    const { handleGroupClasses } = await import('./group-classes');
    await handleGroupClasses(input, { ...session, state: State.GROUP_CLASSES });
    return;
  }

  if (selection === 'bmenu_trainers') {
    await sessionStore.update(input.phone, { state: State.TRAINERS });
    const { handleTrainers } = await import('./trainers');
    await handleTrainers(input, { ...session, state: State.TRAINERS });
    return;
  }

  if (selection === 'bmenu_manager') {
    await sessionStore.update(input.phone, { state: State.CONTACT_MANAGER });
    const { handleContactManager } = await import('./contact-manager');
    await handleContactManager(input, session);
    return;
  }

  if (selection === 'back_branches') {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  // Show branch menu
  const branch = session.branchId
    ? await (prisma as any).branch.findFirst({ where: { id: session.branchId } })
    : null;

  if (!branch) {
    // No branch selected, go to selection
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  await whatsappClient.sendList(
    input.phone,
    `Вы выбрали филиал на ${branch.name} 🏋️‍♀️\nАдрес: ${branch.address}\n\nЧто вас интересует?`,
    'Выбрать',
    [
      {
        title: branch.name,
        rows: [
          { id: 'bmenu_prices', title: '📋 Цены', description: 'Абонементы и тарифы' },
          { id: 'bmenu_classes', title: '👥 Групповые', description: 'Расписание занятий' },
          { id: 'bmenu_trainers', title: '👨‍🏫 Тренеры', description: 'Наши специалисты' },
          { id: 'bmenu_manager', title: '📞 Менеджер', description: 'Связаться' },
          { id: 'back_branches', title: '⬅️ Назад', description: 'К выбору филиала' },
        ],
      },
    ]
  );

  await sessionStore.update(input.phone, { state: State.BRANCH_MENU });
}
