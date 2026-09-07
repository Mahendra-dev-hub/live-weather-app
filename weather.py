import requests
def get_temp():
    # Step 1: Get latitude and longitude for the city
    url = "https://geocoding-api.open-meteo.com/v1/search"

    params = {
        "name": "Hyderabad",
        "count": 1,
        "language": "en",
        "format": "json"
    }

    response = requests.get(url, params=params)
    data = response.json()

    latitude = data["results"][0]["latitude"]
    longitude = data["results"][0]["longitude"]

    print("Latitude:", latitude)
    print("Longitude:", longitude)

    # Step 2: Get current weather using latitude and longitude
    weather_url = "https://api.open-meteo.com/v1/forecast"

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m"
    }

    weather_response = requests.get(
        weather_url,
        params=weather_params
    )

    weather_data = weather_response.json()

    # Step 3: Extract current weather
    current = weather_data["current"]

    temperature = current["temperature_2m"]
    humidity = current["relative_humidity_2m"]
    wind_speed = current["wind_speed_10m"]

    print("Temperature:", temperature)
    print("Humidity:", humidity)
    print("Wind Speed:", wind_speed)


# Call the function
