import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handlePricesOverview(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
  const selection = input.listId || input.buttonId;

  if (selection === 'prices_branch') {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  if (selection === 'prices_manager') {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.CONTACT_MANAGER });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  if (selection === 'back_main') {
    const { handleWelcome } = await import('./welcome');
    await sessionStore.update(input.phone, { state: State.WELCOME });
    await handleWelcome(input, session);
    return;
  }

  // Show prices overview
  const currency = t(lang, 'prices.currency');
  const pricesFrom = lang === 'en' ? `19,000 ${currency}` : `19 000 ${currency}`;
  const yearFrom = lang === 'en' ? `130,000 ${currency}` : `130 000 ${currency}`;

  await whatsappClient.sendButtons(
    input.phone,
    `${t(lang, 'prices.title')}\n\n— ${t(lang, 'prices.monthly')} ${t(lang, 'prices.from')} ${pricesFrom}\n— ${t(lang, 'prices.year')} ${t(lang, 'prices.from')} ${yearFrom}\n\n🔥 ${t(lang, 'prices.special_offers')}\n\n${t(lang, 'prices.select_branch')}`,
    [
      { id: 'prices_branch', title: '📍 ' + t(lang, 'menu.branch.title').replace(/^📍\s*/, '') },
      { id: 'prices_manager', title: '📞 ' + t(lang, 'manager.title') },
      { id: 'back_main', title: t(lang, 'back') },
    ]
  );

  await sessionStore.update(input.phone, { state: State.PRICES_OVERVIEW });
}
