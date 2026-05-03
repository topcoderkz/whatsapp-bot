import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { t, formatLocalDate, type Language } from '../locales';

export async function handlePromoDetail(input: UserInput, session: SessionData, promoId?: number): Promise<void> {
  const lang = (session.language || 'ru') as Language;
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
    await whatsappClient.sendText(input.phone, t(lang, 'promotions.not_found'));
    await sessionStore.update(input.phone, { state: State.PROMOTIONS });
    const { handlePromotions } = await import('./promotions');
    await handlePromotions(input, session);
    return;
  }

  // Send image if available
  if (promo.imageUrl) {
    await whatsappClient.sendImage(input.phone, promo.imageUrl, promo.title);
  }

  const endDate = formatLocalDate(lang, new Date(promo.endDate));
  let text = `${promo.title} 🎁\n\n${promo.description}`;
  if (promo.conditions) text += `\n\n${t(lang, 'promotions.conditions')}: ${promo.conditions}`;
  text += `\n\n${t(lang, 'promotions.valid')}: ${endDate}`;

  await whatsappClient.sendButtons(
    input.phone,
    text,
    [
      { id: 'back_promos', title: t(lang, 'promotions.back_to_promos') },
      { id: 'back_main', title: t(lang, 'nav.main_menu') },
    ]
  );
}
