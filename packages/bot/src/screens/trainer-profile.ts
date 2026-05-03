import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handleTrainerProfile(input: UserInput, session: SessionData, trainerId?: number): Promise<void> {
  const lang = (session.language || 'ru') as Language;
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
    await whatsappClient.sendText(input.phone, t(lang, 'trainers.not_found'));
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
  if (trainer.specialization) text += `🎯 ${t(lang, 'trainers.specialization')}: ${trainer.specialization}\n`;
  if (trainer.experienceYears) text += `📅 ${t(lang, 'trainers.experience')}: ${trainer.experienceYears} ${t(lang, 'trainers.experience_years')}\n`;
  if (trainer.bio) text += `\n${trainer.bio}`;

  await whatsappClient.sendButtons(
    input.phone,
    text,
    [
      { id: 'back_trainers', title: t(lang, 'trainers.back_to_trainers') },
      { id: 'back_bmenu', title: t(lang, 'nav.branch_menu') },
    ]
  );
}
