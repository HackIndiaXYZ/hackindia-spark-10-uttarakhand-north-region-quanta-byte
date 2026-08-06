import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Global Styles
import './styles/global.css';
import './styles/navbar.css';
import './styles/cards.css';
import './styles/forms.css';
import './styles/dashboard.css';
import './styles/chatbot.css';
import './styles/home.css';
import './styles/responsive.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import FloatingAI from './components/FloatingAI';
import FloatingVoice from './components/FloatingVoice';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Disease from './pages/Disease';
import Weather from './pages/Weather';
import Market from './pages/Market';
import Schemes from './pages/Schemes';
import Yield from './pages/Yield';
import Machinery from './pages/Machinery';
import Alerts from './pages/Alerts';
import Chatbot from './pages/Chatbot';
import Voice from './pages/Voice';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content" id="mainContent">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/disease" element={<Disease />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/market" element={<Market />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/yield" element={<Yield />} />
          <Route path="/machinery" element={<Machinery />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav />
      <FloatingAI />
      <FloatingVoice />
    </div>
  );
}
