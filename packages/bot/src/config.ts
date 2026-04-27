import dotenv from 'dotenv';
import path from 'path';

// Try loading .env from both bot package root and workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || process.env.BOT_PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // WhatsApp — empty token = mock mode
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'myverifytoken',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
    get isMock() {
      return !config.whatsapp.accessToken;
    },
  },

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://fitness:fitness@localhost:5432/fitness_bot',

  // Admin
  admin: {
    jwtSecret: process.env.ADMIN_JWT_SECRET || 'dev-secret',
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'changeme',
  },

  // WhatsApp template names
  templates: {
    bookingNotification: process.env.WA_TEMPLATE_BOOKING_NOTIFICATION || 'booking_notification',
    bookingConfirmation: process.env.WA_TEMPLATE_BOOKING_CONFIRMATION || 'booking_confirmation',
    broadcast: process.env.WA_TEMPLATE_BROADCAST || 'broadcast_message',
  },
};
