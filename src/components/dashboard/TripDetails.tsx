import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Calendar, Users, Clock, Utensils, Camera, Sparkles, RefreshCw, IndianRupee, Thermometer } from 'lucide-react';

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
  hotel_name?: string;
  hotel_address?: string;
  number_of_people?: number;
}

interface DatabaseItinerary {
  id: string;
  trip_id: string;
  day_number: number;
  activities: any;
  attractions: any;
  food_recommendations: any;
  weather_info?: any;
}

interface TripDetailsProps {
  trip: Trip;
  onBack: () => void;
}

export const TripDetails = ({ trip, onBack }: TripDetailsProps) => {
  const [itineraries, setItineraries] = useState<DatabaseItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadItineraries();
  }, [trip.id]);

  const safeParseJson = (data: any, fallback: any = []) => {
    if (!data) return fallback;
    if (typeof data === 'object') return data;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse JSON:', e, 'Original data:', data);
        return fallback;
      }
    }
    return fallback;
  };

  const loadItineraries = async () => {
    try {
      setIsLoading(true);
      console.log('Loading itineraries for trip:', trip.id);
      
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('trip_id', trip.id)
        .order('day_number', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Loaded itineraries:', data);
      setItineraries(data || []);
      
      if (!data || data.length === 0) {
        console.log('No itineraries found for trip ID:', trip.id);
      }
    } catch (error) {
      console.error('Error loading itineraries:', error);
      toast({
        title: "Error",
        description: "Failed to load trip details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVibeGradient = (vibe: string) => {
    const gradients = {
      Adventure: 'gradient-adventure',
      Relax: 'gradient-ocean',
      Culture: 'gradient-cultural',
      Foodie: 'gradient-sunset',
      Luxury: 'gradient-luxury'
    };
    return gradients[vibe as keyof typeof gradients] || 'gradient-hero';
  };

  const formatDate = (dateString: string, dayNumber: number) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + dayNumber - 1);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const regenerateItinerary = async () => {
    setIsGeneratingItinerary(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-itinerary', {
        body: {
          destination: trip.destination,
          startDate: trip.start_date,
          endDate: trip.end_date,
          arrivalTime: trip.arrival_time,
          departureTime: trip.departure_time,
          budget: trip.budget,
          tripVibe: trip.trip_vibe,
          hotelName: trip.hotel_name,
          hotelAddress: trip.hotel_address,
          numberOfPeople: trip.number_of_people,
          tripId: trip.id,
        },
      });

      if (error) throw error;
      
      toast({
        title: "Itinerary Regenerated!",
        description: "Your trip has been updated with fresh recommendations.",
      });
      
      loadItineraries();
    } catch (error) {
      console.error('Error regenerating itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  // Calculate total cost for the trip
  const calculateTotalCost = () => {
    let totalCost = 0;
    
    itineraries.forEach(day => {
      const activities = safeParseJson(day.activities, []);
      const attractions = safeParseJson(day.attractions, []);
      const foodRecommendations = safeParseJson(day.food_recommendations, []);
      
      // Add activity costs
      activities.forEach((activity: any) => {
        if (activity.cost_estimate) {
          totalCost += typeof activity.cost_estimate === 'number' 
            ? activity.cost_estimate * (trip.number_of_people || 1)
            : 0;
        }
      });
      
      // Add attraction costs
      attractions.forEach((attraction: any) => {
        if (attraction.entrance_fee) {
          totalCost += typeof attraction.entrance_fee === 'number' 
            ? attraction.entrance_fee * (trip.number_of_people || 1)
            : 0;
        }
      });
      
      // Add food costs
      foodRecommendations.forEach((food: any) => {
        if (food.total_cost_for_group) {
          totalCost += typeof food.total_cost_for_group === 'number' 
            ? food.total_cost_for_group
            : (food.cost_per_person || 0) * (trip.number_of_people || 1);
        } else if (food.cost_per_person) {
          totalCost += typeof food.cost_per_person === 'number' 
            ? food.cost_per_person * (trip.number_of_people || 1)
            : 0;
        }
      });
    });
    
    return totalCost;
  };

  const totalTripCost = calculateTotalCost();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-gradient-hero shadow-travel-md">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Loading Trip Details...</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-32 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`bg-${getVibeGradient(trip.trip_vibe)} shadow-travel-md`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{trip.title}</h1>  
              <div className="flex items-center space-x-4 text-white/80 mt-2">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {trip.destination}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </div>
                <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
                  {trip.trip_vibe}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-ocean text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span className="font-medium">Destination</span>
              </div>
              <p className="text-lg font-bold mt-1">{trip.destination}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-sunset text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Duration</span>
              </div>
              <p className="text-lg font-bold mt-1">
                {Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-luxury text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="font-medium">People & Budget</span>
              </div>
              <p className="text-lg font-bold mt-1">
                {trip.number_of_people || 1} people • ₹{trip.budget?.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Total Cost Summary */}
        {totalTripCost > 0 && (
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5" />
                <span>Trip Cost Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total for {trip.number_of_people || 1} people</p>
                  <p className="text-2xl font-bold text-primary">₹{totalTripCost.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Cost per person</p>
                  <p className="text-xl font-semibold">₹{Math.round(totalTripCost / (trip.number_of_people || 1)).toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Budget utilization</p>
                  <p className="text-xl font-semibold">
                    {trip.budget ? Math.round((totalTripCost / trip.budget) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regenerate Button */}
        {trip.status === 'draft' && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <Button 
                onClick={regenerateItinerary}
                disabled={isGeneratingItinerary}
                size="lg"
                className="w-full md:w-auto"
              >
                {isGeneratingItinerary ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Itinerary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Daily Itineraries */}
        {itineraries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No itinerary found</CardTitle>
              <CardDescription className="mb-6">
                The itinerary for this trip hasn't been generated yet. Click the button above to generate one.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {itineraries.map((day) => {
              const activities = safeParseJson(day.activities, []);
              const attractions = safeParseJson(day.attractions, []);
              const foodRecommendations = safeParseJson(day.food_recommendations, []);

              return (
                <Card key={day.id} className="shadow-travel-md">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">Day {day.day_number}</CardTitle>
                        <CardDescription>
                          {formatDate(trip.start_date, day.day_number)}
                        </CardDescription>
                      </div>
                      {day.weather_info && (
                        <div className="flex items-center space-x-2 bg-muted/50 rounded-lg p-3">
                          <Thermometer className="h-4 w-4 text-primary" />
                          <span className="text-sm">Weather info available</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="attractions" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="attractions">Attractions</TabsTrigger>
                        <TabsTrigger value="activities">Activities</TabsTrigger>
                        <TabsTrigger value="food">Food</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="attractions" className="mt-4">
                        {attractions.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {attractions.map((attraction: any, idx: number) => (
                              <Card key={idx} className="border-blue-200 bg-blue-50">
                                <CardContent className="p-4">
                                  {attraction.image_url && (
                                    <img 
                                      src={attraction.image_url} 
                                      alt={attraction.name}
                                      className="w-full h-32 object-cover rounded-lg mb-3"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <h4 className="font-semibold text-blue-900 mb-2">{attraction.name}</h4>
                                  <p className="text-sm text-blue-700 mb-3">{attraction.description}</p>
                                  
                                  <div className="space-y-1 text-xs">
                                    {attraction.distance_from_hotel && (
                                      <p className="text-blue-600">📍 {attraction.distance_from_hotel} from hotel</p>
                                    )}
                                    {attraction.travel_time_from_hotel && (
                                      <p className="text-blue-600">🚗 {attraction.travel_time_from_hotel} travel time</p>
                                    )}
                                    {attraction.entrance_fee && (
                                      <p className="text-blue-800 font-medium">
                                        💰 ₹{attraction.entrance_fee * (trip.number_of_people || 1)} for {trip.number_of_people || 1}
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">No attractions planned for this day</p>
                        )}
                      </TabsContent>

                      <TabsContent value="activities" className="mt-4">
                        {activities.length > 0 ? (
                          <div className="space-y-3">
                            {activities.map((activity: any, idx: number) => (
                              <Card key={idx} className="border-green-200 bg-green-50">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Clock className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">{activity.time}</span>
                                      </div>
                                      <h4 className="font-semibold text-green-900">{activity.title}</h4>
                                      <p className="text-sm text-green-700 mt-1">{activity.description}</p>
                                    </div>
                                    {activity.cost_estimate && (
                                      <div className="text-right">
                                        <span className="text-sm font-medium text-green-800">
                                          ₹{activity.cost_estimate * (trip.number_of_people || 1)} for {trip.number_of_people || 1}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">No activities planned for this day</p>
                        )}
                      </TabsContent>

                      <TabsContent value="food" className="mt-4">
                        {foodRecommendations.length > 0 ? (
                          <div className="space-y-3">
                            {foodRecommendations.map((food: any, idx: number) => (
                              <Card key={idx} className="border-orange-200 bg-orange-50">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-orange-900">{food.name}</h4>
                                    <div className="flex flex-col items-end space-y-1">
                                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                                        {food.price_range || 'Mid'}
                                      </Badge>
                                      {food.total_cost_for_group && (
                                        <span className="text-sm font-medium text-orange-800">
                                          ₹{food.total_cost_for_group} for {trip.number_of_people || 1}
                                        </span>
                                      )}
                                      {!food.total_cost_for_group && food.cost_per_person && (
                                        <span className="text-sm font-medium text-orange-800">
                                          ₹{food.cost_per_person * (trip.number_of_people || 1)} for {trip.number_of_people || 1}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-orange-700 mb-2">{food.cuisine}</p>
                                  <p className="text-sm text-orange-600">{food.description}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">No food recommendations for this day</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};