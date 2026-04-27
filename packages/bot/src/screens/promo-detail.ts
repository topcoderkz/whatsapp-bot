import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handlePromoDetail(input: UserInput, session: SessionData, promoId?: number): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'back_promos') {
    await sessionStore.update(input.phone, { state: State.PROMOTIONS });
    const { handlePromotions } = await import('./promotions');
    await handlePromotions(input, session);
    return;
  }

  if (selection === 'back_main') {
    const { handleWelcome } = await import('./welcome');
    await sessionStore.update(input.phone, { state: State.WELCOME });
    await handleWelcome(input, session);
    return;
  }

  if (!promoId) {
    await sessionStore.update(input.phone, { state: State.PROMOTIONS });
    const { handlePromotions } = await import('./promotions');
    await handlePromotions(input, session);
    return;
  }

  const promo = await (prisma as any).promotion.findFirst({ where: { id: promoId } });

  if (!promo) {
    await whatsappClient.sendText(input.phone, 'Акция не найдена.');
    await sessionStore.update(input.phone, { state: State.PROMOTIONS });
    const { handlePromotions } = await import('./promotions');
    await handlePromotions(input, session);
    return;
  }

  // Send image if available
  if (promo.imageUrl) {
    await whatsappClient.sendImage(input.phone, promo.imageUrl, promo.title);
  }

  const endDate = new Date(promo.endDate).toLocaleDateString('ru-RU');
  let text = `${promo.title} 🎁\n\n${promo.description}`;
  if (promo.conditions) text += `\n\nУсловия: ${promo.conditions}`;
  text += `\n\nДействует до: ${endDate}`;

  await whatsappClient.sendButtons(
    input.phone,
    text,
    [
      { id: 'back_promos', title: '⬅️ К акциям' },
      { id: 'back_main', title: '🏠 Главное меню' },
    ]
  );
}
