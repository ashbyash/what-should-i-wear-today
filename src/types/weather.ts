// OpenWeatherMap Current Weather API Response
export interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  name: string;
}

// OpenWeatherMap Air Pollution API Response
export interface AirQualityResponse {
  coord: {
    lon: number;
    lat: number;
  };
  list: {
    main: {
      aqi: number; // 1: Good, 2: Fair, 3: Moderate, 4: Poor, 5: Very Poor
    };
    components: {
      pm2_5: number;
      pm10: number;
      co: number;
      no2: number;
      o3: number;
      so2: number;
    };
    dt: number;
  }[];
}

// Processed weather data for the app
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  weatherMain: string; // Clear, Clouds, Rain, Snow, etc.
  weatherDescription: string;
  weatherIcon: string;
  windSpeed: number;
  cloudiness: number;
  locationName: string;
}

// Processed air quality data for the app
export interface AirQualityData {
  aqi: number;
  aqiLevel: 'good' | 'moderate' | 'bad' | 'very_bad';
  pm25: number;
  pm10: number;
}

// API request params
export interface LocationParams {
  lat: number;
  lon: number;
}

// Location data from reverse geocoding
export interface LocationData {
  address: string;
  region1: string; // 시/도
  region2: string; // 구/군
  region3: string; // 동/읍/면
}
