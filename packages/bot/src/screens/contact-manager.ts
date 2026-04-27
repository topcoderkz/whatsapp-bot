import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handleContactManager(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'back_bmenu') {
    await sessionStore.update(input.phone, { state: State.BRANCH_MENU });
    const { handleBranchMenu } = await import('./branch-menu');
    await handleBranchMenu(input, session);
    return;
  }

  if (selection === 'back_main') {
    const { handleWelcome } = await import('./welcome');
    await sessionStore.update(input.phone, { state: State.WELCOME });
    await handleWelcome(input, session);
    return;
  }

  const branch = session.branchId
    ? await (prisma as any).branch.findFirst({ where: { id: session.branchId } })
    : null;

  if (!branch) {
    // No branch selected — ask to pick one
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.CONTACT_MANAGER });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  await whatsappClient.sendButtons(
    input.phone,
    `Менеджер филиала ${branch.name} 📞\n\nАдрес: ${branch.address}\nТелефон: ${branch.managerPhone}\n\nВы можете позвонить или написать в WhatsApp по номеру выше.`,
    [
      { id: 'back_bmenu', title: '⬅️ В меню филиала' },
      { id: 'back_main', title: '🏠 Главное меню' },
    ]
  );
}
