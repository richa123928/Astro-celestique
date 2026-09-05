// Welcome bonus (new registration) and referral bonus (referrer payout)
// use the same amount table, keyed by currency.
const BONUS_AMOUNTS = {
  INR: 50,
  USD: 1,
  EUR: 1,
  GBP: 1
};

function getBonusAmount(currency) {
  return BONUS_AMOUNTS[currency] ?? BONUS_AMOUNTS.INR;
}

module.exports = { BONUS_AMOUNTS, getBonusAmount };