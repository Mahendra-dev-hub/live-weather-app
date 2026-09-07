import requests

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()


# --------------------------------------------------
# CORS - allows React frontend to call FastAPI
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://live-weather-app-xi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Home endpoint
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Weather API is running"
    }


# --------------------------------------------------
# Function: Get weather using latitude and longitude
# --------------------------------------------------

def get_weather_by_coordinates(lat: float, lon: float):

    weather_url = "https://api.open-meteo.com/v1/forecast"

    weather_params = {
        "latitude": lat,
        "longitude": lon,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "wind_speed_10m,"
            "apparent_temperature,"
            "surface_pressure,"
            "weather_code"
        )
    }

    try:
        response = requests.get(
            weather_url,
            params=weather_params,
            timeout=10
        )

        response.raise_for_status()

        weather_data = response.json()

    except requests.RequestException as e:
        print("OPEN-METEO ERROR:", repr(e))
        raise HTTPException(
            status_code=503,
            detail=f"Open-Meteo error: {str(e)}"
        )


    if "current" not in weather_data:
        raise HTTPException(
            status_code=500,
            detail="Weather data not available"
        )


    current = weather_data["current"]


    return {
        "temperature": current.get("temperature_2m"),
        "humidity": current.get("relative_humidity_2m"),
        "wind_speed": current.get("wind_speed_10m"),
        "feels_like": current.get("apparent_temperature"),
        "pressure": current.get("surface_pressure"),
        "weather_code": current.get("weather_code")
    }


# --------------------------------------------------
# Function: Get weather using city name
# --------------------------------------------------

def get_weather(city: str):

    geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"


    geocoding_params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }


    try:
        response = requests.get(
            geocoding_url,
            params=geocoding_params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as e:
        print("GEOCODING ERROR:", repr(e))
        raise HTTPException(
            status_code=503,
            detail=f"Geocoding error: {str(e)}"
        )


    # Check whether city exists
    if "results" not in data or len(data["results"]) == 0:
        raise HTTPException(
            status_code=404,
            detail="City not found"
        )


    city_data = data["results"][0]

    latitude = city_data["latitude"]
    longitude = city_data["longitude"]


    # Get weather using coordinates
    weather = get_weather_by_coordinates(
        latitude,
        longitude
    )


    return {
        "city": city_data.get("name", city),
        "country": city_data.get("country"),
        "latitude": latitude,
        "longitude": longitude,
        **weather
    }


@app.get("/weather/coordinates")
def weather_by_coordinates(
    lat: float,
    lon: float
):

    result = get_weather_by_coordinates(
        lat,
        lon
    )

    return {
        "latitude": lat,
        "longitude": lon,
        **result
    }
# --------------------------------------------------
# Endpoint 1: Get weather using city
# --------------------------------------------------

@app.get("/weather/{city}")
def weather(city: str):

    result = get_weather(city)

    return result

