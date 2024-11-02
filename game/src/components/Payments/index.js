import React, { useState } from "react";
import { useTonConnectModal, useTonWallet } from "@tonconnect/ui-react";
import { toast } from 'react-toastify';

import Portal from "../Portal";
import { create, confirm } from "../../api/payments";
import { Error } from "../Error";
import { Waiting } from "./Waiting";
import { SelectPaymentSystem } from "./SelectPaymentSystem";
import * as styles from "./style.module.scss";
import { methodPayments } from "./constants";
import { SelectItems } from "./SelectItems";
import { walletBalance } from "../../api/wallet";
import { Window } from "../Payments/Window"

const paymentStatuses = {
  "waiting": "waiting",
  "creating": "creating",
  "confirmed": "confirmed",
  "cancel": "cancel"
}


const Dialog = ({ isDev, tonConnectUI, onClose }) => {
  const { open } = useTonConnectModal();
  const wallet = useTonWallet();
  const [paymentStatus, setPaymentStatus] = useState(paymentStatuses.creating);
  const [errorMessage, setErrorMessage] = useState(); 
  const [paymentMethod, setPaymentMethod] = useState();
  const [source, setSource] = useState();
  
  const handleSelect = async (payment) => {
    if (payment === methodPayments.arcpay) {
      if (tonConnectUI.connected && wallet) {
        try {
          const balance = await walletBalance();
				  if (balance !== 0) {
            setPaymentMethod(methodPayments.arcpay);
          } else {
            toast.warning("Ton is not enought!");
          }
        } catch (err) {
          toast.error(err.message);
        }
      } else {
        open();
      }
    } else {
      setPaymentMethod(payment);
    }
  };
 
  const handlePayment = async ({ coins, stars, usd, ton }) => {
    try {
      const currencyToken = paymentMethod === methodPayments.arcpay ? 'ton' : paymentMethod === methodPayments.stars ? 'stars' : 'usdt';
      const amount = paymentMethod === methodPayments.arcpay ? ton : paymentMethod === methodPayments.stars ? stars : usd;
      const data = await create({ coins, amount, payment: paymentMethod, currencyToken });
      if (paymentMethod === methodPayments.arcpay) {
        const tonConnectResponse = await tonConnectUI.sendTransaction({
          messages: data.transactions.map((tx) => {
            return {
              address: tx.to,
              amount: tx.value.toString(),
              payload: tx.body,
            };
          }),
          validUntil: Date.now() + 10 * 60 * 1000,
        });
        try {
          await confirm(paymentMethod, data.order_id, { tonConnectResponse });
          setPaymentStatus(paymentStatuses.waiting);
        } catch (err) {
          console.error(err);
        }
      } else if (paymentMethod === methodPayments.aeon) {
        setSource(data.url);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    }
  };

  if (paymentStatus === paymentStatuses.waiting) {
    return <Waiting isDev={isDev} onBack={onClose} />;
  } else if (errorMessage) {
    return <Error message={errorMessage} isDev={isDev} onBack={onClose} />;
  } else if (source) {
    return (
      <Window
        source={source}
        paymentMethod={paymentMethod}
        onBack={() => setSource(null)}
        isDev={isDev}
      />
    );
  } else if (paymentMethod) {
    return (
      <SelectItems
        connected={wallet}
        onBack={() => setPaymentMethod(null)}
        payment={paymentMethod}
        onSelect={handlePayment}
        isDev={isDev}
      />
    );
  }

  return (
    <SelectPaymentSystem isDev={isDev} onSelect={handleSelect} onBack={onClose} />
  );
};

export const Payments = ({ isDev, tonConnectUI, onClose }) => {
  return (
    <Portal>
      <div className={styles.dialog}>
        <Dialog isDev={isDev} tonConnectUI={tonConnectUI} onClose={onClose} />
      </div>
    </Portal>
  )
};