import type { Metadata } from 'next';
import { Poppins, Baloo_2 } from 'next/font/google';
import Head from 'next/head';
import Providers from './providers';

// Import CSS files globally in order of override
import '../styles/global.css';
import '../styles/navbar.css';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/dashboard.css';
import '../styles/chatbot.css';
import '../styles/home.css';
import '../styles/responsive.css';

import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import FloatingAI from '../components/FloatingAI';
import FloatingVoice from '../components/FloatingVoice';
import Footer from '../components/Footer';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const baloo2 = Baloo_2({
  weight: ['400', '600', '800'],
  subsets: ['latin'],
  variable: '--font-baloo2',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Krishi AI - किसान का डिजिटल साथी',
  description: 'रोग पहचान · मौसम जानकारी · मंडी भाव · AI सलाह — सब कुछ एक जगह।',
  manifest: '/manifest.json',
  themeColor: '#2E7D32',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className={`${poppins.variable} ${baloo2.variable}`}>
      <head>
        {/* Font Awesome CDN */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" 
          precedence="default"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="main-content" id="mainContent">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <FloatingAI />
          <FloatingVoice />
        </Providers>
      </body>
    </html>
  );
}
