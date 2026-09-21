import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import './index.css';

// Filter out benign dev platform errors (Vite HMR websocket disconnection, AppCheck in dev)
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = typeof reason === 'string' ? reason : reason?.message || '';
  if (
    message.includes('WebSocket closed without opened') ||
    message.includes('failed to connect to websocket') ||
    message.includes('appcheck/recaptcha-error') ||
    message.includes('AppCheck: ReCAPTCHA error')
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const message = event.message || event.error?.message || '';
  if (
    message.includes('WebSocket closed without opened') ||
    message.includes('failed to connect to websocket') ||
    message.includes('appcheck/recaptcha-error') ||
    message.includes('AppCheck: ReCAPTCHA error')
  ) {
    event.preventDefault();
    return;
  }
  // Only write to document body if root is completely empty (fatal crash)
  if (document.body.innerHTML === '' || document.getElementById('root')?.innerHTML === '') {
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Fatal Error: ${event.error?.message}</div>`;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
