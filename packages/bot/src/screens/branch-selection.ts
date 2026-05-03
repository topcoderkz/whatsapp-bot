import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handleBranchSelection(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
  const selection = input.listId || input.buttonId;

  // Handle branch selection
  if (selection?.startsWith('branch_')) {
    const branchId = parseInt(selection.replace('branch_', ''), 10);
    const branch = await (prisma as any).branch.findFirst({ where: { id: branchId } });

    if (branch) {
      await sessionStore.update(input.phone, { branchId: branch.id });

      // Route based on previousState (where they came from)
      const target = session.previousState || State.BRANCH_MENU;

      if (target === State.CONTACT_MANAGER) {
        const { handleContactManager } = await import('./contact-manager');
        await sessionStore.update(input.phone, { state: State.CONTACT_MANAGER, branchId: branch.id });
        await handleContactManager(input, { ...session, branchId: branch.id, state: State.CONTACT_MANAGER });
        return;
      }

      // Default: go to branch menu
      await sessionStore.update(input.phone, { state: State.BRANCH_MENU, branchId: branch.id });
      const { handleBranchMenu } = await import('./branch-menu');
      await handleBranchMenu(input, { ...session, branchId: branch.id, state: State.BRANCH_MENU });
      return;
    }
  }

  if (selection === 'back_main') {
    const { handleWelcome } = await import('./welcome');
    await sessionStore.update(input.phone, { state: State.WELCOME });
    await handleWelcome(input, session);
    return;
  }

  // Show branch list
  const branches = await (prisma as any).branch.findMany({ orderBy: { id: 'asc' } });

  await whatsappClient.sendList(
    input.phone,
    t(lang, 'branches.select'),
    t(lang, 'select'),
    [
      {
        title: t(lang, 'branches.our_branches'),
        rows: [
          ...branches.map((b: any) => ({
            id: `branch_${b.id}`,
            title: `📍 ${b.name}`,
            description: b.address,
          })),
          { id: 'back_main', title: t(lang, 'back'), description: lang === 'en' ? 'To main menu' : lang === 'kk' ? 'Басты мәзірге' : 'В главное меню' },
        ],
      },
    ]
  );
}
