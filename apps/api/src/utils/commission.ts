export const PLATFORM_COMMISSION_RATE = 0.2;

export function calculateCommission(amount: number) {
  const platformCommission = Number((amount * PLATFORM_COMMISSION_RATE).toFixed(2));
  const trainerPayout = Number((amount - platformCommission).toFixed(2));

  return {
    amount,
    platformCommission,
    trainerPayout
  };
}
