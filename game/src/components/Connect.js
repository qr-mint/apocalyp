import React, { useEffect, useRef } from 'react';
import { useTonConnectUI, useTonWallet, useIsConnectionRestored } from '@tonconnect/ui-react';
import { MainButton } from '@vkruglikov/react-telegram-web-app';

import { useWalletStore } from '../store/wallet';
import { generatePayload } from '../sdk/api/wallet';
import { Payments } from './Payments';
import { useAppStore } from '../store/app';

const payloadTTLMS = 1000 * 60 * 20;
const isDev = process.env.MODE === "dev";

export const Connect = () => {
	const { loading, payment, togglePayment } = useAppStore();
	const wallet = useTonWallet();
	const isConnectionRestored = useIsConnectionRestored();
	const { connect, access_token } = useWalletStore();
	const [tonConnectUI] = useTonConnectUI();
	const interval = useRef();

	useEffect(() => {
		if (!isConnectionRestored) {
			return;
		}
		if (access_token) {
			return;
		}

		clearInterval(interval.current);

		const refreshPayload = async () => {
			tonConnectUI.setConnectRequestParameters({ state: 'loading' });

			const value = await generatePayload();
			if (!value) {
				tonConnectUI.setConnectRequestParameters(null);
			} else {
				tonConnectUI.setConnectRequestParameters({ state: 'ready', value: { tonProof: value } });
			}
		};
		const auth = async (wallet) => {
			if (wallet.connectItems?.tonProof && !('error' in wallet.connectItems.tonProof)) {
				try {
					await connect(wallet);
				} catch (err) {
					await tonConnectUI.disconnect();
				}
			} else {
				tonConnectUI.disconnect();
			}
		};

		if (wallet) {
			auth(wallet);
		} else {
			refreshPayload();
			setInterval(refreshPayload, payloadTTLMS);
			return () => {
				clearInterval(interval.current); 
			};
		}
	}, [ wallet, isConnectionRestored ]);

	const bottomButton = () => {
		return (
			<>
				<MainButton
					disabled={loading}
					text="Deposit"
					onClick={() => togglePayment(true)}
				/>
				{isDev && <button
					className="bottom-btn"
					onClick={() => togglePayment(true)}
				>
					Deposit
				</button>}
			</>
		)
	}
	
	return (
		<>
			{bottomButton()}
			{payment && <Payments isDev={isDev} tonConnectUI={tonConnectUI} onClose={() => togglePayment(false)} />}
		</>
	);
};

export default Connect;