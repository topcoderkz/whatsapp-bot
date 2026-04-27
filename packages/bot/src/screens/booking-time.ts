import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';

// Default time slots for the gym (07:00 - 22:00, 1-hour slots)
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00',
];

export async function handleBookingTime(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection?.startsWith('btime_')) {
    const timeSlot = selection.replace('btime_', '');
    const booking = { ...(session.booking || {}), timeSlot };
    await sessionStore.update(input.phone, { state: State.BOOKING_CONFIRM, booking });
    const { handleBookingConfirm } = await import('./booking-confirm');
    await handleBookingConfirm(input, { ...session, state: State.BOOKING_CONFIRM, booking });
    return;
  }

  if (selection === 'back_bdate') {
    await sessionStore.update(input.phone, { state: State.BOOKING_DATE });
    const { handleBookingDate } = await import('./booking-date');
    await handleBookingDate(input, session);
    return;
  }

  // Show time slots (split into 2 sections to fit in 10-row limit)
  const morningSlots = TIME_SLOTS.filter((t) => parseInt(t) < 13);
  const eveningSlots = TIME_SLOTS.filter((t) => parseInt(t) >= 13);

  await whatsappClient.sendList(
    input.phone,
    `Выберите время тренировки ⏰\nДата: ${session.booking?.date || ''}`,
    'Время',
    [
      {
        title: 'Утро',
        rows: morningSlots.map((t) => ({
          id: `btime_${t}`,
          title: t,
        })),
      },
      {
        title: 'День/Вечер',
        rows: [
          ...eveningSlots.slice(0, 4).map((t) => ({
            id: `btime_${t}`,
            title: t,
          })),
          { id: 'back_bdate', title: '⬅️ Назад' },
        ],
      },
    ]
  );
}
