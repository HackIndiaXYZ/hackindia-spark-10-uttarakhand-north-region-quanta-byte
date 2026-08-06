import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="krishi-footer">
      <div className="footer-inner krishi-container">
        <div className="footer-brand">
          <span style={{ fontSize: '1.2rem' }}>🌾</span> Krishi AI
        </div>
        <div className="footer-tagline">किसान का डिजिटल साथी — स्मार्ट खेती, बेहतर उत्पादन</div>
        <div className="footer-links">
          <Link to="/">होम</Link>
          <Link to="/disease">रोग पहचान</Link>
          <Link to="/weather">मौसम</Link>
          <Link to="/market">मंडी भाव</Link>
          <Link to="/schemes">योजनाएं</Link>
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} Krishi AI. All rights reserved. Made with ❤️ for Indian Farmers.
        </div>
      </div>
    </footer>
  );
}
