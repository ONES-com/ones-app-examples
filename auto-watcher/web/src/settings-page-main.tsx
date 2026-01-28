import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import './index.css';
import SettingsPage from './pages/SettingsPage';

render(
  <StrictMode>
    <SettingsPage />
  </StrictMode>,
  document.getElementById('root'),
);
