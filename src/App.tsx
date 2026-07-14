/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { PageSkeleton } from './components/PageSkeleton';

// Lazy load Pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const SolutionsPage = lazy(() => import('./pages/SolutionsPage').then(m => ({ default: m.SolutionsPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const SignUp = lazy(() => import('./pages/SignUp').then(m => ({ default: m.SignUp })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const Widget = lazy(() => import('./pages/Widget').then(m => ({ default: m.Widget })));
const WIDGET_CHATBOT_ID = 'd294bbbd-02e5-4b5b-931f-3bf3f354257a';

export default function App() {
  const location = useLocation();
  const isStandalonePage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/dashboard/profile' ||
    location.pathname === '/auth/callback' ||
    location.pathname.startsWith('/widget/');

  // The /widget/:chatbotId route is rendered *inside* the widget's own
  // iframe. If that route also loads widget-loader.js, it embeds a
  // fresh copy of itself inside itself -- and that copy does the same
  // thing, forever. This guard is what makes the widget safe to show
  // on every real page without that recursion.

  useEffect(() => {
    if (location.pathname.startsWith('/widget/')) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://vella-3.onrender.com/widget-loader.js';
    script.dataset.vellaChatbotId = WIDGET_CHATBOT_ID;
    document.body.appendChild(script);

    return () => {
      script.remove();
      document
        .querySelectorAll('iframe[src*="vella-3.onrender.com/widget/"]')
        .forEach((el) => el.remove());
      // Also clear the loader's own mount guard so navigating back to
      // a normal page re-mounts cleanly instead of thinking it's
      // already running from a previous route.
      const vellaWindow = window as any;
      if (vellaWindow.__vellaMountedChatbots) {
        vellaWindow.__vellaMountedChatbots.delete(WIDGET_CHATBOT_ID);
      }
    };
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-vella-black overflow-hidden selection:bg-vella-white selection:text-vella-black">
      <ScrollToTop />
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_80%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none blur-[120px] bg-vella-white rounded-full" />

      <div className="relative z-10 flex flex-col items-center">
        {!isStandalonePage && <Navbar />}

        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/widget/:chatbotId" element={<Widget />} />
          </Routes>
        </Suspense>

        {!isStandalonePage && <Footer />}
      </div>
    </div>
  );
}