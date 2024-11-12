import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import { GameConfig } from './game/gameConfig'; // Assuming this contains your Phaser setup
import { useAuthStore } from './store/auth';
import { Connect } from './components/Connect';
import { useAppStore } from './store/app';
import { Error } from './components/Error';
import { socketEvents } from './socket/index';
import { useGameStore } from './store/game';
import { getUser } from './sdk/api/user';
import { Blocked } from './components/Blocked';
import { activate } from './api/partner';

import 'react-toastify/dist/ReactToastify.css';

const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
};

export const getQueryParams = (key) => {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(key);
};

export const App = () => {
  const [user, setUser] = useState();
  const [configSettings, setConfig] = useState();
  const { auth, access_token, togglePayment } = useAuthStore();
  const { error } = useAppStore();
  const gameContainerRef = useRef(null);

  const handleAuth = async () => {
    try {
      await auth();
      const code = getQueryParams('code');
      if (code) {
        await activate(code);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!access_token) {
      handleAuth();
    }
  }, [access_token]);

  useEffect(() => {
    if (access_token && !user) {
      getUser()
        .then(setUser)
        .catch(() => toast.error('Error getting user'));
    }
  }, [access_token, user]);

  useEffect(() => {
    if (user) {
      socketEvents.listOrder((order) => {
        if (order.user_id === user.id) {
          if (order.status === 'completed') {
            useGameStore.getState().updateCoins(order.item.coins);
            togglePayment(false);
            toast.success('Payment successful');
          } else if (order.status === 'failed') {
            toast.error('Error payment');
          } else if (order.status === 'cancelled') {
            toast.warn('Payment cancelled');
          }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (!configSettings) {
      // Проверяем, что контейнер готов
      if (gameContainerRef.current && access_token) {
        const config = new GameConfig(gameContainerRef.current.id);
        setConfig(config);
        // Очищаем игру при размонтировании компонента
      }
    }
    return () => {
      configSettings?.destroy();
    };
  }, [access_token, configSettings]);

  if (!isMobileDevice() && process.env.MODE === "prod") {
    return <Blocked />;
  }

  return (
    <>
      <div id="game-container" ref={gameContainerRef} />
      <Connect />
      {error && <Error message={error} />}
      <ToastContainer />
    </>
  );
};
