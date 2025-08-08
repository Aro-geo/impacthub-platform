
import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeatureCards from '@/components/FeatureCards';
import ImpactStats from '@/components/ImpactStats';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeatureCards />
      <ImpactStats />
      <Footer />
    </div>
  );
};

export default Index;
