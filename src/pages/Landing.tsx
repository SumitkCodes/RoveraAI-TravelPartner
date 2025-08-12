import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Map, Cloud, Camera, Bot, HelpCircle, MapPin, Clock, Thermometer, Route } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI-Powered Itineraries",
      description: "Generate personalized travel plans using advanced AI that understands your preferences and creates optimal routes."
    },
    {
      icon: <Map className="h-8 w-8" />,
      title: "Real-Time Maps & Navigation", 
      description: "Integrated Google Maps with live traffic updates, distance calculations, and travel time estimates for seamless navigation."
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: "Weather-Aware Planning",
      description: "Smart itinerary adjustments based on real-time weather forecasts to ensure optimal travel experiences."
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Rich Visual Content",
      description: "Beautiful destination photos and visual guides powered by Unsplash to inspire your journey."
    }
  ];

  const howToSteps = [
    {
      step: 1,
      title: "Sign Up & Create Account",
      description: "Register with your email to access Rovera AI's powerful travel planning features."
    },
    {
      step: 2,
      title: "Plan Your Trip",
      description: "Enter your destination, travel dates, budget, and preferences. Our AI will analyze your requirements."
    },
    {
      step: 3,
      title: "Get AI-Generated Itinerary",
      description: "Receive a detailed day-by-day itinerary with attractions, restaurants, hotels, and optimal routes."
    },
    {
      step: 4,
      title: "Explore Enhanced Details",
      description: "View distance from hotel, travel times, weather forecasts, and beautiful destination photos for each location."
    },
    {
      step: 5,
      title: "Regenerate & Customize",
      description: "Not satisfied? Regenerate your itinerary or modify specific details to match your exact preferences."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <img 
            src="/webapp-uploads/d30e48e0-0cd4-4547-8809-30687868a30a.png" 
            alt="Rovera AI" 
            className="h-10 w-10 rounded-full"
          />
          <span className="text-2xl font-bold text-white">Rovera AI</span>
        </div>
        <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
              <HelpCircle className="h-4 w-4 mr-2" />
              How to Use
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">How to Use Rovera AI</DialogTitle>
              <DialogDescription>
                Follow these simple steps to create your perfect AI-powered travel itinerary
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {howToSteps.map((step) => (
                <Card key={step.step} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant="default" className="rounded-full w-8 h-8 flex items-center justify-center">
                        {step.step}
                      </Badge>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <img 
              src="/webapp-uploads/d30e48e0-0cd4-4547-8809-30687868a30a.png" 
              alt="Rovera AI Logo" 
              className="h-24 w-24 rounded-full shadow-travel-lg"
            />
          </div>
          <h1 className="text-6xl font-bold text-white mb-6">
            Rovera AI
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Dynamic AI-powered travel itinerary planner integrating weather, maps, and real-time data APIs for the perfect Indian travel experience
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <MapPin className="h-3 w-3 mr-1" />
              Google Maps Integration
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Thermometer className="h-3 w-3 mr-1" />
              Weather Forecasts
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Real-Time Data
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Route className="h-3 w-3 mr-1" />
              Optimal Routes
            </Badge>
          </div>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3"
            onClick={onGetStarted}
          >
            Start Planning Your Journey
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4 text-white">
                  {feature.icon}
                </div>
                <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/80 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Credits Section */}
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Credits</h2>
          <div className="text-center mb-8">
            <p className="text-white/90 text-lg mb-2">
              Rovera AI — Dynamic AI-powered travel itinerary planner integrating weather, maps, and real-time data APIs — was designed and developed by:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Sumit Kumar Das</CardTitle>
                <CardDescription className="text-white/80">
                  Data Scientist | Full Stack Developer | Cybersecurity Specialist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/90 text-sm">
                  Architected and developed Rovera AI's full-stack platform using TypeScript, React, Tailwind CSS, Supabase, 
                  and integrated Google Maps, OpenWeather, Perplexity Sonar, and Unsplash APIs for real-time, dynamic itineraries.
                </p>
                <p className="text-white/80 text-sm">
                  Expertise in Data Science, MERN Stack Development, Cybersecurity, and DevOps tools.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="text-white border-white/30">
                    <a href="https://sumitkcodes.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs">
                      Portfolio: sumitkcodes.vercel.app
                    </a>
                  </Badge>
                  <Badge variant="outline" className="text-white border-white/30">
                    <a href="https://github.com/SumitkCodes" target="_blank" rel="noopener noreferrer" className="text-xs">
                      GitHub: SumitkCodes
                    </a>
                  </Badge>
                  <Badge variant="outline" className="text-white border-white/30">
                    <a href="https://linkedin.com/in/sumitkumar17das" target="_blank" rel="noopener noreferrer" className="text-xs">
                      LinkedIn: sumitkumar17das
                    </a>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Nandini Kumari Das</CardTitle>
                <CardDescription className="text-white/80">
                  Data Scientist | Full Stack Developer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/90 text-sm">
                  Contributed to front-end and back-end development, user experience design, and performance optimization for Rovera AI.
                </p>
                <p className="text-white/80 text-sm">
                  Skilled in React.js, Next.js, Machine Learning, Computer Vision, and REST API integration.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="text-white border-white/30">
                    <a href="https://nandinikdcmd.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs">
                      Portfolio: nandinikdcmd.vercel.app
                    </a>
                  </Badge>
                  <Badge variant="outline" className="text-white border-white/30">
                    <a href="https://github.com/Nandini-CMD" target="_blank" rel="noopener noreferrer" className="text-xs">
                      GitHub: Nandini-CMD
                    </a>
                  </Badge>
                  <Badge variant="outline" className="text-white border-white/30">
                    <a href="https://linkedin.com/in/nandinik18das" target="_blank" rel="noopener noreferrer" className="text-xs">
                      LinkedIn: nandinik18das
                    </a>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;