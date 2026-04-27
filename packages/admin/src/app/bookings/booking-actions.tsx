'use client';

import { confirmBookingAction, cancelBookingAction } from '@/lib/actions';
import { ConfirmButton } from '@/components/confirm-dialog';

export function BookingActions({ bookingId }: { bookingId: number }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <ConfirmButton
        onConfirm={() => confirmBookingAction(bookingId)}
        label="Подтвердить"
        confirmMessage="Клиент получит уведомление"
        variant="primary"
      />
      <ConfirmButton
        onConfirm={() => cancelBookingAction(bookingId)}
        label="Отменить"
        confirmMessage="Клиент получит уведомление об отмене"
        variant="danger"
      />
    </div>
  );
}
