import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { bookingService } from '../services/booking.service';

export async function handleBookingConfirm(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'bconfirm_yes') {
    // Create the booking
    const booking = session.booking;
    if (!booking?.branchId || !booking.workoutType || !booking.date || !booking.timeSlot) {
      await whatsappClient.sendText(input.phone, 'Данные записи неполные. Начнём сначала.');
      await sessionStore.update(input.phone, { state: State.BOOKING_BRANCH, booking: undefined });
      const { handleBookingBranch } = await import('./booking-branch');
      await handleBookingBranch(input, session);
      return;
    }

    try {
      const result = await bookingService.createBooking({
        clientPhone: input.phone,
        branchId: booking.branchId,
        workoutType: booking.workoutType,
        date: booking.date,
        timeSlot: booking.timeSlot,
        trainerId: booking.trainerId,
      });

      const branch = await (prisma as any).branch.findFirst({ where: { id: booking.branchId } });
      const typeLabel = booking.workoutType === 'INDIVIDUAL' ? 'Индивидуальная' : 'Групповая';

      await whatsappClient.sendButtons(
        input.phone,
        `Вы записаны! ✅\n\n📍 Филиал: ${branch?.name || ''}\n🏃 Тип: ${typeLabel}\n📅 Дата: ${booking.date}\n⏰ Время: ${booking.timeSlot}\n\nМенеджер филиала свяжется с вами для подтверждения.`,
        [
          { id: 'back_main', title: '🏠 Главное меню' },
        ]
      );

      // Clear booking data from session
      await sessionStore.update(input.phone, { state: State.WELCOME, booking: undefined });
    } catch (err) {
      console.error('[BookingConfirm] Error creating booking:', err);
      await whatsappClient.sendButtons(
        input.phone,
        'Произошла ошибка при записи. Попробуйте позже или свяжитесь с менеджером.',
        [
          { id: 'back_main', title: '🏠 Главное меню' },
        ]
      );
      await sessionStore.update(input.phone, { state: State.WELCOME, booking: undefined });
    }
    return;
  }

  if (selection === 'bconfirm_no' || selection === 'back_btime') {
    await sessionStore.update(input.phone, { state: State.BOOKING_TIME });
    const { handleBookingTime } = await import('./booking-time');
    await handleBookingTime(input, session);
    return;
  }

  if (selection === 'back_main') {
    await sessionStore.update(input.phone, { state: State.WELCOME, booking: undefined });
    const { handleWelcome } = await import('./welcome');
    await handleWelcome(input, session);
    return;
  }

  // Show confirmation
  const booking = session.booking;
  const branch = booking?.branchId
    ? await (prisma as any).branch.findFirst({ where: { id: booking.branchId } })
    : null;

  const typeLabel = booking?.workoutType === 'INDIVIDUAL' ? 'Индивидуальная' : 'Групповая';

  await whatsappClient.sendButtons(
    input.phone,
    `Подтвердите запись 📋\n\n📍 Филиал: ${branch?.name || '—'}\n🏃 Тип: ${typeLabel}\n📅 Дата: ${booking?.date || '—'}\n⏰ Время: ${booking?.timeSlot || '—'}\n\nВсё верно?`,
    [
      { id: 'bconfirm_yes', title: '✅ Подтвердить' },
      { id: 'bconfirm_no', title: '✏️ Изменить' },
      { id: 'back_main', title: '❌ Отменить' },
    ]
  );
}
