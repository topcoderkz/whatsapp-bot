import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';
import { t, getDayNames, getMonthNames, type Language } from '../locales';

function getNext7Days(lang: Language): Array<{ id: string; title: string; description: string; dateStr: string }> {
  const days = [];
  const now = new Date();
  const dayNames = getDayNames(lang);
  const monthNames = getMonthNames(lang);

  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    days.push({
      id: `bdate_${dateStr}`,
      title: `${dayName}, ${day} ${month}`,
      description: dateStr,
      dateStr,
    });
  }

  return days;
}

export async function handleBookingDate(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
  const selection = input.listId || input.buttonId;

  if (selection?.startsWith('bdate_')) {
    const dateStr = selection.replace('bdate_', '');
    const booking = { ...(session.booking || {}), date: dateStr };
    await sessionStore.update(input.phone, { state: State.BOOKING_TIME, booking });
    const { handleBookingTime } = await import('./booking-time');
    await handleBookingTime(input, { ...session, state: State.BOOKING_TIME, booking });
    return;
  }

  if (selection === 'back_btype') {
    await sessionStore.update(input.phone, { state: State.BOOKING_TYPE });
    const { handleBookingType } = await import('./booking-type');
    await handleBookingType(input, session);
    return;
  }

  // Show next 7 days
  const days = getNext7Days(lang);

  await whatsappClient.sendList(
    input.phone,
    t(lang, 'booking.date.title'),
    t(lang, 'booking.date.dates'),
    [
      {
        title: t(lang, 'booking.date.upcoming'),
        rows: [
          ...days.map((d) => ({
            id: d.id,
            title: d.title,
          })),
          { id: 'back_btype', title: t(lang, 'back') },
        ],
      },
    ]
  );
}
