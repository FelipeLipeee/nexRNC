import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrandingProvider } from './contexts/BrandingContext';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrandingProvider>
        <App />
      </BrandingProvider>
    </ErrorBoundary>
  </StrictMode>,
);
