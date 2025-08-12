import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, MapPin, Calendar, Users, Sparkles, LogOut } from 'lucide-react';
import { TripPlanningForm } from './TripPlanningForm';
import { TripDetails } from './TripDetails';

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  trip_vibe: string;
  budget: number;
  arrival_time?: string;
  departure_time?: string;
}

interface ApiUsage {
  request_count: number;
}

export const Dashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTripForm, setShowTripForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load user trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;

      // Load API usage for today
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData, error: usageError } = await supabase
        .from('api_usage')
        .select('request_count')
        .eq('usage_date', today)
        .maybeSingle();

      if (usageError && usageError.code !== 'PGRST116') throw usageError;

      setTrips(tripsData || []);
      setApiUsage(usageData || { request_count: 0 });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "See you next time!",
    });
  };

  const getVibeColor = (vibe: string) => {
    const colors = {
      Adventure: 'adventure',
      Relax: 'ocean',
      Culture: 'cultural',
      Foodie: 'sunset',
      Luxury: 'luxury'
    };
    return colors[vibe as keyof typeof colors] || 'default';
  };

  if (showTripForm) {
    return (
      <TripPlanningForm 
        onBack={() => setShowTripForm(false)}
        onTripCreated={loadDashboardData}
      />
    );
  }

  if (selectedTrip) {
    return (
      <TripDetails 
        trip={selectedTrip}
        onBack={() => setSelectedTrip(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero shadow-travel-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/webapp-uploads/d30e48e0-0cd4-4547-8809-30687868a30a.png" 
                alt="Rovera AI" 
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">Rovera Dashboard</h1>
                <p className="text-white/80">Plan your next adventure with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="bg-white/20 border-white/30">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 text-white">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      AI Requests: {apiUsage?.request_count || 0}/5 today
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Button variant="outline" onClick={handleSignOut} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Trips</h2>
            <p className="text-muted-foreground">Manage and create your travel plans</p>
          </div>
          <Button 
            onClick={() => setShowTripForm(true)}
            variant="hero"
            disabled={(apiUsage?.request_count || 0) >= 5}
            className="shadow-travel-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Plan New Trip
          </Button>
        </div>

        {/* Trip Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <Card className="text-center py-12 shadow-travel-md">
            <CardContent>
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No trips yet</CardTitle>
              <CardDescription className="mb-6">
                Start planning your first adventure with our AI-powered travel assistant
              </CardDescription>
              <Button 
                onClick={() => setShowTripForm(true)}
                variant="hero"
                disabled={(apiUsage?.request_count || 0) >= 5}
              >
                <Plus className="h-4 w-4 mr-2" />
                Plan Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="shadow-travel-md hover:shadow-travel-lg transition-all duration-300 transform hover:scale-105">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{trip.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {trip.destination}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {trip.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </div>
                    {trip.trip_vibe && (
                      <Badge variant="outline" className={`bg-gradient-${getVibeColor(trip.trip_vibe)} text-white border-0`}>
                        {trip.trip_vibe}
                      </Badge>
                    )}
                    {trip.budget && (
                      <div className="text-sm text-muted-foreground">
                        Budget: ₹{trip.budget.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => setSelectedTrip(trip)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};