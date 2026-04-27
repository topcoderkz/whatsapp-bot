import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handleGroupClasses(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection?.startsWith('class_')) {
    const classId = parseInt(selection.replace('class_', ''), 10);
    await sessionStore.update(input.phone, { state: State.CLASS_DETAIL });
    const { handleClassDetail } = await import('./class-detail');
    await handleClassDetail(input, { ...session, state: State.CLASS_DETAIL }, classId);
    return;
  }

  if (selection === 'back_bmenu') {
    await sessionStore.update(input.phone, { state: State.BRANCH_MENU });
    const { handleBranchMenu } = await import('./branch-menu');
    await handleBranchMenu(input, session);
    return;
  }

  if (!session.branchId) {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  const classes = await (prisma as any).groupClass.findMany({
    where: { branchId: session.branchId },
    include: { trainer: true },
    orderBy: { name: 'asc' },
  });

  if (classes.length === 0) {
    await whatsappClient.sendButtons(
      input.phone,
      'Расписание групповых занятий пока формируется 📋\n\nСвяжитесь с менеджером для уточнения.',
      [
        { id: 'back_bmenu', title: '⬅️ Назад' },
      ]
    );
    return;
  }

  const rows = classes.slice(0, 9).map((c: any) => ({
    id: `class_${c.id}`,
    title: c.name.slice(0, 24),
    description: c.trainer ? `Тренер: ${c.trainer.name}` : undefined,
  }));

  rows.push({ id: 'back_bmenu', title: '⬅️ Назад', description: 'В меню филиала' });

  await whatsappClient.sendList(
    input.phone,
    'Групповые занятия 👥\n\nВыберите занятие для подробной информации:',
    'Занятия',
    [{ title: 'Расписание', rows }]
  );
}
