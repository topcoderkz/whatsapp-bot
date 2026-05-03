import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handleWelcome(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
  const selection = input.listId || input.buttonId;

  if (selection === 'menu_prices') {
    await sessionStore.update(input.phone, { state: State.PRICES_OVERVIEW });
    const { handlePricesOverview } = await import('./prices');
    await handlePricesOverview(input, session);
    return;
  }

  if (selection === 'menu_branch') {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.MAIN_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  if (selection === 'menu_booking') {
    await sessionStore.update(input.phone, { state: State.BOOKING_BRANCH });
    const { handleBookingBranch } = await import('./booking-branch');
    await handleBookingBranch(input, session);
    return;
  }

  if (selection === 'menu_promos') {
    await sessionStore.update(input.phone, { state: State.PROMOTIONS });
    const { handlePromotions } = await import('./promotions');
    await handlePromotions(input, session);
    return;
  }

  if (selection === 'menu_manager') {
    await sessionStore.update(input.phone, { state: State.CONTACT_MANAGER });
    const { handleContactManager } = await import('./contact-manager');
    await handleContactManager(input, session);
    return;
  }

  if (selection === 'change_language') {
    await sessionStore.update(input.phone, { state: State.LANGUAGE_SELECTION });
    const { handleLanguageSelection } = await import('./language');
    await handleLanguageSelection(input, session);
    return;
  }

  // Show welcome menu
  await whatsappClient.sendList(
    input.phone,
    `${t(lang, 'welcome.greeting')}\n${t(lang, 'welcome.title')}\n${t(lang, 'welcome.subtitle')}\n\n${t(lang, 'welcome.choose')}`,
    t(lang, 'select'),
    [
      {
        title: t(lang, 'select'),
        rows: [
          { id: 'menu_prices', title: t(lang, 'menu.prices.title'), description: t(lang, 'menu.prices.description') },
          { id: 'menu_branch', title: t(lang, 'menu.branch.title'), description: t(lang, 'menu.branch.description') },
          { id: 'menu_booking', title: t(lang, 'menu.booking.title'), description: t(lang, 'menu.booking.description') },
          { id: 'menu_promos', title: t(lang, 'menu.promos.title'), description: t(lang, 'menu.promos.description') },
          { id: 'menu_manager', title: t(lang, 'menu.manager.title'), description: t(lang, 'menu.manager.description') },
          { id: 'change_language', title: t(lang, 'language.change'), description: t(lang, 'language.change_desc') },
        ],
      },
    ]
  );

  await sessionStore.update(input.phone, { state: State.MAIN_MENU });
}
