
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Globe, Award } from 'lucide-react';

const stats = [
  {
    value: '10,000+',
    label: 'Lives Impacted',
    description: 'People reached through our programs',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    value: '2,500+',
    label: 'Learners Educated',
    description: 'Students completing our courses',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    value: '50+',
    label: 'Countries Reached',
    description: 'Global community presence',
    icon: Globe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    value: '95%',
    label: 'Success Rate',
    description: 'Program completion rate',
    icon: Award,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

const ImpactStats = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real results from real people. See how our community is creating positive change across the globe.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-2xl mb-6`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                
                <div className="text-3xl font-heading font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {stat.label}
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quote Section */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 lg:p-12">
            <blockquote className="text-2xl lg:text-3xl font-heading font-semibold text-gray-900 mb-6">
              "The best way to find yourself is to lose yourself in the service of others."
            </blockquote>
            <cite className="text-lg text-gray-600 font-medium">— Mahatma Gandhi</cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
