
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'About Us', href: '#about' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Success Stories', href: '#stories' },
      { name: 'Impact Report', href: '#impact' }
    ],
    resources: [
      { name: 'Learning Center', href: '#learning' },
      { name: 'Community Forum', href: '#forum' },
      { name: 'Resource Library', href: '#library' },
      { name: 'Webinars', href: '#webinars' }
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'Accessibility', href: '#accessibility' },
      { name: 'Privacy Policy', href: '#privacy' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h3 className="text-3xl font-heading font-bold mb-4">
              Stay Connected with Our Mission
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get updates on our latest impact initiatives, success stories, and opportunities to make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-white"
              />
              <Button 
                className="bg-white text-primary hover:bg-white/90 font-semibold whitespace-nowrap"
              >
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-hero-gradient p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-heading font-bold">ImpactHub</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering positive change through education, accessibility, sustainability, and community support.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-heading font-semibold mb-6">Platform</h4>
                <ul className="space-y-4">
                  {footerLinks.platform.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-heading font-semibold mb-6">Resources</h4>
                <ul className="space-y-4">
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-heading font-semibold mb-6">Support</h4>
                <ul className="space-y-4">
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid md:grid-cols-3 gap-6 text-gray-400">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-gray-500" />
              <span>Global Community, Worldwide Impact</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-3 text-gray-500" />
              <span>hello@impacthub.org</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-3 text-gray-500" />
              <span>+1 (555) IMPACT-1</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} ImpactHub. All rights reserved. Made with ❤️ for positive change.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
