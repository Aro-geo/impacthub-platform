
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen bg-hero-gradient relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Large Logo in Hero */}
            <div className="flex justify-center lg:justify-start mb-8">
              <Logo size="xl" variant="white" className="drop-shadow-lg" />
            </div>
            
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-6 glass-effect">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Join 10,000+ changemakers worldwide
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
              Empowering
              <span className="block text-gradient bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Positive Change
              </span>
              for Everyone
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              Join a community of changemakers creating impact through education, accessibility, 
              sustainability, and community support. Together, we're building a better future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 rounded-xl pulse-glow"
              >
                Start Your Impact Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="ghost" 
                className="text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl border border-white/30"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Our Story
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-white/80 text-sm">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-white/80 text-sm">Lives Impacted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-white/80 text-sm">Countries</div>
              </div>
            </div>
          </div>
          
          {/* Visual Element */}
          <div className="relative">
            <div className="relative z-10 float-animation">
              <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 glass-effect">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-education-gradient rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">📚</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Education Access</div>
                      <div className="text-white/70 text-sm">+95% completion rate</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accessibility-gradient rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">♿</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Accessibility</div>
                      <div className="text-white/70 text-sm">Universal design principles</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-sustainability-gradient rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🌱</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Sustainability</div>
                      <div className="text-white/70 text-sm">Carbon-neutral initiatives</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-community-gradient rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🤝</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Community</div>
                      <div className="text-white/70 text-sm">Inclusive support network</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
