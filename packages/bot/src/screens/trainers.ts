import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handleTrainers(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection?.startsWith('trainer_')) {
    const trainerId = parseInt(selection.replace('trainer_', ''), 10);
    await sessionStore.update(input.phone, { state: State.TRAINER_PROFILE });
    const { handleTrainerProfile } = await import('./trainer-profile');
    await handleTrainerProfile(input, { ...session, state: State.TRAINER_PROFILE }, trainerId);
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

  const trainers = await (prisma as any).trainer.findMany({
    where: { branchId: session.branchId },
    orderBy: { name: 'asc' },
  });

  if (trainers.length === 0) {
    await whatsappClient.sendButtons(
      input.phone,
      'Информация о тренерах скоро появится 👨‍🏫\n\nСвяжитесь с менеджером для уточнения.',
      [
        { id: 'back_bmenu', title: '⬅️ Назад' },
      ]
    );
    return;
  }

  const rows = trainers.slice(0, 9).map((t: any) => ({
    id: `trainer_${t.id}`,
    title: t.name.slice(0, 24),
    description: t.specialization?.slice(0, 72) || undefined,
  }));

  rows.push({ id: 'back_bmenu', title: '⬅️ Назад', description: 'В меню филиала' });

  await whatsappClient.sendList(
    input.phone,
    'Наши тренеры 👨‍🏫\n\nВыберите тренера для подробной информации:',
    'Тренеры',
    [{ title: 'Тренеры', rows }]
  );
}
