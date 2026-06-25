// Single source of truth for "does this promo apply to this branch?"
// Convention: empty branches array means the promo applies to ALL branches.
// Used by the landing branch page and (with the same shape) by the bot.

type PromoWithBranches = { branches: { id: number }[] };

export function appliesToBranch(promo: PromoWithBranches, branchId?: number | null): boolean {
  if (promo.branches.length === 0) return true;
  if (branchId == null) return true;
  return promo.branches.some((b) => b.id === branchId);
}
