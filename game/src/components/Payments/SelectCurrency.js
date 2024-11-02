import React from "react";

const currencies = [
  {
    label: "Ton",
    currency: "ton"
  },
  {
    label: "Stars",
    currency: "stars"
  },
  {
    label: "USDT",
    currency: "usdt"
  }
];

const SelectItemsButton = ({ lebel, ...props }) => {
  return (
    <button className={styles['action-button']} {...props}>
      <div className={styles.content}>
        <div>{lebel}</div>
      </div>
    </button>
  );
};

export const SelectCurrencies = ({ onSelectCurrency }) => {
  return (
    <div>
      {currencies.map((currency) => (
        <SelectItemsButton
          lebel={currency.label}
          onClick={() => onSelectCurrency(currency)}
        />
      ))}
    </div>
  );
}