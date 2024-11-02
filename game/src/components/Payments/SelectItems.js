import React, { useState } from "react";
import { getItems } from "../../api/payments";

import * as styles from "./style.module.scss";
import { methodPayments } from "./constants";
import { BackButton } from "../BackButton";

const SelectItemsButton = ({ connected, paymentMethod, item, ...props }) => {
  const renderAmount = () => {
    if (paymentMethod === methodPayments.stars) {
      return <div>{item.stars} stars</div>
    } else if (paymentMethod === methodPayments.arcpay) {
      return <div>{item.ton} TON</div>;
    } else if (paymentMethod === methodPayments.aeon) {
      return <div>{item.usd} $</div>;
    }
  };
  return (
    <button className={styles['action-button']} {...props}>
      <div className={styles['action-button__icon']}>
        <img src="https://game-api.qr-mint.net/images/coin.png" />
      </div>
      <div className={styles.content}>
        <div>{item.coins}</div> {renderAmount(item)}
      </div>
    </button>
  );
};

export const SelectItems = ({ wallet, onSelect, payment, isDev, onBack }) => {
  const [items, setItems] = useState();

  useState(() => {
    async function fetchItems() {
      try {
        const fetchedItems = await getItems(payment);
        if (payment === methodPayments.aeon) {
          setItems(fetchedItems.splice(1));
        } else {
          setItems(fetchedItems);
        }
      } catch (error) {
        console.error("Failed to fetch coin items:", error);
      }
    }

    fetchItems();
  }, []);
  
  return (
    <>
      <BackButton onClick={onBack} isDev={isDev} />
      <h1 className={styles.title}>
        Select coins
      </h1>
      <div className={styles['actions']}>
        {items?.map((item, key) => (
          <SelectItemsButton
            item={item}
            paymentMethod={payment}
            onClick={() => onSelect(item)}
            key={key}
            connected={wallet}
          />
        ))}
      </div>
    </>
  );
}