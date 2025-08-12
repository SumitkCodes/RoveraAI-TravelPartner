import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, startDate, endDate, arrivalTime, departureTime, budget, tripVibe, hotelName, hotelAddress, numberOfPeople, tripId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing itinerary request for user:', user.id);

    // Check daily API usage limit
    const today = new Date().toISOString().split('T')[0];
    const { data: usage, error: usageError } = await supabaseClient
      .from('api_usage')
      .select('request_count')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .maybeSingle();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Usage check error:', usageError);
      return new Response(
        JSON.stringify({ error: 'Failed to check usage limits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentUsage = usage?.request_count || 0;
    if (currentUsage >= 5) {
      return new Response(
        JSON.stringify({ error: 'Daily API limit reached (5 requests per day)' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update API usage
    const { error: upsertError } = await supabaseClient
      .from('api_usage')
      .upsert({
        user_id: user.id,
        usage_date: today,
        request_count: currentUsage + 1
      }, { 
        onConflict: 'user_id,usage_date' 
      });

    if (upsertError) {
      console.error('Usage update error:', upsertError);
    }

    // Generate itinerary using Sonar AI
    const sonarApiKey = Deno.env.get('SONAR_API_KEY');
    if (!sonarApiKey) {
      console.error('SONAR_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get weather data using OpenWeather API
    const openWeatherKey = Deno.env.get('OPENWEATHER_API_KEY');
    let weatherContext = '';
    
    if (openWeatherKey) {
      try {
        const weatherResponse = await fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${destination}&appid=${openWeatherKey}&units=metric`);
        const weatherData = await weatherResponse.json();
        
        if (weatherData.list) {
          const tripWeather = weatherData.list.slice(0, 5).map((forecast: any) => ({
            date: forecast.dt_txt.split(' ')[0],
            temp: Math.round(forecast.main.temp),
            condition: forecast.weather[0].main,
            description: forecast.weather[0].description
          }));
          weatherContext = `Weather forecast: ${tripWeather.map(w => `${w.date}: ${w.temp}°C, ${w.condition}`).join(', ')}`;
        }
      } catch (error) {
        console.error('Weather API error:', error);
      }
    }

    // Get Google Maps data for distances and travel times
    const googleMapsKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    let travelContext = '';
    
    if (googleMapsKey && hotelAddress) {
      try {
        // Get coordinates for the destination city to find popular attractions
        const geocodeResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${googleMapsKey}`);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.results?.[0]) {
          const { lat, lng } = geocodeData.results[0].geometry.location;
          
          // Get nearby places (attractions) around the destination
          const placesResponse = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=tourist_attraction&key=${googleMapsKey}`);
          const placesData = await placesResponse.json();
          
          if (placesData.results?.length > 0) {
            // Get travel times from hotel to top attractions
            const topAttractions = placesData.results.slice(0, 5);
            const destinations = topAttractions.map(place => `${place.geometry.location.lat},${place.geometry.location.lng}`).join('|');
            
            const distanceResponse = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(hotelAddress)}&destinations=${destinations}&mode=driving&key=${googleMapsKey}`);
            const distanceData = await distanceResponse.json();
            
            if (distanceData.rows?.[0]?.elements) {
              const travelTimes = distanceData.rows[0].elements.map((element, index) => ({
                attraction: topAttractions[index].name,
                distance: element.distance?.text || 'Unknown',
                duration: element.duration?.text || 'Unknown'
              }));
              
              travelContext = `Travel times from hotel: ${travelTimes.map(t => `${t.attraction}: ${t.duration} (${t.distance})`).join(', ')}`;
            }
          }
        }
      } catch (error) {
        console.error('Google Maps API error:', error);
      }
    }

    const hotelInfo = hotelName && hotelAddress ? `User is staying at ${hotelName} located at ${hotelAddress}. Recommend activities and attractions near this hotel and optimize travel times from this location. ${travelContext}` : '';
    
    
    const prompt = `Create a detailed day-by-day itinerary for ${numberOfPeople} people visiting ${destination}, from ${startDate} to ${endDate}, arrival time ${arrivalTime}, departure time ${departureTime}, budget ₹${budget}, trip vibe: ${tripVibe}.

${hotelInfo}
${weatherContext}

IMPORTANT: Calculate all costs for ${numberOfPeople} people. Include both per-person and total group costs.

Include for each attraction:
- Distance from hotel (if hotel provided)
- Estimated travel time from hotel
- Best time to visit considering traffic
- Popular attractions with descriptions (focus on Indian culture if destination is in India)
- Hidden gems and seasonal recommendations
- Local food recommendations with price ranges (Budget/Mid/High) and costs for ${numberOfPeople} people
- Suggested visit times for each attraction
- Travel tips specific to the destination
- Weather-appropriate activity suggestions
- Cost calculations for the entire group of ${numberOfPeople} people

Format the response as JSON with this structure:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Detailed description",
          "duration": "2 hours",
          "cost_estimate": 500
        }
      ],
       "attractions": [
         {
           "name": "Attraction name",
           "description": "Description",
           "visit_time": "Best time to visit",
           "entrance_fee": 200,
           "distance_from_hotel": "2.5 km",
           "travel_time_from_hotel": "15 minutes",
           "recommended_duration": "2 hours"
         }
        }
      ],
       "food_recommendations": [
         {
           "name": "Restaurant/dish name",
           "cuisine": "Type of cuisine",
           "price_range": "Budget/Mid/High",
           "cost_per_person": 300,
           "total_cost_for_group": ${numberOfPeople * 300},
           "description": "What makes it special"
         }
       ],
       "estimated_day_cost": 2000,
       "estimated_day_cost_for_group": ${numberOfPeople * 2000}
     }
   ],
   "travel_tips": ["tip1", "tip2"],
   "total_cost_per_person": 15000,
   "total_cost_for_${numberOfPeople}_people": ${numberOfPeople * 15000},
   "cost_breakdown": {
     "accommodation_per_night": 3000,
     "food_per_person_per_day": 1000,
     "attractions_per_person": 500,
     "transport_per_person": 800
   }
}`;

    console.log('Calling Sonar AI with prompt...');

    const sonarResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sonarApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a travel expert specializing in Indian destinations. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!sonarResponse.ok) {
      const errorText = await sonarResponse.text();
      console.error('Sonar API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sonarData = await sonarResponse.json();
    console.log('Sonar AI response received');

    let itineraryData;
    try {
      const content = sonarData.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }
      
      // Clean up the content to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      itineraryData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch images from Unsplash for attractions
    const unsplashAccessKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
    if (unsplashAccessKey) {
      console.log('Fetching attraction images from Unsplash...');
      
      for (const day of itineraryData.days) {
        if (day.attractions && Array.isArray(day.attractions)) {
          for (const attraction of day.attractions) {
            try {
              // Search for attraction image on Unsplash
              const searchQuery = `${attraction.name} ${destination}`.replace(/[^a-zA-Z0-9\s]/g, '');
              const unsplashResponse = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
                {
                  headers: {
                    'Authorization': `Client-ID ${unsplashAccessKey}`,
                  },
                }
              );

              if (unsplashResponse.ok) {
                const unsplashData = await unsplashResponse.json();
                if (unsplashData.results && unsplashData.results.length > 0) {
                  attraction.image_url = unsplashData.results[0].urls.regular;
                  console.log(`Found image for ${attraction.name}`);
                } else {
                  // Fallback: search for destination only
                  const fallbackResponse = await fetch(
                    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&per_page=1&orientation=landscape`,
                    {
                      headers: {
                        'Authorization': `Client-ID ${unsplashAccessKey}`,
                      },
                    }
                  );
                  
                  if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.results && fallbackData.results.length > 0) {
                      attraction.image_url = fallbackData.results[0].urls.regular;
                      console.log(`Found fallback image for ${attraction.name}`);
                    }
                  }
                }
              }
            } catch (imageError) {
              console.error(`Error fetching image for ${attraction.name}:`, imageError);
              // Continue without image - not a critical error
            }
            
            // Small delay to respect API rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    } else {
      console.log('Unsplash API key not found, skipping image fetching');
    }

    // Save itinerary to database
    const { error: saveError } = await supabaseClient
      .from('itineraries')
      .delete()
      .eq('trip_id', tripId);

    if (saveError) {
      console.error('Error deleting existing itinerary:', saveError);
    }

    // Save new itinerary data with weather info
    const itineraryInserts = itineraryData.days.map((day: any, index: number) => ({
      trip_id: tripId,
      day_number: index + 1,
      activities: day.activities || [],
      attractions: day.attractions || [],
      food_recommendations: day.food_recommendations || [],
      travel_times: {},
      weather_info: itineraryData.weather_forecast || {}
    }));

    const { error: insertError } = await supabaseClient
      .from('itineraries')
      .insert(itineraryInserts);

    if (insertError) {
      console.error('Error saving itinerary:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save itinerary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update trip status
    await supabaseClient
      .from('trips')
      .update({ status: 'generated' })
      .eq('id', tripId);

    console.log('Itinerary generation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        itinerary: itineraryData,
        usage: currentUsage + 1 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});