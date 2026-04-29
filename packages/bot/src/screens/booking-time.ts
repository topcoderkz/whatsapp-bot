import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00',
];

export async function handleBookingTime(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  // User picked a specific time slot — proceed to confirmation
  if (selection?.startsWith('btime_')) {
    const timeSlot = selection.replace('btime_', '');
    const booking = { ...(session.booking || {}), timeSlot };
    await sessionStore.update(input.phone, { state: State.BOOKING_CONFIRM, booking });
    const { handleBookingConfirm } = await import('./booking-confirm');
    await handleBookingConfirm(input, { ...session, state: State.BOOKING_CONFIRM, booking });
    return;
  }

  // Back to date selection
  if (selection === 'back_bdate') {
    await sessionStore.update(input.phone, { state: State.BOOKING_DATE });
    const { handleBookingDate } = await import('./booking-date');
    await handleBookingDate(input, session);
    return;
  }

  // User selected a time period — show specific slots for it
  const period = session.booking?.timePeriod;
  if (selection === 'period_morning' || period === 'morning') {
    if (selection === 'period_morning') {
      session = { ...session, booking: { ...session.booking, timePeriod: 'morning' } };
      await sessionStore.update(input.phone, { booking: session.booking });
    }
    const slots = TIME_SLOTS.filter((t) => parseInt(t) < 13);
    await whatsappClient.sendList(
      input.phone,
      `Утренние слоты ⏰\nДата: ${session.booking?.date || ''}`,
      'Время',
      [
        {
          title: 'Утро (07:00–12:00)',
          rows: [
            ...slots.map((t) => ({ id: `btime_${t}`, title: t })),
            { id: 'back_btime_period', title: '⬅️ Назад' },
          ],
        },
      ]
    );
    return;
  }

  if (selection === 'period_evening' || period === 'evening') {
    if (selection === 'period_evening') {
      session = { ...session, booking: { ...session.booking, timePeriod: 'evening' } };
      await sessionStore.update(input.phone, { booking: session.booking });
    }
    const slots = TIME_SLOTS.filter((t) => parseInt(t) >= 13);
    await whatsappClient.sendList(
      input.phone,
      `Дневные/вечерние слоты ⏰\nДата: ${session.booking?.date || ''}`,
      'Время',
      [
        {
          title: 'День/Вечер (13:00–21:00)',
          rows: [
            ...slots.map((t) => ({ id: `btime_${t}`, title: t })),
            { id: 'back_btime_period', title: '⬅️ Назад' },
          ],
        },
      ]
    );
    return;
  }

  // Back from period to period selection
  if (selection === 'back_btime_period') {
    await sessionStore.update(input.phone, {
      booking: { ...session.booking, timePeriod: undefined },
    });
    session = { ...session, booking: { ...session.booking, timePeriod: undefined } };
    // fall through to show period selection
  }

  // Step 1: Show period selection (reply buttons — max 3)
  await whatsappClient.sendButtons(
    input.phone,
    `Выберите время тренировки ⏰\nДата: ${session.booking?.date || ''}`,
    [
      { id: 'period_morning', title: 'Утро 07–12' },
      { id: 'period_evening', title: 'День/Вечер 13–21' },
      { id: 'back_bdate', title: '⬅️ Назад' },
    ]
  );
}
