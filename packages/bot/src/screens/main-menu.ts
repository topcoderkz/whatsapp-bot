import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { State } from '../conversation/states';
import { handleWelcome } from './welcome';
import { handlePricesOverview } from './prices';
import { handleBranchSelection } from './branch-selection';
import { handleBookingBranch } from './booking-branch';
import { handlePromotions } from './promotions';
import { handleContactManager } from './contact-manager';

export async function handleMainMenu(input: UserInput, session: SessionData): Promise<void> {
  const selection = input.listId || input.buttonId || input.text;

  switch (selection) {
    case 'menu_prices':
      await sessionStore.update(input.phone, { state: State.PRICES_OVERVIEW });
      await handlePricesOverview(input, session);
      break;

    case 'menu_branch':
      await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.MAIN_MENU });
      await handleBranchSelection(input, session);
      break;

    case 'menu_booking':
      await sessionStore.update(input.phone, { state: State.BOOKING_BRANCH });
      await handleBookingBranch(input, session);
      break;

    case 'menu_promos':
      await sessionStore.update(input.phone, { state: State.PROMOTIONS });
      await handlePromotions(input, session);
      break;

    case 'menu_manager':
      await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.CONTACT_MANAGER });
      await handleBranchSelection(input, session);
      break;

    default:
      // Unrecognized input → show welcome again
      await sessionStore.update(input.phone, { state: State.WELCOME });
      await handleWelcome(input, session);
      break;
  }
}
