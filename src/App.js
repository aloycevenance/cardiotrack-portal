import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function AppInner({ onLogout, dark, setDark }) {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const navigate = useNavigate();

  function handleSelectDevice(device) {
    setSelectedDevice(device);
    navigate('/dashboard');
  }

  return (
    <Layout
      onLogout={onLogout}
      dark={dark}
      setDark={setDark}
      deviceSelected={!!selectedDevice}
      deviceName={selectedDevice?.name}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/patients" />} />
        <Route path="/patients" element={<Patients dark={dark} onSelectDevice={handleSelectDevice} />} />
        <Route path="/dashboard" element={
          selectedDevice
            ? <Dashboard dark={dark} deviceId={selectedDevice.id} deviceName={selectedDevice.name} />
            : <Navigate to="/patients" />
        } />
        <Route path="/reports" element={
          selectedDevice ? <Reports dark={dark} deviceId={selectedDevice.id} /> : <Navigate to="/patients" />
        } />
        <Route path="/settings" element={
          selectedDevice ? <Settings dark={dark} deviceId={selectedDevice.id} deviceName={selectedDevice.name} /> : <Navigate to="/patients" />
        } />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [dark, setDark] = useState(false);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <BrowserRouter>
      <AppInner onLogout={() => setLoggedIn(false)} dark={dark} setDark={setDark} />
    </BrowserRouter>
  );
}