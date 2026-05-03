import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handleContactManager(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
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
    `${t(lang, 'manager.branch_manager')} ${branch.name} 📞\n\n${t(lang, 'branchMenu.address')} ${branch.address}\n${t(lang, 'manager.phone')} ${branch.managerPhone}\n\n${t(lang, 'manager.call_or_write')}`,
    [
      { id: 'back_bmenu', title: t(lang, 'nav.branch_menu') },
      { id: 'back_main', title: t(lang, 'nav.main_menu') },
    ]
  );
}
