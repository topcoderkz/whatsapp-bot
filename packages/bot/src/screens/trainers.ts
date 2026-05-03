import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handleTrainers(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
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
      `${t(lang, 'trainers.no_trainers')}\n\n${t(lang, 'trainers.contact_manager')}`,
      [
        { id: 'back_bmenu', title: t(lang, 'back') },
      ]
    );
    return;
  }

  const rows = trainers.slice(0, 9).map((tr: any) => ({
    id: `trainer_${tr.id}`,
    title: tr.name.slice(0, 24),
    description: tr.specialization?.slice(0, 72) || undefined,
  }));

  rows.push({ id: 'back_bmenu', title: t(lang, 'back'), description: t(lang, 'nav.to_branch') });

  await whatsappClient.sendList(
    input.phone,
    `${t(lang, 'trainers.title')} 👨‍🏫\n\n${t(lang, 'trainers.select_trainer')}`,
    t(lang, 'trainers.title'),
    [{ title: t(lang, 'trainers.title'), rows }]
  );
}
