import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { config } from '../config';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 5000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const notificationService = {
  /**
   * Notify branch manager about a new booking via WhatsApp template.
   * Retries up to 2 times on failure. Logs everything to notification_logs.
   */
  async notifyManagerNewBooking(booking: any): Promise<void> {
    const branch = booking.branch || await (prisma as any).branch.findFirst({ where: { id: booking.branchId } });
    if (!branch) {
      console.error(`[Notification] Branch not found for booking ${booking.id}`);
      return;
    }

    const managerPhone = branch.managerPhone;
    if (!managerPhone) {
      console.error(`[Notification] No manager phone for branch ${branch.name}`);
      return;
    }

    // Create notification log
    const log = await (prisma as any).notificationLog.create({
      data: {
        bookingId: booking.id,
        recipientPhone: managerPhone,
        templateName: config.templates.bookingNotification,
        status: 'PENDING',
      },
    });

    const typeLabel = booking.workoutType === 'INDIVIDUAL' ? 'Индивидуальная' : 'Групповая';
    const dateStr = new Date(booking.date).toLocaleDateString('ru-RU');

    // Template body parameters:
    // {{1}} = branch name, {{2}} = client phone, {{3}} = type, {{4}} = date, {{5}} = time
    const params = [
      branch.name,
      booking.clientPhone,
      typeLabel,
      dateStr,
      booking.timeSlot,
    ];

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await whatsappClient.sendTemplate(
          managerPhone,
          config.templates.bookingNotification,
          params
        );

        // Update log with success
        await (prisma as any).notificationLog.update({
          where: { id: log.id },
          data: {
            status: 'SENT',
            waMessageId: result.messageId,
            sentAt: new Date(),
          },
        });

        console.log(`[Notification] Manager notified for booking ${booking.id} → ${managerPhone}`);
        return;
      } catch (err) {
        lastError = err as Error;
        console.error(`[Notification] Attempt ${attempt + 1} failed:`, (err as Error).message);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
        }
      }
    }

    // All retries exhausted
    await (prisma as any).notificationLog.update({
      where: { id: log.id },
      data: {
        status: 'FAILED',
        errorMessage: lastError?.message || 'Unknown error after retries',
      },
    });

    console.error(`[Notification] FAILED to notify manager for booking ${booking.id} after ${MAX_RETRIES + 1} attempts`);
  },

  /**
   * Notify client that their booking was confirmed (sent by admin action).
   */
  async notifyClientBookingConfirmed(booking: any): Promise<void> {
    try {
      const branch = booking.branch || await (prisma as any).branch.findFirst({ where: { id: booking.branchId } });
      const dateStr = new Date(booking.date).toLocaleDateString('ru-RU');

      const result = await whatsappClient.sendTemplate(
        booking.clientPhone,
        config.templates.bookingConfirmation,
        [branch?.name || '', dateStr, booking.timeSlot]
      );

      await (prisma as any).notificationLog.create({
        data: {
          bookingId: booking.id,
          recipientPhone: booking.clientPhone,
          templateName: config.templates.bookingConfirmation,
          status: 'SENT',
          waMessageId: result.messageId,
          sentAt: new Date(),
        },
      });
    } catch (err) {
      console.error(`[Notification] Failed to notify client of confirmation:`, err);
    }
  },

  /**
   * Notify client that their booking was cancelled.
   */
  async notifyClientBookingCancelled(booking: any): Promise<void> {
    try {
      const branch = booking.branch || await (prisma as any).branch.findFirst({ where: { id: booking.branchId } });
      const dateStr = new Date(booking.date).toLocaleDateString('ru-RU');

      // Use a simple text message since the client recently interacted (within 24h window)
      await whatsappClient.sendText(
        booking.clientPhone,
        `Ваша запись отменена ❌\n\n📍 ${branch?.name || ''}\n📅 ${dateStr}\n⏰ ${booking.timeSlot}\n\nЕсли хотите записаться снова, напишите нам.`
      );
    } catch (err) {
      console.error(`[Notification] Failed to notify client of cancellation:`, err);
    }
  },

  /**
   * Send broadcast message to a list of recipients.
   */
  async sendBroadcast(broadcastId: number, recipients: string[]): Promise<{ sent: number; failed: number }> {
    const broadcast = await (prisma as any).broadcastMessage.findUnique({ where: { id: broadcastId } });
    if (!broadcast) throw new Error('Broadcast not found');

    let sent = 0;
    let failed = 0;

    // Update status to SENDING
    await (prisma as any).broadcastMessage.update({
      where: { id: broadcastId },
      data: { status: 'SENDING' },
    });

    for (const phone of recipients) {
      try {
        const result = await whatsappClient.sendTemplate(
          phone,
          broadcast.templateName || config.templates.broadcast,
          [broadcast.messageText]
        );

        await (prisma as any).notificationLog.create({
          data: {
            broadcastId: broadcast.id,
            recipientPhone: phone,
            templateName: broadcast.templateName || config.templates.broadcast,
            status: 'SENT',
            waMessageId: result.messageId,
            sentAt: new Date(),
          },
        });

        sent++;
      } catch (err) {
        await (prisma as any).notificationLog.create({
          data: {
            broadcastId: broadcast.id,
            recipientPhone: phone,
            templateName: broadcast.templateName || config.templates.broadcast,
            status: 'FAILED',
            errorMessage: (err as Error).message,
          },
        });
        failed++;
      }

      // Rate limit: ~1 message per 100ms = ~600/min (safe for WhatsApp)
      await sleep(100);
    }

    // Update broadcast record
    await (prisma as any).broadcastMessage.update({
      where: { id: broadcastId },
      data: {
        status: failed === recipients.length ? 'FAILED' : 'SENT',
        sentCount: sent,
        failedCount: failed,
        sentAt: new Date(),
      },
    });

    return { sent, failed };
  },
};
