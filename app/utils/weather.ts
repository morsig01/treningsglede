const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

interface WeatherResponse {
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

export async function getWeatherData(lat: number, lon: number, date: string) {
  try {
    // Current weather API endpoint if date is today, forecast for future dates
    const isToday = new Date(date).toDateString() === new Date().toDateString();
    const baseUrl = 'https://api.openweathermap.org/data/2.5';
    const endpoint = isToday ? 'weather' : 'forecast';
    
    const response = await fetch(
      `${baseUrl}/${endpoint}?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    if (isToday) {
      const weatherData = data as WeatherResponse;
      return {
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
      };
    } else {
      // For forecast data, find the closest time to the session time
      const forecastList = data.list;
      const sessionDateTime = new Date(date).getTime();
      const closestForecast = forecastList.reduce((prev: any, curr: any) => {
        const prevDiff = Math.abs(new Date(prev.dt * 1000).getTime() - sessionDateTime);
        const currDiff = Math.abs(new Date(curr.dt * 1000).getTime() - sessionDateTime);
        return prevDiff < currDiff ? prev : curr;
      });

      return {
        temperature: Math.round(closestForecast.main.temp),
        description: closestForecast.weather[0].description,
        icon: closestForecast.weather[0].icon,
      };
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}
