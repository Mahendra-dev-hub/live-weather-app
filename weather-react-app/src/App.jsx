import { useEffect, useState } from "react";
import {
  Cloud, CloudRain, CloudSun, Droplets, Eye, Gauge, Heart,
  LocateFixed, Moon, RefreshCw, Search, Sun, Sunrise, Sunset,
  Thermometer, Wind
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

const hourly = [
  ["Now", "sun", 29], ["13:00", "partly", 30], ["14:00", "partly", 31],
  ["15:00", "cloud", 30], ["16:00", "cloud", 29], ["17:00", "partly", 28],
  ["18:00", "sun", 27], ["19:00", "cloud", 26]
];

const daily = [
  ["Today", "sun", "Sunny", 31, 23],
  ["Tomorrow", "partly", "Partly cloudy", 30, 22],
  ["Monday", "cloud", "Cloudy", 28, 21],
  ["Tuesday", "rain", "Light rain", 27, 20],
  ["Wednesday", "partly", "Partly cloudy", 29, 21]
];

function WeatherIcon({ type = "partly", size = 52 }) {
  const p = { size, strokeWidth: 1.7 };
  if (type === "rain") return <CloudRain {...p} />;
  if (type === "cloud") return <Cloud {...p} />;
  if (type === "sun") return <Sun {...p} />;
  return <CloudSun {...p} />;
}

function iconType(condition = "") {
  const x = condition.toLowerCase();
  if (x.includes("rain") || x.includes("drizzle")) return "rain";
  if (x.includes("cloud")) return "cloud";
  if (x.includes("clear") || x.includes("sun")) return "sun";
  return "partly";
}

function App() {
  const [input, setInput] = useState("Hyderabad");
  const [city, setCity] = useState("Hyderabad");
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");
  const [dark, setDark] = useState(localStorage.getItem("weatherTheme") === "dark");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("weatherFavorites") || "[]")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("weatherTheme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => { fetchWeather("Hyderabad"); }, []);

  function temp(v) {
    if (v === undefined || v === null || Number.isNaN(Number(v))) return "--";
    return unit === "C" ? Math.round(v) : Math.round(v * 9 / 5 + 32);
  }

  async function fetchWeather(target) {
    const name = target.trim();
    if (!name) return setError("Please enter a city name.");
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API_BASE_URL}/weather/${encodeURIComponent(name)}`);
      if (!r.ok) throw new Error("City not found or weather service is unavailable.");
      const data = await r.json();
      setWeather(data);
      setCity(data.city || name);
      setInput(data.city || name);
    } catch (e) {
      setError(`${e.message} Make sure FastAPI is running at ${API_BASE_URL}.`);
    } finally { setLoading(false); }
  }

  async function useLocation() {
    if (!navigator.geolocation) return setError("Geolocation is not supported.");
    setLoading(true); setError("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const r = await fetch(`${API_BASE_URL}/weather/coordinates?lat=${coords.latitude}&lon=${coords.longitude}`);
        if (!r.ok) throw new Error("Unable to get weather for your location.");
        const data = await r.json();
        setWeather(data); setCity(data.city || "My Location"); setInput(data.city || "My Location");
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }, () => { setLoading(false); setError("Location permission was denied."); });
  }

  function favorite() {
    const next = favorites.includes(city)
      ? favorites.filter(x => x !== city)
      : [...favorites, city];
    setFavorites(next);
    localStorage.setItem("weatherFavorites", JSON.stringify(next));
  }

  const condition = weather?.condition || "Partly cloudy";
  const stats = [
    [Droplets, "Humidity", weather?.humidity, "%"],
    [Wind, "Wind", weather?.wind_speed, " km/h"],
    [Thermometer, "Feels like", temp(weather?.feels_like), "°"],
    [Eye, "Visibility", weather?.visibility, " km"],
    [Gauge, "Pressure", weather?.pressure, " hPa"],
    [Sun, "UV index", weather?.uv_index, ""]
  ];

  return (
    <div className="app">
      <main className="container">
        <header>
          <div className="brand">
            <div className="logo"><CloudSun size={27}/></div>
            <div><h1>WeatherNow</h1><p>Real-time weather dashboard</p></div>
          </div>
          <div className="actions">
            <button onClick={() => setUnit(unit === "C" ? "F" : "C")}>°{unit}</button>
            <button onClick={() => setDark(!dark)}><Moon size={18}/></button>
            <button onClick={() => fetchWeather(city)} disabled={loading}><RefreshCw size={18} className={loading ? "spin" : ""}/></button>
          </div>
        </header>

        <form className="search" onSubmit={e => { e.preventDefault(); fetchWeather(input); }}>
          <div className="searchbox"><Search size={19}/><input value={input} onChange={e => setInput(e.target.value)} placeholder="Search city..." /></div>
          <button className="primary">Search</button>
          <button type="button" className="secondary" onClick={useLocation}><LocateFixed size={18}/> My location</button>
        </form>

        {error && <div className="error">{error}</div>}

        <section className="hero">
          <article className="card current">
            <div className="row">
              <div><small>CURRENT WEATHER</small><h2>{city}</h2><p>{new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long"}).format(new Date())}</p></div>
              <button className={`heart ${favorites.includes(city) ? "active" : ""}`} onClick={favorite}><Heart size={21} fill={favorites.includes(city) ? "currentColor" : "none"}/></button>
            </div>
            <div className="temperature">
              <div><div className="big">{temp(weather?.temperature)}<span>°</span></div><p>{condition}</p></div>
              <div className="heroicon"><WeatherIcon type={iconType(condition)} size={112}/></div>
            </div>
            <div className="sun">
              <span><Sunrise size={18}/> Sunrise <b>{weather?.sunrise || "06:05"}</b></span>
              <span><Sunset size={18}/> Sunset <b>{weather?.sunset || "18:25"}</b></span>
            </div>
          </article>

          <article className="card">
            <div className="heading"><div><small>TODAY</small><h3>Weather details</h3></div><em>Live</em></div>
            <div className="stats">
              {stats.map(([Icon,label,value,suffix]) => <div className="stat" key={label}><div className="staticon"><Icon size={18}/></div><div><span>{label}</span><strong>{value ?? "--"}{suffix}</strong></div></div>)}
            </div>
          </article>
        </section>

        <section className="card block">
          <div className="heading"><div><small>FORECAST</small><h3>Hourly forecast</h3></div><span>Next 8 hours</span></div>
          <div className="hours">{hourly.map(([time,type,t]) => <div className="hour" key={time}><span>{time}</span><WeatherIcon type={type} size={29}/><b>{temp(t)}°</b></div>)}</div>
        </section>

        <section className="lower">
          <article className="card block">
            <div className="heading"><div><small>UPCOMING</small><h3>5-day forecast</h3></div></div>
            <div className="days">{daily.map(([day,type,c,hi,lo]) => <div className="day" key={day}><div><b>{day}</b><span>{c}</span></div><WeatherIcon type={type} size={30}/><b>{temp(hi)}° / {temp(lo)}°</b></div>)}</div>
          </article>

          <article className="card block">
            <div className="heading"><div><small>QUICK ACCESS</small><h3>Favorite cities</h3></div></div>
            {favorites.length ? <div className="favorites">{favorites.map(f => <button key={f} onClick={() => fetchWeather(f)}><CloudSun size={19}/>{f}</button>)}</div> :
              <div className="empty"><Heart size={28}/><p>Add cities to quickly switch between them.</p></div>}
          </article>
        </section>

        <footer><span>WeatherNow</span><span>Powered by your FastAPI weather service</span></footer>
      </main>
    </div>
  );
}

export default App;