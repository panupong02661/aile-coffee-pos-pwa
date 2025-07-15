
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering app:', error);
  // Fallback rendering
  root.render(
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Application Error</h1>
      <p>There was an error loading the application. Please refresh the page.</p>
    </div>
  );
}
