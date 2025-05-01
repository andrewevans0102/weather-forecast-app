import React, { useState, useEffect } from 'react';
import './WeatherApp.css';

const WeatherApp = () => {
  const [selectedCity, setSelectedCity] = useState('London');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [units, setUnits] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit

  const cities = [
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', lat: 40.7128, lon: -74.006 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  ];

  // Insert your API key from OpenWeatherMap
  const API_KEY = '<YOUR_API_KEY_GOES_HERE>';

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const selectedCityData = cities.find(city => city.name === selectedCity);

        if (!selectedCityData) {
          throw new Error('City not found');
        }

        const { lat, lon } = selectedCityData;

        // Using 5-day forecast endpoint which is available in the free plan
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch weather data: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Process the 5-day forecast data to get daily forecasts
        const processedData = processForecastData(data);
        setForecast(processedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedCity, units]);

  // Process the 5-day/3-hour forecast data to get daily forecasts
  const processForecastData = data => {
    // Group forecast data by day
    const dailyData = {};

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (!dailyData[day]) {
        dailyData[day] = {
          dt: item.dt,
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max,
          },
          weather: item.weather,
        };
      } else {
        // Update min/max temps if needed
        dailyData[day].temp.min = Math.min(dailyData[day].temp.min, item.main.temp_min);
        dailyData[day].temp.max = Math.max(dailyData[day].temp.max, item.main.temp_max);
      }
    });

    // Convert to array and take first 7 days (or as many as available)
    const daily = Object.values(dailyData).slice(0, 7);

    return { daily };
  };

  const toggleUnits = () => {
    setUnits(prevUnits => (prevUnits === 'metric' ? 'imperial' : 'metric'));
  };

  const getWeatherIcon = weatherCode => {
    if (!weatherCode) return <div className="weather-icon sun"></div>;

    // Map OpenWeatherMap weather codes to icon classes
    if (weatherCode.includes('clear')) return <div className="weather-icon sun"></div>;
    if (weatherCode.includes('cloud')) return <div className="weather-icon cloud"></div>;
    if (weatherCode.includes('rain') || weatherCode.includes('drizzle'))
      return <div className="weather-icon rain"></div>;
    if (weatherCode.includes('snow')) return <div className="weather-icon snow"></div>;
    if (weatherCode.includes('thunderstorm')) return <div className="weather-icon lightning"></div>;
    if (weatherCode.includes('fog') || weatherCode.includes('mist'))
      return <div className="weather-icon fog"></div>;
    return <div className="weather-icon wind"></div>;
  };

  const formatDate = timestamp => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Mock data for development and testing
  const mockForecast = {
    daily: [
      { dt: 1682596800, temp: { min: 12, max: 22 }, weather: [{ main: 'Clear', icon: '01d' }] },
      { dt: 1682683200, temp: { min: 14, max: 24 }, weather: [{ main: 'Clouds', icon: '03d' }] },
      { dt: 1682769600, temp: { min: 15, max: 25 }, weather: [{ main: 'Rain', icon: '10d' }] },
      { dt: 1682856000, temp: { min: 13, max: 23 }, weather: [{ main: 'Clouds', icon: '02d' }] },
      { dt: 1682942400, temp: { min: 14, max: 26 }, weather: [{ main: 'Clear', icon: '01d' }] },
      { dt: 1683028800, temp: { min: 16, max: 27 }, weather: [{ main: 'Rain', icon: '10d' }] },
      { dt: 1683115200, temp: { min: 15, max: 24 }, weather: [{ main: 'Clouds', icon: '04d' }] },
    ],
  };

  // Use mock data for display (in a real app, use forecast data from API)
  const forecastData = forecast || mockForecast;

  return (
    <div className="weather-container">
      <div className="weather-app">
        <h1 className="app-title">Weather Forecast</h1>

        <div className="controls">
          <div className="city-select-container">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="city-select"
            >
              {cities.map(city => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={toggleUnits} className="units-toggle">
            {units === 'metric' ? '°C to °F' : '°F to °C'}
          </button>
        </div>

        {/* Added city name display */}
        <div className="selected-city">
          <h2>Weather for {selectedCity}</h2>
        </div>

        {loading && <div className="loading-message">Loading weather data...</div>}

        {error && (
          <div className="error-message">
            Error: {error}. Please check your API key or try again later.
          </div>
        )}

        {!loading && !error && (
          <div className="forecast-grid">
            {forecastData.daily.slice(0, 7).map((day, index) => (
              <div key={index} className="forecast-card">
                <h3 className="forecast-date">{formatDate(day.dt)}</h3>
                <div className="forecast-icon">
                  {getWeatherIcon(day.weather[0].main.toLowerCase())}
                </div>
                <p className="weather-condition">{day.weather[0].main}</p>
                <div className="forecast-temps">
                  <span className="temp-high">
                    {Math.round(day.temp.max)}°{units === 'metric' ? 'C' : 'F'}
                  </span>
                  <span className="temp-low">
                    {Math.round(day.temp.min)}°{units === 'metric' ? 'C' : 'F'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;
