import { Request, Response } from 'express';
import { config } from '../config';
import { WebhookPayload, IncomingMessage, UserInput, StatusUpdate } from './types';
import { conversationEngine } from '../conversation/engine';
import { prisma } from '../db/client';

// GET /webhook — verification handshake with Meta
export function handleVerification(req: Request, res: Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    console.log('[Webhook] Verification successful');
    res.status(200).send(challenge);
  } else {
    console.warn('[Webhook] Verification failed');
    res.sendStatus(403);
  }
}

// POST /webhook — incoming messages & status updates
export async function handleIncoming(req: Request, res: Response) {
  // Always respond 200 quickly to avoid Meta retries
  res.sendStatus(200);

  try {
    const payload = req.body as WebhookPayload;
    if (payload.object !== 'whatsapp_business_account') return;

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;
        const value = change.value;

        // Handle incoming messages
        if (value.messages) {
          for (const msg of value.messages) {
            const profileName = value.contacts?.[0]?.profile?.name;
            const input = parseUserInput(msg, profileName);
            if (input) {
              await conversationEngine.handleMessage(input);
            }
          }
        }

        // Handle status updates (delivery/read receipts)
        if (value.statuses) {
          for (const status of value.statuses) {
            await handleStatusUpdate(status);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Webhook] Error processing:', err);
  }
}

function parseUserInput(msg: IncomingMessage, profileName?: string): UserInput | null {
  const base = {
    phone: msg.from,
    messageId: msg.id,
    profileName,
  };

  switch (msg.type) {
    case 'text':
      return { ...base, type: 'text', text: msg.text?.body };

    case 'interactive':
      if (msg.interactive?.type === 'button_reply') {
        return {
          ...base,
          type: 'button',
          buttonId: msg.interactive.button_reply?.id,
          text: msg.interactive.button_reply?.title,
        };
      }
      if (msg.interactive?.type === 'list_reply') {
        return {
          ...base,
          type: 'list',
          listId: msg.interactive.list_reply?.id,
          text: msg.interactive.list_reply?.title,
        };
      }
      return null;

    default:
      return { ...base, type: 'other' };
  }
}

async function handleStatusUpdate(status: StatusUpdate) {
  const { id, status: statusValue, timestamp } = status;
  const ts = new Date(parseInt(timestamp) * 1000);

  try {
    const log = await (prisma as any).notificationLog.findFirst({
      where: { waMessageId: id },
    });
    if (!log) return;

    const updateData: any = {};
    switch (statusValue) {
      case 'sent':
        updateData.status = 'SENT';
        updateData.sentAt = ts;
        break;
      case 'delivered':
        updateData.status = 'DELIVERED';
        updateData.deliveredAt = ts;
        break;
      case 'read':
        updateData.status = 'READ';
        updateData.readAt = ts;
        break;
      case 'failed':
        updateData.status = 'FAILED';
        updateData.errorMessage = status.errors?.[0]?.title || 'Unknown error';
        break;
    }

    await (prisma as any).notificationLog.update({
      where: { id: log.id },
      data: updateData,
    });
  } catch (err) {
    console.error('[Webhook] Status update error:', err);
  }
}
