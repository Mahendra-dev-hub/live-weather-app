# WeatherNow React Frontend

## Run

1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run:

```bash
npm install
npm run dev
```

4. Open the Vite URL, usually `http://localhost:5173`.

## FastAPI integration

The frontend calls:

`GET http://127.0.0.1:8000/weather/{city}`

Expected JSON:

```json
{
  "city": "Hyderabad",
  "temperature": 29.5,
  "humidity": 70,
  "wind_speed": 12,
  "feels_like": 30,
  "visibility": 10,
  "pressure": 1012,
  "uv_index": 5,
  "condition": "Cloudy"
}
```

Optional location endpoint:

`GET /weather/coordinates?lat=17.3850&lon=78.4867`

If React and FastAPI run on different ports, enable CORS in FastAPI for `http://localhost:5173`.

The current-weather panel uses FastAPI data. Hourly and 5-day forecast cards are demo data until matching forecast endpoints are added.
