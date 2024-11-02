import React from 'react';
import { ArcPayIcon, AeonIcon, StarIcon } from "./Icons";

import { BackButton } from '../BackButton';

import * as styles from "./style.module.scss";
import { methodPayments } from './constants';


const PaymentButton = ({ paymentName, logoImage, tokens, ...props }) => {
  return (
    <button
      className={styles['action-button']}
      {...props}
      aria-label={`Deposit via ${paymentName}`}
    >
      <div className={styles['action-button__icon']}>
        {logoImage}
      </div>
      <p className={styles['action-button__title']}>
        {paymentName} {tokens && <div className={styles.tag}>{tokens}</div>}
      </p>
      <p className={styles['action-button__subtitle']}>Deposit via {paymentName}</p>
      <div className={styles['action-button__right-icon']}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7.00403 12.0078" fill="none">
          <path
            d="M1.00403 1.00391L6.00403 6.00391L1.00403 11.0039"
            stroke="currentColor"
            strokeOpacity="1"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </button>
  );
};

export const SelectPaymentSystem = ({ onSelect, onBack, isDev }) => (
  <>
    <BackButton onClick={onBack} isDev={isDev} />
    <h1 className={styles.title}>
      Select payment system
    </h1>
    <div className={styles['actions']}>
      <PaymentButton
        onClick={() => onSelect(methodPayments.arcpay)}
        paymentName="ArcPay"
        tokens="TON"
        logoImage={<ArcPayIcon />}
      />
      <PaymentButton
        onClick={() => onSelect(methodPayments.aeon)}
        paymentName="AOEN"
        tokens="USDT"
        logoImage={<AeonIcon />}
      />
      <PaymentButton
        onClick={() => onSelect(methodPayments.stars)}
        paymentName="STARS"
        logoImage={<StarIcon />}
      />
    </div>
  </>
);