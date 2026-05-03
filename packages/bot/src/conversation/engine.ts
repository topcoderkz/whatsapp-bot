import { UserInput } from '../whatsapp/types';
import { sessionStore, SessionData } from '../redis/session';
import { State } from './states';

// Screen handlers — each returns void and sends messages via whatsappClient
import { handleLanguageSelection } from '../screens/language';
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
  [State.LANGUAGE_SELECTION]: handleLanguageSelection,
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

      // New user or expired session → language selection first
      if (!session) {
        session = { state: State.LANGUAGE_SELECTION, updatedAt: new Date().toISOString() };
        await sessionStore.set(input.phone, session);
        await handleLanguageSelection(input, session);
        return;
      }

      // Any text message that looks like a greeting → restart
      if (input.type === 'text' && isGreeting(input.text)) {
        // If user has a language preference, go to welcome, otherwise language selection
        session = {
          state: session.language ? State.WELCOME : State.LANGUAGE_SELECTION,
          language: session.language,
          updatedAt: new Date().toISOString()
        };
        await sessionStore.set(input.phone, session);
      }

      const handler = screenHandlers[session.state];
      if (handler) {
        await handler(input, session);
      } else {
        // Unknown state → reset to welcome (with language if set)
        console.warn(`[Engine] Unknown state: ${session.state}, resetting`);
        session.state = session.language ? State.WELCOME : State.LANGUAGE_SELECTION;
        await sessionStore.set(input.phone, session);
        const targetHandler = screenHandlers[session.state];
        if (targetHandler) await targetHandler(input, session);
      }
    } catch (err) {
      console.error(`[Engine] Error handling message from ${input.phone}:`, err);
      // Send a generic error message in user's language
      const { whatsappClient } = await import('../whatsapp/client');
      const { t } = await import('../locales');
      const session = await sessionStore.get(input.phone);
      const lang = (session?.language || 'ru') as 'ru' | 'kk' | 'en';
      await whatsappClient.sendText(input.phone, t(lang, 'error'));
    }
  },
};

function isGreeting(text?: string): boolean {
  if (!text) return false;
  const greetings = [
    // Russian
    'привет', 'здравствуйте', 'здрасте', 'здрасьте', 'старт', 'начать', 'меню',
    'добрый день', 'доброе утро', 'добрый вечер',
    // Kazakh
    'сәлем', 'салем', 'сәлеметсіз бе', 'саламатсыз ба',
    'қайырлы күн', 'қайырлы таң', 'бастау',
    // English
    'hi', 'hello', 'hey', 'start', 'menu',
    // Cyrillic transliterations (common in KZ)
    'хай', 'хелло', 'хеллоу',
  ];
  return greetings.includes(text.toLowerCase().trim());
}
