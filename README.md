
<h1 align="center">🌍 ROVERA AI – Dynamic Travel Itinerary Planner</h1>

  An AI-powered platform that creates <strong>dynamic, personalized travel itineraries</strong> by integrating real-time data from multiple APIs — <strong>Google Maps</strong>, <strong>OpenWeather</strong>, <strong>Perplexity Sonar</strong>, and <strong>Unsplash</strong> — with secure, scalable backend support via <strong>Supabase</strong>.
</p>
<h2 align="center">
  <a href="https://roveratripai.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐%20Visit%20Website%20-Live-brightgreen?style=for-the-badge&logo=vercel&logoColor=white" alt="Website Live" />
  </a>
</h2>

<p align="center">


## ✨ Features

- 🧠 **AI-Powered Recommendations** – Generates context-aware trip plans using **Perplexity Sonar**.  
- 📍 **Real-Time Traffic & Navigation** – Optimized routes from **Google Maps API** with live traffic updates.  
- ☀️ **Weather-Aware Planning** – Adjusts itinerary activities based on **OpenWeather** forecasts.  
- 📸 **Rich Visuals** – Fetches stunning images from **Unsplash** for a visually enhanced itinerary.  
- 🔐 **Secure Cloud Backend** – Powered by **Supabase** for authentication & storage.  
- ⚡ **Seamless API Orchestration** – All services work together in real-time for uninterrupted planning.  

---

## 🛠 Tech Stack

| Category        | Technology |
|-----------------|------------|
| **Frontend**    | React / Next.js |
| **Backend**     | Node.js / Supabase Functions |
| **Database/Auth** | Supabase |
| **APIs Used**   | Google Maps, OpenWeather, Perplexity Sonar, Unsplash |

---





## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/travel-itinerary-ai.git
cd travel-itinerary-ai
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env.local` file in the root directory and add your API keys:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PERPLEXITY_API_KEY=your_perplexity_sonar_key
```

### 4️⃣ Run the Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** to view the app.

---

## 🧩 How It Works

1. **User Input** – User enters destination, dates, and preferences.
2. **Data Gathering** – APIs fetch weather, traffic, and location info in real-time.
3. **AI Processing** – Perplexity Sonar generates a tailored itinerary.
4. **Visual Enhancement** – Unsplash provides destination images.
5. **Database Storage** – Supabase securely stores the itinerary for future access.

---

## 🏆 Why This Project?

Trip planning is often **fragmented** across multiple apps and websites.
This platform unifies **everything** into one intuitive interface that adapts to real-world conditions like traffic and weather — ensuring a **smooth, personalized, and enjoyable** travel experience.

---

## 📜 License

MIT License © 2025 [Sumit Das](https://github.com/SumitkCodes)

