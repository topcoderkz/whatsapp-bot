'use server';

import { prisma } from './db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { getBroadcastTemplate, summarizeBroadcast } from './broadcast-templates';

// ─── Branches ───

export async function updateBranch(id: number, formData: FormData) {
  await prisma.branch.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      managerPhone: formData.get('managerPhone') as string,
      workingHours: formData.get('workingHours') as string,
    },
  });
  revalidatePath('/branches');
}

export async function toggleBranch(id: number, isActive: boolean) {
  await prisma.branch.update({ where: { id }, data: { isActive } });
  revalidatePath('/branches');
}

// ─── Pricing ───

export async function updateMembershipPrice(id: number, price: number) {
  await prisma.membership.update({ where: { id }, data: { price } });
  revalidatePath('/pricing');
}

export async function toggleMembership(id: number, isActive: boolean) {
  await prisma.membership.update({ where: { id }, data: { isActive } });
  revalidatePath('/pricing');
}

// ─── Trainers ───

export async function createTrainer(formData: FormData) {
  await prisma.trainer.create({
    data: {
      branchId: parseInt(formData.get('branchId') as string, 10),
      name: formData.get('name') as string,
      specialization: (formData.get('specialization') as string) || null,
      photoUrl: (formData.get('photoUrl') as string) || null,
      bio: (formData.get('bio') as string) || null,
      experienceYears: formData.get('experienceYears') ? parseInt(formData.get('experienceYears') as string, 10) : null,
    },
  });
  revalidatePath('/trainers');
}

export async function updateTrainer(id: number, formData: FormData) {
  await prisma.trainer.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
      branchId: formData.get('branchId') ? parseInt(formData.get('branchId') as string, 10) : undefined,
      specialization: (formData.get('specialization') as string) || null,
      photoUrl: (formData.get('photoUrl') as string) || null,
      bio: (formData.get('bio') as string) || null,
      experienceYears: formData.get('experienceYears') ? parseInt(formData.get('experienceYears') as string, 10) : null,
    },
  });
  revalidatePath('/trainers');
}

export async function toggleTrainer(id: number, isActive: boolean) {
  await prisma.trainer.update({
    where: { id },
    data: {
      isActive,
      deactivatedAt: isActive ? null : new Date(),
    },
  });
  revalidatePath('/trainers');
}

// ─── Group Classes ───

export async function createGroupClass(formData: FormData) {
  const scheduleStr = formData.get('schedule') as string;
  let schedule = {};
  try { schedule = JSON.parse(scheduleStr); } catch {}

  await prisma.groupClass.create({
    data: {
      branchId: parseInt(formData.get('branchId') as string, 10),
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      trainerId: formData.get('trainerId') ? parseInt(formData.get('trainerId') as string, 10) : null,
      capacity: parseInt(formData.get('capacity') as string || '20', 10),
      schedule,
    },
  });
  revalidatePath('/classes');
}

export async function updateGroupClass(id: number, formData: FormData) {
  const scheduleStr = formData.get('schedule') as string;
  let schedule = {};
  try { schedule = JSON.parse(scheduleStr); } catch {}

  await prisma.groupClass.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      trainerId: formData.get('trainerId') ? parseInt(formData.get('trainerId') as string, 10) : null,
      capacity: parseInt(formData.get('capacity') as string || '20', 10),
      schedule,
    },
  });
  revalidatePath('/classes');
}

export async function toggleGroupClass(id: number, isActive: boolean) {
  await prisma.groupClass.update({ where: { id }, data: { isActive } });
  revalidatePath('/classes');
}

// ─── Promotions ───

export async function createPromotion(formData: FormData) {
  const branchIds = (formData.getAll('branchIds') as string[]).map(Number).filter(Number.isFinite);
  await prisma.promotion.create({
    data: {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      conditions: (formData.get('conditions') as string) || null,
      imageUrl: (formData.get('imageUrl') as string) || null,
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
      // Empty list ⇒ no rows in join table ⇒ applies to all branches (per app convention).
      branches: branchIds.length > 0 ? { connect: branchIds.map((id) => ({ id })) } : undefined,
    },
  });
  revalidatePath('/promotions');
}

