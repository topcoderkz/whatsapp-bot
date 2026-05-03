import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handleBranchPrices(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
  const selection = input.listId || input.buttonId;

  if (selection === 'bp_manager') {
    await sessionStore.update(input.phone, { state: State.CONTACT_MANAGER });
    const { handleContactManager } = await import('./contact-manager');
    await handleContactManager(input, session);
    return;
  }

  if (selection === 'back_bmenu') {
    await sessionStore.update(input.phone, { state: State.BRANCH_MENU });
    const { handleBranchMenu } = await import('./branch-menu');
    await handleBranchMenu(input, session);
    return;
  }

  const branchId = session.branchId;
  if (!branchId) {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  // Get branch without priceImage relation (for compatibility)
  const branch = await (prisma as any).branch.findFirst({ where: { id: branchId } });

  if (!branch) {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  // Try to get price image separately (migration may not be applied yet)
  let priceImageUrl: string | null = null;
  try {
    const priceImage = await (prisma as any).priceImage.findUnique({ where: { branchId } });
    priceImageUrl = priceImage?.imageUrl || null;
  } catch {
    // Table doesn't exist yet (migration not applied)
    priceImageUrl = null;
  }

  // Send price image if available
  if (priceImageUrl) {
    await whatsappClient.sendImage(
      input.phone,
      priceImageUrl,
      `${t(lang, 'prices.title')} ${branch.name}`
    );
  } else {
    // Fallback: send text message if no image
    const fallbackText = t(lang, 'prices.no_image').replace(
      /\n\n.+$/,
      `\n\n${t(lang, 'prices.contact_manager')}`
    );
    await whatsappClient.sendText(input.phone, `${branch.name}\n\n${fallbackText}`);
  }

  await whatsappClient.sendButtons(
    input.phone,
    t(lang, 'prices.need_help'),
    [
      { id: 'bp_manager', title: t(lang, 'manager.title') },
      { id: 'back_bmenu', title: t(lang, 'nav.branch_menu') },
    ]
  );

  await sessionStore.update(input.phone, { state: State.BRANCH_PRICES });
}
