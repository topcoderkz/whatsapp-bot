import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';

const DAY_NAMES_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTH_NAMES_RU = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function getNext7Days(): Array<{ id: string; title: string; description: string; dateStr: string }> {
  const days = [];
  const now = new Date();

  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    const dayName = DAY_NAMES_RU[date.getDay()];
    const day = date.getDate();
    const month = MONTH_NAMES_RU[date.getMonth()];
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
  const days = getNext7Days();

  await whatsappClient.sendList(
    input.phone,
    'Выберите дату тренировки 📅',
    'Даты',
    [
      {
        title: 'Ближайшие дни',
        rows: [
          ...days.map((d) => ({
            id: d.id,
            title: d.title,
          })),
          { id: 'back_btype', title: '⬅️ Назад' },
        ],
      },
    ]
  );
}
