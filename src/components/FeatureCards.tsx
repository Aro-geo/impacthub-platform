
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Leaf, Heart, ArrowRight } from 'lucide-react';

const features = [
  {
    id: 'education',
    title: 'Education Access',
    description: 'Breaking down barriers to quality education with accessible learning resources, scholarships, and mentorship programs.',
    icon: BookOpen,
    gradient: 'bg-education-gradient',
    stats: '2,500+ learners',
    benefits: ['Free courses', 'Expert mentors', 'Certificates']
  },
  {
    id: 'accessibility',
    title: 'Accessibility First',
    description: 'Creating inclusive digital experiences and advocating for universal design principles that work for everyone.',
    icon: Users,
    gradient: 'bg-accessibility-gradient',
    stats: '100% accessible',
    benefits: ['Screen reader support', 'High contrast', 'Voice navigation']
  },
  {
    id: 'sustainability',
    title: 'Environmental Impact',
    description: 'Promoting sustainable practices through community initiatives, green technology, and environmental education.',
    icon: Leaf,
    gradient: 'bg-sustainability-gradient',
    stats: '10,000 trees planted',
    benefits: ['Carbon tracking', 'Green projects', 'Eco rewards']
  },
  {
    id: 'community',
    title: 'Community Support',
    description: 'Building stronger communities by connecting people, sharing resources, and supporting marginalized voices.',
    icon: Heart,
    gradient: 'bg-community-gradient',
    stats: '500+ connections',
    benefits: ['Peer support', 'Resource sharing', 'Safe spaces']
  }
];

const FeatureCards = () => {
  return (
    <section id="impact" className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
            Four Pillars of Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our mission is built on creating meaningful change across these four critical areas, 
            ensuring no one is left behind in our journey toward a better world.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.id} 
              className="impact-card border-0 shadow-lg hover:shadow-2xl bg-card overflow-hidden group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                {/* Gradient Header */}
                <div className={`${feature.gradient} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <feature.icon className="h-8 w-8 mb-4" />
                  <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
                  <div className="text-white/90 text-sm font-medium">{feature.stats}</div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                  
                  {/* Benefits List */}
                  <div className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm text-card-foreground">
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3"></div>
                        {benefit}
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-accent text-card-foreground font-medium"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
            Ready to make an impact?
          </div>
          <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold px-8 py-4 rounded-xl">
            Join Our Community
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
