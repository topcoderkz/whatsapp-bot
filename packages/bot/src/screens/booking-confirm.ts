import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { bookingService } from '../services/booking.service';
import { t, type Language } from '../locales';

export async function handleBookingConfirm(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
  const selection = input.listId || input.buttonId;

  if (selection === 'bconfirm_yes') {
    // Create the booking
    const booking = session.booking;
    if (!booking?.branchId || !booking.workoutType || !booking.date || !booking.timeSlot) {
      await whatsappClient.sendText(input.phone, t(lang, 'booking.confirm.incomplete'));
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
      const typeLabel = booking.workoutType === 'INDIVIDUAL'
        ? t(lang, 'booking.type.individual_label')
        : t(lang, 'booking.type.group_label');

      await whatsappClient.sendButtons(
        input.phone,
        `${t(lang, 'booking.confirm.success_title')}\n\n${t(lang, 'booking.confirm.branch')} ${branch?.name || ''}\n${t(lang, 'booking.confirm.type')} ${typeLabel}\n${t(lang, 'booking.confirm.date')} ${booking.date}\n${t(lang, 'booking.confirm.time')} ${booking.timeSlot}\n\n${t(lang, 'booking.confirm.manager_contact')}`,
        [
          { id: 'back_main', title: t(lang, 'nav.main_menu') },
        ]
      );

      // Clear booking data from session
      await sessionStore.update(input.phone, { state: State.WELCOME, booking: undefined });
    } catch (err) {
      console.error('[BookingConfirm] Error creating booking:', err);
      await whatsappClient.sendButtons(
        input.phone,
        t(lang, 'booking.confirm.error_message'),
        [
          { id: 'back_main', title: t(lang, 'nav.main_menu') },
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

  const typeLabel = booking?.workoutType === 'INDIVIDUAL'
    ? t(lang, 'booking.type.individual_label')
    : t(lang, 'booking.type.group_label');

  await whatsappClient.sendButtons(
    input.phone,
    `${t(lang, 'booking.confirm.title')} 📋\n\n${t(lang, 'booking.confirm.branch')} ${branch?.name || '—'}\n${t(lang, 'booking.confirm.type')} ${typeLabel}\n${t(lang, 'booking.confirm.date')} ${booking?.date || '—'}\n${t(lang, 'booking.confirm.time')} ${booking?.timeSlot || '—'}\n\n${t(lang, 'booking.confirm.all_correct')}`,
    [
      { id: 'bconfirm_yes', title: t(lang, 'booking.confirm.confirm') },
      { id: 'bconfirm_no', title: t(lang, 'booking.confirm.edit') },
      { id: 'back_main', title: t(lang, 'booking.confirm.cancel') },
    ]
  );
}
