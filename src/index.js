import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { NightModeProvider } from './hooks/night-mode';
import { PlayQueueProvider } from './hooks/play-queue';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render((
    <NightModeProvider>
        <PlayQueueProvider>
            <App />
        </PlayQueueProvider>
    </NightModeProvider>
), document.getElementById('root'));
registerServiceWorker();
