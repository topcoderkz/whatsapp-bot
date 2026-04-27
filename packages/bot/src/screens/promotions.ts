import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handlePromotions(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection?.startsWith('promo_')) {
    const promoId = parseInt(selection.replace('promo_', ''), 10);
    await sessionStore.update(input.phone, { state: State.PROMO_DETAIL });
    const { handlePromoDetail } = await import('./promo-detail');
    await handlePromoDetail(input, { ...session, state: State.PROMO_DETAIL }, promoId);
    return;
  }

  if (selection === 'back_main') {
    const { handleWelcome } = await import('./welcome');
    await sessionStore.update(input.phone, { state: State.WELCOME });
    await handleWelcome(input, session);
    return;
  }

  const now = new Date();
  const promos = await (prisma as any).promotion.findMany({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (promos.length === 0) {
    await whatsappClient.sendButtons(
      input.phone,
      'Сейчас нет активных акций 🎁\n\nСледите за обновлениями!',
      [
        { id: 'back_main', title: '🏠 Главное меню' },
      ]
    );
    return;
  }

  const rows = promos.slice(0, 9).map((p: any) => ({
    id: `promo_${p.id}`,
    title: p.title.slice(0, 24),
    description: p.description?.slice(0, 72) || undefined,
  }));

  rows.push({ id: 'back_main', title: '⬅️ Назад', description: 'В главное меню' });

  await whatsappClient.sendList(
    input.phone,
    'Акции и предложения 🎁',
    'Акции',
    [{ title: 'Текущие акции', rows }]
  );
}
