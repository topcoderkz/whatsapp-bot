import { prisma } from '../db/client';
import { notificationService } from './notification.service';

interface CreateBookingInput {
  clientPhone: string;
  branchId: number;
  workoutType: 'INDIVIDUAL' | 'GROUP';
  date: string;
  timeSlot: string;
  trainerId?: number;
}

export const bookingService = {
  async createBooking(input: CreateBookingInput) {
    // Create booking with PENDING status
    const booking = await (prisma as any).booking.create({
      data: {
        clientPhone: input.clientPhone,
        branchId: input.branchId,
        workoutType: input.workoutType,
        date: new Date(input.date),
        timeSlot: input.timeSlot,
        trainerId: input.trainerId || null,
        status: 'PENDING',
      },
      include: {
        branch: true,
      },
    });

    // Notify branch manager (fire and forget — don't block booking creation)
    notificationService.notifyManagerNewBooking(booking).catch((err) => {
      console.error('[BookingService] Failed to notify manager:', err);
    });

    return booking;
  },

  async confirmBooking(bookingId: number) {
    const booking = await (prisma as any).booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: { branch: true },
    });

    // Notify client of confirmation
    notificationService.notifyClientBookingConfirmed(booking).catch((err) => {
      console.error('[BookingService] Failed to notify client:', err);
    });

    return booking;
  },

  async cancelBooking(bookingId: number) {
    const booking = await (prisma as any).booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: { branch: true },
    });

    // Notify client of cancellation
    notificationService.notifyClientBookingCancelled(booking).catch((err) => {
      console.error('[BookingService] Failed to notify client:', err);
    });

    return booking;
  },

  async getPendingBookings(branchId?: number) {
    const where: any = { status: 'PENDING' };
    if (branchId) where.branchId = branchId;

    return (prisma as any).booking.findMany({
      where,
      include: { branch: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getBookingsByDate(branchId: number, date: string) {
    return (prisma as any).booking.findMany({
      where: {
        branchId,
        date: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { timeSlot: 'asc' },
    });
  },
};
