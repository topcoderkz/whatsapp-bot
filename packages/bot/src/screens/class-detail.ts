import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handleClassDetail(input: UserInput, session: SessionData, classId?: number): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'back_classes') {
    await sessionStore.update(input.phone, { state: State.GROUP_CLASSES });
    const { handleGroupClasses } = await import('./group-classes');
    await handleGroupClasses(input, session);
    return;
  }

  if (selection === 'back_bmenu') {
    await sessionStore.update(input.phone, { state: State.BRANCH_MENU });
    const { handleBranchMenu } = await import('./branch-menu');
    await handleBranchMenu(input, session);
    return;
  }

  if (!classId) {
    await sessionStore.update(input.phone, { state: State.GROUP_CLASSES });
    const { handleGroupClasses } = await import('./group-classes');
    await handleGroupClasses(input, session);
    return;
  }

  const groupClass = await (prisma as any).groupClass.findFirst({
    where: { id: classId },
    include: { trainer: true },
  });

  if (!groupClass) {
    await whatsappClient.sendText(input.phone, 'Занятие не найдено.');
    await sessionStore.update(input.phone, { state: State.GROUP_CLASSES });
    const { handleGroupClasses } = await import('./group-classes');
    await handleGroupClasses(input, session);
    return;
  }

  // Format schedule from JSON
  const schedule = groupClass.schedule as Record<string, string>;
  const scheduleLines = Object.entries(schedule)
    .map(([day, time]) => `• ${day}: ${time}`)
    .join('\n');

  let text = `${groupClass.name} 👥\n\n`;
  if (groupClass.description) text += `${groupClass.description}\n\n`;
  if (groupClass.trainer) text += `👨‍🏫 Тренер: ${groupClass.trainer.name}\n`;
  if (groupClass.capacity) text += `👥 Мест: ${groupClass.capacity}\n`;
  text += `\n📅 Расписание:\n${scheduleLines || 'Уточняйте у менеджера'}`;

  await whatsappClient.sendButtons(
    input.phone,
    text,
    [
      { id: 'back_classes', title: '⬅️ К занятиям' },
      { id: 'back_bmenu', title: '🏠 Меню филиала' },
    ]
  );
}
