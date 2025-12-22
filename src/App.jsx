import React, { useState } from 'react';
import Header from './components/Header';
import MatrixBuilder from './components/MatrixBuilder';
import MatrixOperations from './components/MatrixOperations';
import ExportOptions from './components/ExportOptions';
import OperationHistory from './components/OperationHistory';
import ScanView from './components/ScanView';
import Home from './components/Home';
import { MatrixProvider } from './context/MatrixContext';

import TemplatesView from './components/TemplatesView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';

function AppContent() {
  const [view, setView] = useState('home');

  if (view === 'home') {
    return <Home
      onStart={() => setView('operations')}
      onScan={() => setView('scan')}
      onTemplates={() => setView('templates')}
      onProfile={() => setView('profile')}
      onSettings={() => setView('settings')}
    />;
  }

  if (view === 'templates') {
    return <TemplatesView onBack={() => setView('home')} onStartProject={() => setView('operations')} />;
  }

  if (view === 'profile') {
    return <ProfileView onBack={() => setView('home')} />;
  }

  if (view === 'settings') {
    return <SettingsView onBack={() => setView('home')} />;
  }

  if (view === 'builder') {
    return <MatrixBuilder onBack={() => setView('home')} />;
  }

  if (view === 'operations') {
    return <MatrixOperations
      onBack={() => setView('home')}
      onExport={() => setView('export')}
      onHistory={() => setView('history')}
      onEdit={() => setView('builder')}
    />;
  }

  if (view === 'export') {
    return <ExportOptions onBack={() => setView('operations')} />;
  }

  if (view === 'history') {
    return <OperationHistory onBack={() => setView('operations')} />;
  }

  if (view === 'scan') {
    return <ScanView onBack={() => setView('home')} onComplete={() => setView('builder')} />;
  }

  return <MatrixBuilder onBack={() => setView('home')} />;
}

function App() {
  return (
    <MatrixProvider>
      <AppContent />
    </MatrixProvider>
  );
}

export default App;
