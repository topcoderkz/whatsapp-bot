// Meta rejects WhatsApp template body params containing newlines, tabs, or
// more than 4 consecutive spaces (error 132018). We collapse whitespace here
// so admins can still author multi-line drafts in the UI while the outgoing
// param stays within Meta's rules.
//
// Keep this in sync with packages/admin/src/lib/broadcast-sanitize.ts — the
// admin UI shows a preview computed from that copy.
export function sanitizeBroadcastParam(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\n\t]+/g, ' ')
    .replace(/ {5,}/g, '    ')
    .trim();
}
