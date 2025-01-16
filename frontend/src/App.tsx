import React, { useState } from 'react';
import { NavBarDemo } from './components/ui/tubelight-navbar.demo';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Statistics } from './components/Statistics';
import { PlatformSupport } from './components/PlatformSupport';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';

function App() {
  // Mock authentication state
  const isAuthenticated = true;
  // Mock current path state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Handle navigation
  React.useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Render content based on path and auth state
  const renderContent = () => {
    if (currentPath === '/dashboard' && isAuthenticated) {
      return <Dashboard />;
    }
    return (
      <>
        <Hero />
        <Features />
        <Statistics />
        <PlatformSupport />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Footer />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <NavBarDemo />
      
      {/* Main content */}
      <div className="relative">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;