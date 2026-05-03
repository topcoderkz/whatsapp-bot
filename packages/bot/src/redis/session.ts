import { redis } from './client';

const SESSION_TTL = 24 * 60 * 60; // 24 hours
const BOOKING_TTL = 60 * 60; // 1 hour for incomplete booking data
const PREFIX = 'session:';

export interface SessionData {
  state: string;
  language?: 'ru' | 'kk' | 'en';
  branchId?: number;
  previousState?: string;
  booking?: {
    branchId?: number;
    workoutType?: 'INDIVIDUAL' | 'GROUP';
    date?: string;
    timeSlot?: string;
    trainerId?: number;
    timePeriod?: 'morning' | 'evening';
  };
  updatedAt: string;
}

export const sessionStore = {
  async get(phone: string): Promise<SessionData | null> {
    const data = await redis.get(PREFIX + phone);
    if (!data) return null;
    return JSON.parse(data);
  },

  async set(phone: string, session: SessionData): Promise<void> {
    session.updatedAt = new Date().toISOString();
    await redis.set(PREFIX + phone, JSON.stringify(session), 'EX', SESSION_TTL);
  },

  async update(phone: string, updates: Partial<SessionData>): Promise<SessionData> {
    const current = await this.get(phone) || { state: 'WELCOME', updatedAt: new Date().toISOString() };
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    await this.set(phone, updated);
    return updated;
  },

  async setBookingData(phone: string, booking: SessionData['booking']): Promise<void> {
    const session = await this.get(phone);
    if (session) {
      session.booking = booking;
      await this.set(phone, session);
    }
  },

  async clearBooking(phone: string): Promise<void> {
    const session = await this.get(phone);
    if (session) {
      delete session.booking;
      await this.set(phone, session);
    }
  },

  async delete(phone: string): Promise<void> {
    await redis.del(PREFIX + phone);
  },
};
