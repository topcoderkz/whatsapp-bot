import express from 'express';
import { config } from './config';
import { handleVerification, handleIncoming } from './whatsapp/webhook';
import { adminApiRouter } from './routes/admin-api';
import { startBookingCleanup } from './jobs/booking-cleanup';
import { startPromotionExpiry } from './jobs/promotion-expiry';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', mock: config.whatsapp.isMock });
});

// WhatsApp webhook
app.get('/webhook', handleVerification);
app.post('/webhook', handleIncoming);

// Admin API (used by admin panel for WhatsApp-dependent actions)
app.use('/admin', adminApiRouter);

// Start server
app.listen(config.port, () => {
  console.log(`[Bot] Server running on port ${config.port}`);
  console.log(`[Bot] WhatsApp mode: ${config.whatsapp.isMock ? 'MOCK' : 'LIVE'}`);
  console.log(`[Bot] Webhook URL: http://localhost:${config.port}/webhook`);
});

// Start background jobs
startBookingCleanup();
startPromotionExpiry();
