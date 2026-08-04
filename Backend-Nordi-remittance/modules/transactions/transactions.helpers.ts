export const WS_EVENTS = {
  TRANSACTION_PENDING: "transaction:pending",
  TRANSACTION_COMPLETED: "transaction:completed",
  TRANSACTION_FAILED: "transaction:failed",
  TRANSACTION_CANCELLED: "transaction:cancelled",
  BALANCE_UPDATED: "wallet:balance_updated",
  MONEY_RECEIVED: "transaction:received",
  MONEY_SENT: "transaction:sent",
  DEPOSIT_COMPLETED: "transaction:deposit_completed",
  WITHDRAWAL_INITIATED: "transaction:withdrawal_initiated",
  WITHDRAWAL_COMPLETED: "transaction:withdrawal_completed",
};

export const getWalletBalance = (wallet: any, currency: string): number => {
  return wallet.balances?.get(currency) || 0;
};

export const updateWalletBalance = (
  wallet: any,
  currency: string,
  amount: number,
): void => {
  const currentBalance = wallet.balances?.get(currency) || 0;
  wallet.balances.set(currency, currentBalance + amount);
};
