import { prisma } from '../db/client';

interface RecordMessageInput {
  phone: string;
  state: string;
  branchId?: number | null;
}

export const leadService = {
  async recordMessage({ phone, state, branchId }: RecordMessageInput) {
    await (prisma as any).lead.upsert({
      where: { phone },
      create: {
        phone,
        lastState: state,
        branchId: branchId ?? null,
        messageCount: 1,
      },
      update: {
        lastState: state,
        branchId: branchId ?? undefined,
        messageCount: { increment: 1 },
      },
    });
  },

  async markBooked(phone: string) {
    await (prisma as any).lead.updateMany({
      where: { phone },
      data: { hasBooked: true },
    });
  },
};
