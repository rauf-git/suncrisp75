import { Award, Users, Globe, Building } from 'lucide-react';
import { AboutData } from '@/types';

interface AboutProps {
  data: AboutData;
}

const stats = [
  { icon: Building, value: '150+', label: 'Projects Completed' },
  { icon: Users, value: '50+', label: 'Expert Team Members' },
  { icon: Globe, value: '12', label: 'Countries Served' },
  { icon: Award, value: '25+', label: 'Industry Awards' },
];

const About = ({ data }: AboutProps) => {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative animate-fade-in">
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <img
                src={data.image}
                alt="About Suncrisp"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border-2 border-primary rounded-lg -z-10" />
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 -left-8 bg-primary text-primary-foreground p-6 rounded-lg shadow-elevated">
              <p className="font-serif text-4xl font-bold">20+</p>
              <p className="text-primary-foreground/80 text-sm uppercase tracking-wider">Years of Excellence</p>
            </div>
          </div>

          {/* Content */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-primary font-sans text-sm uppercase tracking-[0.3em] mb-4">
              Our Story
            </p>
            <h2 className="section-title mb-6">{data.title}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {data.description}
            </p>
            
            {/* Values */}
            <div className="space-y-4 mb-10">
              {['Integrity in every foundation', 'Innovation in design', 'Excellence in service'].map((value, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-16 border-t border-border">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className="w-8 h-8 text-primary mx-auto mb-4" />
                <p className="font-serif text-4xl font-bold text-foreground mb-2">{stat.value}</p>
                <p className="text-muted-foreground text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