export async function updatePromotionBranches(promotionId: number, formData: FormData) {
  const branchIds = (formData.getAll('branchIds') as string[]).map(Number).filter(Number.isFinite);
  await prisma.promotion.update({
    where: { id: promotionId },
    data: {
      // `set` replaces the entire branch set (empty array clears → applies-to-all).
      branches: { set: branchIds.map((id) => ({ id })) },
    },
  });
  revalidatePath('/promotions');
}

export async function updatePromotion(id: number, formData: FormData) {
  await prisma.promotion.update({
    where: { id },
    data: {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      conditions: (formData.get('conditions') as string) || null,
      imageUrl: (formData.get('imageUrl') as string) || null,
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
    },
  });
  revalidatePath('/promotions');
}

export async function togglePromotion(id: number, isActive: boolean) {
  await prisma.promotion.update({ where: { id }, data: { isActive } });
  revalidatePath('/promotions');
}

// ─── Bookings ───

export async function confirmBookingAction(id: number) {
  // Call bot admin API to confirm + send WhatsApp notification
  try {
    const res = await fetch(`${process.env.BOT_INTERNAL_URL || `http://localhost:${process.env.BOT_PORT || 3000}`}/admin/bookings/${id}/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer admin-internal`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Bot API error');
  } catch {
    // Fallback: update directly in DB if bot is not running
    await prisma.booking.update({ where: { id }, data: { status: 'CONFIRMED' } });
  }
  revalidatePath('/bookings');
}

export async function cancelBookingAction(id: number) {
  try {
    const res = await fetch(`${process.env.BOT_INTERNAL_URL || `http://localhost:${process.env.BOT_PORT || 3000}`}/admin/bookings/${id}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer admin-internal`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Bot API error');
  } catch {
    await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
  }
  revalidatePath('/bookings');
}

// ─── Clients ───

export async function createClient(formData: FormData) {
  const phone = formData.get('phone') as string;
  await prisma.client.upsert({
    where: { phone },
    update: {
      name: (formData.get('name') as string) || null,
      branchId: formData.get('branchId') ? parseInt(formData.get('branchId') as string, 10) : null,
      isActive: true,
    },
    create: {
      phone,
      name: (formData.get('name') as string) || null,
      branchId: formData.get('branchId') ? parseInt(formData.get('branchId') as string, 10) : null,
      source: 'MANUAL',
    },
  });
  revalidatePath('/clients');
}

export async function toggleClient(id: number, isActive: boolean) {
  await prisma.client.update({ where: { id }, data: { isActive } });
  revalidatePath('/clients');
}

export async function importClients(clients: Array<{ phone: string; name?: string; branch?: string }>) {
  const branches = await prisma.branch.findMany();
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of clients) {
    if (!row.phone) { errors++; continue; }

    const phone = row.phone.replace(/\D/g, '');
    if (phone.length < 10) { errors++; continue; }

    const normalizedPhone = phone.startsWith('8') ? `+7${phone.slice(1)}` : phone.startsWith('7') ? `+${phone}` : `+${phone}`;

    const branchMatch = row.branch ? branches.find(b =>
      b.name.toLowerCase().includes(row.branch!.toLowerCase()) ||
      b.slug.toLowerCase().includes(row.branch!.toLowerCase())
    ) : null;

    try {
      const existing = await prisma.client.findUnique({ where: { phone: normalizedPhone } });
      if (existing) { skipped++; continue; }

      await prisma.client.create({
        data: {
          phone: normalizedPhone,
          name: row.name || null,
          branchId: branchMatch?.id || null,
          source: 'CSV_IMPORT',
        },
      });
      imported++;
    } catch {
      skipped++;
    }
  }

  revalidatePath('/clients');
  return { imported, skipped, errors };
}

// ─── Broadcasts ───

function readBroadcastFormData(formData: FormData) {
  const templateId = formData.get('templateId') as string;
  const template = getBroadcastTemplate(templateId);
  if (!template) {
    throw new Error(`Неизвестный шаблон: ${templateId}`);
  }

  // Collect one value per template field, in variableIndex order.
  const values = template.fields.map((f) => {
    const raw = (formData.get(`var_${f.variableIndex}`) as string | null) ?? '';
    if (raw.length > f.maxLength) {
      throw new Error(`Поле "${f.label}" длиннее ${f.maxLength} символов`);
    }
    return raw;
  });

  return {
    title: formData.get('title') as string,
    templateName: template.id,
    templateVariables: values,
    messageText: summarizeBroadcast(template, values),
    targetBranchId: formData.get('targetBranchId')
      ? parseInt(formData.get('targetBranchId') as string, 10)
      : null,
    targetFilter: (formData.get('targetFilter') as any) || 'ALL',
  };
}

export async function createBroadcast(formData: FormData) {
  const data = readBroadcastFormData(formData);
  const broadcast = await prisma.broadcastMessage.create({ data });
  revalidatePath('/broadcasts');
  return broadcast.id;
}

export async function updateBroadcast(id: number, formData: FormData) {
  const existing = await prisma.broadcastMessage.findUnique({ where: { id } });
  if (!existing || existing.status !== 'DRAFT') {
    throw new Error('Можно редактировать только черновики');
  }
  const data = readBroadcastFormData(formData);
  await prisma.broadcastMessage.update({ where: { id }, data });
  revalidatePath('/broadcasts');
}

function botUrl(path: string) {
  const base = process.env.BOT_INTERNAL_URL || `http://localhost:${process.env.BOT_PORT || 3000}`;
  return `${base}${path}`;
}

async function callBot(path: string, body?: any) {
  try {
    const res = await fetch(botUrl(path), {
      method: 'POST',
      headers: {
        Authorization: `Bearer admin-internal`,
        'Content-Type': 'application/json',
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: json.error || 'Bot API error' };
    }
    return json;
  } catch {
    return { error: 'Бот не запущен. Запустите бот и попробуйте снова.' };
  }
}

// Send-test snapshots only the first 20 matching clients — for smoke tests
// before committing the full campaign.
export async function startTestBatch(broadcastId: number) {
  const result = await callBot('/admin/broadcasts/send', { broadcastId, scope: 'test' });
  revalidatePath('/broadcasts');
  revalidatePath(`/broadcasts/${broadcastId}`);
  return result;
}

// Full campaign — every client matching the audience filter.
export async function startFullCampaign(broadcastId: number) {
  const result = await callBot('/admin/broadcasts/send', { broadcastId, scope: 'all' });
  revalidatePath('/broadcasts');
  revalidatePath(`/broadcasts/${broadcastId}`);
  return result;
}

export async function retryFailedRecipients(broadcastId: number) {
  const result = await callBot(`/admin/broadcasts/${broadcastId}/retry`);
  revalidatePath(`/broadcasts/${broadcastId}`);
  return result;
}

export async function cancelBroadcast(broadcastId: number) {
  const result = await callBot(`/admin/broadcasts/${broadcastId}/cancel`);
  revalidatePath('/broadcasts');
  revalidatePath(`/broadcasts/${broadcastId}`);
  return result;
}

export async function deleteBroadcast(broadcastId: number) {
  const existing = await prisma.broadcastMessage.findUnique({ where: { id: broadcastId } });
  if (!existing) {
    throw new Error('Рассылка не найдена');
  }

  // Delete related notification logs first (foreign key constraint).
  // broadcast_recipients has ON DELETE CASCADE so it goes with the broadcast.
  await prisma.notificationLog.deleteMany({
    where: { broadcastId },
  });

  await prisma.broadcastMessage.delete({
    where: { id: broadcastId },
  });

  revalidatePath('/broadcasts');
}

// Preview: how many recipients would this filter match right now? Used by the
// compose form to show live count before Send.
export async function previewBroadcastAudience(
  targetFilter: 'ALL' | 'SUBSCRIBED' | 'BRANCH',
  targetBranchId: number | null
): Promise<{ count: number }> {
  const where: any = { isActive: true };
  if (targetFilter === 'SUBSCRIBED') where.isSubscribed = true;
  if (targetFilter === 'BRANCH' && targetBranchId) where.branchId = targetBranchId;
  const count = await prisma.client.count({ where });
  return { count };
}
