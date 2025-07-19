import { useState } from 'react';
import './App.css';


const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// A helper to get an emoji for each message
const getMessageEmoji = (message) => {
  if (message.includes('umbrella')) return '☔️';
  if (message.includes('sunscreen')) return '🧴';
  if (message.includes('windy')) return '🌬️';
  if (message.includes('Storm')) return '⛈️';
  return 'ℹ️';
};


function App() {
  // State variables to manage the component
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle the API call
  const handleFetchWeather = async (e) => {
    e.preventDefault(); // Prevents the form from reloading the page
    if (!city) {
      setError('Please enter a city name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      // Your backend API endpoint
      const response = await fetch(`http://localhost:8080/api/v1/weather?city=${city}`);
      
      if (!response.ok) {
        // Handle non-200 responses (e.g., 404 Not Found)
        throw new Error(`City not found or server error. Status: ${response.status}`);
      }

      const apiResponse = await response.json();

      // Check for application-level errors from your backend if any
      if (apiResponse.status !== 200) {
        throw new Error(apiResponse.data?.message || 'An unknown error occurred.');
      }
      
      // Set the weather data from the 'data' property of the response
      setWeatherData(apiResponse.data);

    } catch (err) {
      // Set the error message to be displayed
      setError(err.message);
    } finally {
      // Stop the loading indicator
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Weather Prediction</h1>
        <p>Enter a city to get the 3-day forecast</p>
      </header>
      
      <main>
        <form className="search-form" onSubmit={handleFetchWeather}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="E.g., London, Tokyo"
            aria-label="City Name"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Get Weather'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {weatherData && (
          <div className="weather-results">
            <h2>{weatherData.cityName}, {weatherData.country}</h2>
            <div className="forecast-container">
              {weatherData.dailyForecasts.map((forecast) => (
                <div key={forecast.date} className="forecast-card">
                  <h3>{formatDate(forecast.date)}</h3>
                  <div className="temperatures">
                    <span className="temp-high">High: {Math.round(forecast.highTemp)}°C</span>
                    <span className="temp-low">Low: {Math.round(forecast.lowTemp)}°C</span>
                  </div>
                  <div className="messages">
                    {forecast.messages.map((msg, index) => (
                      <p key={index}>
                        <span className="emoji">{getMessageEmoji(msg)}</span> {msg}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;