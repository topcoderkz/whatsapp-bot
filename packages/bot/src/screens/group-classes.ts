import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handleGroupClasses(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
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
      `${t(lang, 'classes.no_classes')}\n\n${t(lang, 'classes.contact_manager')}`,
      [
        { id: 'back_bmenu', title: t(lang, 'back') },
      ]
    );
    return;
  }

  const rows = classes.slice(0, 9).map((c: any) => ({
    id: `class_${c.id}`,
    title: c.name.slice(0, 24),
    description: c.trainer ? `${t(lang, 'classes.trainer_label')} ${c.trainer.name}` : undefined,
  }));

  rows.push({ id: 'back_bmenu', title: t(lang, 'back'), description: t(lang, 'nav.to_branch') });

  await whatsappClient.sendList(
    input.phone,
    `${t(lang, 'classes.title')} 👥\n\n${t(lang, 'classes.select_class')}`,
    t(lang, 'classes.classes_label'),
    [{ title: t(lang, 'classes.schedule'), rows }]
  );
}
