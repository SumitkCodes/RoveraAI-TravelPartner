

🌍 ROVERA AI - Dynamic Travel Itinerary 

An AI-driven platform that creates dynamic, personalized travel itineraries by integrating real-time data from multiple APIs — Google Maps, OpenWeather, Perplexity Sonar, and Unsplash — with secure, scalable backend support via Supabase.

⸻

✨ Features
	•	🧠 AI-Powered Recommendations
Uses Perplexity Sonar to generate smart, context-aware trip plans.
	•	📍 Real-Time Traffic & Navigation
Google Maps API integration ensures optimized routes based on live traffic data.
	•	☀️ Weather-Aware Planning
Incorporates OpenWeather data to adjust activities for the best possible experience.
	•	📸 Rich Visuals
Automatically fetches stunning images from Unsplash to visually enhance itineraries.
	•	🔐 Secure Cloud Backend
Supabase-powered authentication and database ensure safe storage and easy retrieval.
	•	⚡ Seamless API Orchestration
All services work together in real-time for an uninterrupted planning experience.

⸻

🛠 Tech Stack
	•	Frontend: React / Next.js (or your choice framework)
	•	Backend: Node.js / Supabase Functions
	•	Database & Auth: Supabase
	•	APIs used:
	•	1)Google Maps Platform
	•	2)OpenWeather
	•	3)Perplexity Sonar
	•	4)Unsplash

⸻

🚀 Getting Started

1️⃣ Clone the Repository

git clone https://github.com/yourusername/travel-itinerary-ai.git
cd travel-itinerary-ai

2️⃣ Install Dependencies

npm install

3️⃣ Set Up Environment Variables

Create a .env.local file in the root directory and add your API keys:

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PERPLEXITY_API_KEY=your_perplexity_sonar_key

4️⃣ Run the Development Server

npm run dev

Open http://localhost:3000 to see your app.

⸻

🧩 How It Works
	1.	User Input – The user enters their trip destination, dates, and preferences.
	2.	Data Gathering – APIs fetch weather, traffic, and location info in real-time.
	3.	AI Processing – Perplexity Sonar generates a tailored itinerary.
	4.	Visual Enhancement – Unsplash provides destination images.
	5.	Database Storage – Supabase securely stores the itinerary for future access.

⸻

🏆 Why This Project?

Trip planning is often fragmented across different apps and websites.
This platform unifies everything into one intuitive interface that adapts to real-world conditions like traffic and weather, ensuring a smooth and enjoyable travel experience.

⸻

📜 License

MIT License © 2025 Sumit Das

