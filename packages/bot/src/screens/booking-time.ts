import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00',
];

export async function handleBookingTime(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
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
    const slots = TIME_SLOTS.filter((s) => parseInt(s) < 13);
    await whatsappClient.sendList(
      input.phone,
      `${t(lang, 'booking.time.morning_slots')}\n${t(lang, 'booking.time.date_label')} ${session.booking?.date || ''}`,
      t(lang, 'booking.time.time_label'),
      [
        {
          title: t(lang, 'booking.time.morning_range'),
          rows: [
            ...slots.map((s) => ({ id: `btime_${s}`, title: s })),
            { id: 'back_btime_period', title: t(lang, 'back') },
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
    const slots = TIME_SLOTS.filter((s) => parseInt(s) >= 13);
    await whatsappClient.sendList(
      input.phone,
      `${t(lang, 'booking.time.evening_slots')}\n${t(lang, 'booking.time.date_label')} ${session.booking?.date || ''}`,
      t(lang, 'booking.time.time_label'),
      [
        {
          title: t(lang, 'booking.time.evening_range'),
          rows: [
            ...slots.map((s) => ({ id: `btime_${s}`, title: s })),
            { id: 'back_btime_period', title: t(lang, 'back') },
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
    `${t(lang, 'booking.time.select')}\n${t(lang, 'booking.time.date_label')} ${session.booking?.date || ''}`,
    [
      { id: 'period_morning', title: t(lang, 'booking.time.morning_period') },
      { id: 'period_evening', title: t(lang, 'booking.time.evening_period') },
      { id: 'back_bdate', title: t(lang, 'back') },
    ]
  );
}
