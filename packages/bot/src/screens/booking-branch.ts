import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handleBookingBranch(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection?.startsWith('bbranch_')) {
    const branchId = parseInt(selection.replace('bbranch_', ''), 10);
    const branch = await (prisma as any).branch.findFirst({ where: { id: branchId } });

    if (branch) {
      const booking = { ...(session.booking || {}), branchId: branch.id };
      await sessionStore.update(input.phone, {
        state: State.BOOKING_TYPE,
        branchId: branch.id,
        booking,
      });
      const { handleBookingType } = await import('./booking-type');
      await handleBookingType(input, { ...session, state: State.BOOKING_TYPE, branchId: branch.id, booking });
      return;
    }
  }

  if (selection === 'back_main') {
    const { handleWelcome } = await import('./welcome');
    await sessionStore.update(input.phone, { state: State.WELCOME });
    await handleWelcome(input, session);
    return;
  }

  // Show branch list for booking
  const branches = await (prisma as any).branch.findMany({ orderBy: { id: 'asc' } });

  await whatsappClient.sendList(
    input.phone,
    'Запись на тренировку ⭐\n\nВыберите филиал:',
    'Филиалы',
    [
      {
        title: 'Филиалы',
        rows: [
          ...branches.map((b: any) => ({
            id: `bbranch_${b.id}`,
            title: `📍 ${b.name}`,
            description: b.address,
          })),
          { id: 'back_main', title: '⬅️ Назад', description: 'В главное меню' },
        ],
      },
    ]
  );
}
