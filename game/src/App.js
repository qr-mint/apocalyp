import React, { useEffect, useRef, useState } from 'react';

import { GameConfig } from './game/gameConfig'; // Assuming this contains your Phaser setup
import { useAuthStore } from './store/auth';
import { Connect } from './components/Connect';
import { useAppStore } from './store/app';
import { Error } from './components/Error';

import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

export const App = () => {
  const [configSettings, setConfig] = useState();
  const { auth, access_token } = useAuthStore();
  const { error } = useAppStore();
  const gameContainerRef = useRef(null);

  const handleAuth = async () => {
    try {
     await auth();
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    handleAuth();
  }, []);

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

  return (
    <>
      <div id="game-container" ref={gameContainerRef} />
      <Connect />
      {error && <Error message={error} />}
      <ToastContainer />
    </>
  );
};
