import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';

export async function handleTrainerProfile(input: UserInput, session: SessionData, trainerId?: number): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'back_trainers') {
    await sessionStore.update(input.phone, { state: State.TRAINERS });
    const { handleTrainers } = await import('./trainers');
    await handleTrainers(input, session);
    return;
  }

  if (selection === 'back_bmenu') {
    await sessionStore.update(input.phone, { state: State.BRANCH_MENU });
    const { handleBranchMenu } = await import('./branch-menu');
    await handleBranchMenu(input, session);
    return;
  }

  if (!trainerId) {
    await sessionStore.update(input.phone, { state: State.TRAINERS });
    const { handleTrainers } = await import('./trainers');
    await handleTrainers(input, session);
    return;
  }

  const trainer = await (prisma as any).trainer.findFirst({ where: { id: trainerId } });

  if (!trainer) {
    await whatsappClient.sendText(input.phone, 'Тренер не найден.');
    await sessionStore.update(input.phone, { state: State.TRAINERS });
    const { handleTrainers } = await import('./trainers');
    await handleTrainers(input, session);
    return;
  }

  // Send photo if available
  if (trainer.photoUrl) {
    await whatsappClient.sendImage(input.phone, trainer.photoUrl, trainer.name);
  }

  let text = `${trainer.name} 👨‍🏫\n\n`;
  if (trainer.specialization) text += `🎯 Специализация: ${trainer.specialization}\n`;
  if (trainer.experienceYears) text += `📅 Опыт: ${trainer.experienceYears} лет\n`;
  if (trainer.bio) text += `\n${trainer.bio}`;

  await whatsappClient.sendButtons(
    input.phone,
    text,
    [
      { id: 'back_trainers', title: '⬅️ К тренерам' },
      { id: 'back_bmenu', title: '🏠 Меню филиала' },
    ]
  );
}
