import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Calendar, Clock, IndianRupee, Sparkles } from 'lucide-react';

interface TripPlanningFormProps {
  onBack: () => void;
  onTripCreated: () => void;
}

export const TripPlanningForm = ({ onBack, onTripCreated }: TripPlanningFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    arrivalTime: '',
    departureTime: '',
    budget: '',
    tripVibe: '',
    hotelName: '',
    hotelAddress: '',
    numberOfPeople: '2',
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create trip record
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .insert({
          title: formData.title,
          destination: formData.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          arrival_time: formData.arrivalTime,
          departure_time: formData.departureTime,
          budget: parseFloat(formData.budget),
          trip_vibe: formData.tripVibe,
          hotel_name: formData.hotelName,
          hotel_address: formData.hotelAddress,
          number_of_people: parseInt(formData.numberOfPeople),
          status: 'draft',
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      toast({
        title: "Trip Created!",
        description: "Generating your personalized itinerary...",
      });

      // Generate itinerary using edge function
      const { data: itineraryData, error: itineraryError } = await supabase.functions.invoke(
        'generate-itinerary',
        {
          body: {
            destination: formData.destination,
            startDate: formData.startDate,
            endDate: formData.endDate,
            arrivalTime: formData.arrivalTime,
            departureTime: formData.departureTime,
            budget: formData.budget,
            tripVibe: formData.tripVibe,
            hotelName: formData.hotelName,
            hotelAddress: formData.hotelAddress,
            numberOfPeople: formData.numberOfPeople,
            tripId: tripData.id,
          },
        }
      );

      if (itineraryError) {
        console.error('Itinerary generation error:', itineraryError);
        toast({
          title: "Itinerary Generation Failed",
          description: itineraryError.message || "Failed to generate itinerary. You can try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Itinerary Generated!",
          description: "Your AI-powered travel plan is ready!",
        });
      }

      onTripCreated();
      onBack();
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat',
    'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Goa', 'Agra', 'Varanasi',
    'Udaipur', 'Rishikesh', 'Manali', 'Shimla', 'Darjeeling', 'Kerala', 'Rajasthan'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero shadow-travel-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Plan Your Adventure</h1>
              <p className="text-white/80">Let AI create your perfect itinerary</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-travel-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Trip Details
            </CardTitle>
            <CardDescription>
              Tell us about your dream destination and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Trip Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Summer Vacation to Goa"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Select onValueChange={(value) => handleInputChange('destination', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            {city}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">Arrival Time</Label>
                  <Input
                    id="arrivalTime"
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => handleInputChange('departureTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      type="number"
                      placeholder="50000"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tripVibe">Trip Vibe</Label>
                  <Select onValueChange={(value) => handleInputChange('tripVibe', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your vibe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Relax">🏖️ Relax - Beach & chill</SelectItem>
                      <SelectItem value="Adventure">🏔️ Adventure - Thrills & excitement</SelectItem>
                      <SelectItem value="Culture">🏛️ Culture - Heritage & history</SelectItem>
                      <SelectItem value="Foodie">🍛 Foodie - Culinary experiences</SelectItem>
                      <SelectItem value="Luxury">💎 Luxury - Premium experiences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfPeople">Number of People</Label>
                  <Select onValueChange={(value) => handleInputChange('numberOfPeople', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="How many people?" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Person' : 'People'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hotel Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hotelName">Hotel Name</Label>
                    <Input
                      id="hotelName"
                      placeholder="e.g., The Taj Mahal Palace"
                      value={formData.hotelName}
                      onChange={(e) => handleInputChange('hotelName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hotelAddress">Hotel Address</Label>
                    <Input
                      id="hotelAddress"
                      placeholder="e.g., Apollo Bunder, Mumbai"
                      value={formData.hotelAddress}
                      onChange={(e) => handleInputChange('hotelAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="hero" 
                  disabled={isLoading}
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Trip
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};