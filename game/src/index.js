import 'pixi';
import 'p2';
import 'phaser';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Рендерим React в DOM
createRoot(document.getElementById('root'))
.render(
  <TonConnectUIProvider manifestUrl={`${process.env.CONNECT_URL}/tonconnect-manifest.json`}>
    <App />
  </TonConnectUIProvider>
);