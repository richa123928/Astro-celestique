import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
  INR: { symbol: '₹', code: 'INR', rate: 1,      label: 'Indian Rupee' },
  USD: { symbol: '$', code: 'USD', rate: 0.012,   label: 'US Dollar' },
  EUR: { symbol: '€', code: 'EUR', rate: 0.011,   label: 'Euro' },
  GBP: { symbol: '£', code: 'GBP', rate: 0.0095, label: 'British Pound' },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('INR');

  const convert = (amountINR) => {
    const c = CURRENCIES[currency];
    const converted = amountINR * c.rate;
    if (currency === 'INR') {
      return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${c.symbol}${converted < 10 ? converted.toFixed(2) : Math.round(converted).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      convert,
      CURRENCIES
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);