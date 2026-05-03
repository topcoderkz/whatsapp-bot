import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handleLanguageSelection(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId;

  if (selection === 'lang_ru') {
    await sessionStore.update(input.phone, { language: 'ru', state: State.WELCOME });
    const { handleWelcome } = await import('./welcome');
    await handleWelcome(input, { ...session, language: 'ru', state: State.WELCOME });
    return;
  }

  if (selection === 'lang_kk') {
    await sessionStore.update(input.phone, { language: 'kk', state: State.WELCOME });
    const { handleWelcome } = await import('./welcome');
    await handleWelcome(input, { ...session, language: 'kk', state: State.WELCOME });
    return;
  }

  if (selection === 'lang_en') {
    await sessionStore.update(input.phone, { language: 'en', state: State.WELCOME });
    const { handleWelcome } = await import('./welcome');
    await handleWelcome(input, { ...session, language: 'en', state: State.WELCOME });
    return;
  }

  // Show language selection
  await whatsappClient.sendList(
    input.phone,
    t('ru', 'language.title'),
    'Таңдау / Select',
    [
      {
        title: 'Тіл / Language',
        rows: [
          { id: 'lang_ru', title: '🇷🇺 Русский', description: '' },
          { id: 'lang_kk', title: '🇰🇿 Қазақша', description: '' },
          { id: 'lang_en', title: '🇬🇧 English', description: '' },
        ],
      },
    ]
  );

  await sessionStore.update(input.phone, { state: State.LANGUAGE_SELECTION });
}
