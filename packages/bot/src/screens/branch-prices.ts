import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handleBranchPrices(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'bp_monthly') {
    await sessionStore.update(input.phone, { state: State.BRANCH_PRICES_MONTHLY });
    await handleBranchPricesMonthly(input, session);
    return;
  }

  if (selection === 'bp_longterm') {
    await sessionStore.update(input.phone, { state: State.BRANCH_PRICES_LONGTERM });
    await handleBranchPricesLongterm(input, session);
    return;
  }

  if (selection === 'bp_manager') {
    await sessionStore.update(input.phone, { state: State.CONTACT_MANAGER });
    const { handleContactManager } = await import('./contact-manager');
    await handleContactManager(input, session);
    return;
  }

  if (selection === 'back_bmenu') {
    await sessionStore.update(input.phone, { state: State.BRANCH_MENU });
    const { handleBranchMenu } = await import('./branch-menu');
    await handleBranchMenu(input, session);
    return;
  }

  const branch = session.branchId
    ? await (prisma as any).branch.findFirst({ where: { id: session.branchId } })
    : null;

  if (!branch) {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  await whatsappClient.sendButtons(
    input.phone,
    `Цены филиала ${branch.name} 📋\n\nВыберите тип абонемента:`,
    [
      { id: 'bp_monthly', title: '📋 На 1 месяц' },
      { id: 'bp_longterm', title: '📋 Долгосрочные' },
      { id: 'back_bmenu', title: '⬅️ Назад' },
    ]
  );
}

export async function handleBranchPricesMonthly(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'back_bprices') {
    await sessionStore.update(input.phone, { state: State.BRANCH_PRICES });
    await handleBranchPrices(input, session);
    return;
  }

  if (selection === 'bp_manager') {
    await sessionStore.update(input.phone, { state: State.CONTACT_MANAGER });
    const { handleContactManager } = await import('./contact-manager');
    await handleContactManager(input, session);
    return;
  }

  const branch = await (prisma as any).branch.findFirst({ where: { id: session.branchId } });
  if (!branch) return;

  const memberships = await (prisma as any).membership.findMany({
    where: { branchId: session.branchId, durationMonths: 1 },
    orderBy: { displayOrder: 'asc' },
  });

  const lines = memberships.map((m: any) => {
    const timeLabel = m.timeRange || '';
    return `• ${m.name}${timeLabel ? `, ${timeLabel}` : ''} — ${m.price.toLocaleString('ru-RU')} тг`;
  });

  const text = `Абонементы на 1 месяц — ${branch.name} 📋\n\n${lines.join('\n')}\n\nДля покупки свяжитесь с менеджером:`;

  await whatsappClient.sendButtons(
    input.phone,
    text,
    [
      { id: 'bp_manager', title: '📞 Менеджер' },
      { id: 'back_bprices', title: '⬅️ Назад' },
    ]
  );
}

export async function handleBranchPricesLongterm(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'back_bprices') {
    await sessionStore.update(input.phone, { state: State.BRANCH_PRICES });
    await handleBranchPrices(input, session);
    return;
  }

  if (selection === 'bp_manager') {
    await sessionStore.update(input.phone, { state: State.CONTACT_MANAGER });
    const { handleContactManager } = await import('./contact-manager');
    await handleContactManager(input, session);
    return;
  }

  const branch = await (prisma as any).branch.findFirst({ where: { id: session.branchId } });
  if (!branch) return;

  const memberships = await (prisma as any).membership.findMany({
    where: {
      branchId: session.branchId,
      durationMonths: { gt: 1 },
    },
    orderBy: { durationMonths: 'asc' },
  });

  const lines = memberships.map((m: any) => {
    return `• ${m.name} — ${m.price.toLocaleString('ru-RU')} тг`;
  });

  const text = `Долгосрочные абонементы — ${branch.name} 📋\n\n${lines.join('\n')}\n\nВыгоднее месячного! Для покупки свяжитесь с менеджером:`;

  await whatsappClient.sendButtons(
    input.phone,
    text,
    [
      { id: 'bp_manager', title: '📞 Менеджер' },
      { id: 'back_bprices', title: '⬅️ Назад' },
    ]
  );
}
