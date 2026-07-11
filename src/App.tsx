/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
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
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const Widget = lazy(() => import('./pages/Widget').then(m => ({ default: m.Widget })));

export default function App() {
  const location = useLocation();
  const isStandalonePage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/auth/callback' ||
    location.pathname.startsWith('/widget/');

  return (
    <div className="relative min-h-screen bg-vella-black overflow-hidden selection:bg-vella-white selection:text-vella-black">
      <ScrollToTop />
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_80%)]" />

      {/* Ambient Glows */}
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
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/widget/:chatbotId" element={<Widget />} />
          </Routes>
        </Suspense>

        {!isStandalonePage && <Footer />}
      </div>
    </div>
  );
}
