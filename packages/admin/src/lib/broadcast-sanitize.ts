// Preview mirror of packages/bot/src/services/broadcast-sanitize.ts —
// the bot applies the same transform before sending, so what the admin
// sees in the preview is what WhatsApp will receive.
export function sanitizeBroadcastParam(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\n\t]+/g, ' ')
    .replace(/ {5,}/g, '    ')
    .trim();
}
