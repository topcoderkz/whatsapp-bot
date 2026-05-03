import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handleBranchPrices(input: UserInput, session: SessionData): Promise<void> {
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

  const branch = session.branchId
    ? await (prisma as any).branch.findFirst({
        where: { id: session.branchId },
        include: { priceImage: true },
      })
    : null;

  if (!branch) {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  // Send price image if available
  if (branch.priceImage?.imageUrl) {
    await whatsappClient.sendImage(
      input.phone,
      branch.priceImage.imageUrl,
      `Прайс-лист ${branch.name}`
    );
  } else {
    // Fallback: send text message if no image
    await whatsappClient.sendText(
      input.phone,
      `Прайс-лист для ${branch.name} временно недоступен в виде изображения.\n\nПожалуйста, свяжитесь с менеджером для получения актуальной информации о ценах.`
    );
  }

  await whatsappClient.sendButtons(
    input.phone,
    'Нужна помощь или хотите записаться?',
    [
      { id: 'bp_manager', title: '📞 Менеджер' },
      { id: 'back_bmenu', title: '🏠 Меню филиала' },
    ]
  );

  await sessionStore.update(input.phone, { state: State.BRANCH_PRICES });
}
