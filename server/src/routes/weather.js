import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/:location', async (req, res, next) => {
  try {
    const { location } = req.params;
    
    const apiKey = process.env.OPENWEATHER_API_KEY || 'demo_key';
    
    if (apiKey === 'demo_key') {
      return res.json({
        location,
        temperature: 22,
        description: 'Сонячно',
        humidity: 65,
        windSpeed: 15,
        icon: '01d',
        mock: true,
      });
    }

    try {
      // First, get coordinates from location name
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
      );

      if (!geoResponse.data || geoResponse.data.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Location not found',
        });
      }

      const { lat, lon } = geoResponse.data[0];

      // Get weather data
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=uk`
      );

      const weather = weatherResponse.data;

      res.json({
        location: weather.name,
        country: weather.sys.country,
        temperature: Math.round(weather.main.temp),
        feelsLike: Math.round(weather.main.feels_like),
        description: weather.weather[0].description,
        humidity: weather.main.humidity,
        windSpeed: Math.round(weather.wind.speed * 3.6), 
        icon: weather.weather[0].icon,
        pressure: weather.main.pressure,
      });
    } catch (apiError) {
      res.json({
        location,
        temperature: 22,
        description: 'Сонячно',
        humidity: 65,
        windSpeed: 15,
        icon: '01d',
        mock: true,
        error: 'Weather API unavailable, showing demo data',
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;


