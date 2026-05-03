import { UserInput } from '../whatsapp/types';
import { sessionStore, SessionData } from '../redis/session';
import { State } from './states';

// Screen handlers — each returns void and sends messages via whatsappClient
import { handleWelcome } from '../screens/welcome';
import { handleMainMenu } from '../screens/main-menu';
import { handlePricesOverview } from '../screens/prices';
import { handleBranchSelection } from '../screens/branch-selection';
import { handleBranchMenu } from '../screens/branch-menu';
import { handleBranchPrices } from '../screens/branch-prices';
import { handleContactManager } from '../screens/contact-manager';
import { handleBookingBranch } from '../screens/booking-branch';
import { handleBookingType } from '../screens/booking-type';
import { handleBookingDate } from '../screens/booking-date';
import { handleBookingTime } from '../screens/booking-time';
import { handleBookingConfirm } from '../screens/booking-confirm';
import { handleGroupClasses } from '../screens/group-classes';
import { handleClassDetail } from '../screens/class-detail';
import { handleTrainers } from '../screens/trainers';
import { handleTrainerProfile } from '../screens/trainer-profile';
import { handlePromotions } from '../screens/promotions';
import { handlePromoDetail } from '../screens/promo-detail';

type ScreenHandler = (input: UserInput, session: SessionData) => Promise<void>;

const screenHandlers: Record<string, ScreenHandler> = {
  [State.WELCOME]: handleWelcome,
  [State.MAIN_MENU]: handleMainMenu,
  [State.PRICES_OVERVIEW]: handlePricesOverview,
  [State.BRANCH_SELECTION]: handleBranchSelection,
  [State.BRANCH_MENU]: handleBranchMenu,
  [State.BRANCH_PRICES]: handleBranchPrices,
  [State.CONTACT_MANAGER]: handleContactManager,
  [State.BOOKING_BRANCH]: handleBookingBranch,
  [State.BOOKING_TYPE]: handleBookingType,
  [State.BOOKING_DATE]: handleBookingDate,
  [State.BOOKING_TIME]: handleBookingTime,
  [State.BOOKING_CONFIRM]: handleBookingConfirm,
  [State.GROUP_CLASSES]: handleGroupClasses,
  [State.CLASS_DETAIL]: handleClassDetail,
  [State.TRAINERS]: handleTrainers,
  [State.TRAINER_PROFILE]: handleTrainerProfile,
  [State.PROMOTIONS]: handlePromotions,
  [State.PROMO_DETAIL]: handlePromoDetail,
};

export const conversationEngine = {
  async handleMessage(input: UserInput): Promise<void> {
    try {
      let session = await sessionStore.get(input.phone);

      // New user or expired session → welcome
      if (!session) {
        session = { state: State.WELCOME, updatedAt: new Date().toISOString() };
        await sessionStore.set(input.phone, session);
      }

      // Any text message that looks like a greeting → restart
      if (input.type === 'text' && isGreeting(input.text)) {
        session = { state: State.WELCOME, updatedAt: new Date().toISOString() };
        await sessionStore.set(input.phone, session);
      }

      const handler = screenHandlers[session.state];
      if (handler) {
        await handler(input, session);
      } else {
        // Unknown state → reset to welcome
        console.warn(`[Engine] Unknown state: ${session.state}, resetting`);
        session.state = State.WELCOME;
        await sessionStore.set(input.phone, session);
        await handleWelcome(input, session);
      }
    } catch (err) {
      console.error(`[Engine] Error handling message from ${input.phone}:`, err);
      // Send a generic error message
      const { whatsappClient } = await import('../whatsapp/client');
      await whatsappClient.sendText(
        input.phone,
        'Произошла ошибка. Пожалуйста, попробуйте ещё раз или напишите "Привет" для перезапуска.'
      );
    }
  },
};

function isGreeting(text?: string): boolean {
  if (!text) return false;
  const greetings = ['привет', 'здравствуйте', 'hi', 'hello', 'start', 'начать', 'меню', 'menu'];
  return greetings.includes(text.toLowerCase().trim());
}
