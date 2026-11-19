// Prices live on the server so the browser cannot change the amount
export const PLANS = {
  Monthly:       { months: 1,  amount: 1800 },
  Quarterly:     { months: 3,  amount: 4500 },
  'Half-Yearly': { months: 6,  amount: 8000 },
  Yearly:        { months: 12, amount: 15000 },
};
export const METHODS = ['UPI', 'Card', 'Cash', 'NetBanking'];
