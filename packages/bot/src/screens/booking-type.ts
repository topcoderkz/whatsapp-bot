import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';

export async function handleBookingType(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'btype_individual' || selection === 'btype_group') {
    const workoutType = selection === 'btype_individual' ? 'INDIVIDUAL' : 'GROUP';
    const booking = { ...(session.booking || {}), workoutType: workoutType as 'INDIVIDUAL' | 'GROUP' };
    await sessionStore.update(input.phone, { state: State.BOOKING_DATE, booking });
    const { handleBookingDate } = await import('./booking-date');
    await handleBookingDate(input, { ...session, state: State.BOOKING_DATE, booking });
    return;
  }

  if (selection === 'back_bbranch') {
    await sessionStore.update(input.phone, { state: State.BOOKING_BRANCH, booking: undefined });
    const { handleBookingBranch } = await import('./booking-branch');
    await handleBookingBranch(input, session);
    return;
  }

  // Show type selection
  await whatsappClient.sendButtons(
    input.phone,
    'Выберите тип тренировки:',
    [
      { id: 'btype_individual', title: '🏃 Индивидуальная' },
      { id: 'btype_group', title: '👥 Групповая' },
      { id: 'back_bbranch', title: '⬅️ Назад' },
    ]
  );
}
