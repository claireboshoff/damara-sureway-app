export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  location: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  description: string;
  icon: string;
  rain: number;
}

export async function getWeather(lat = -25.7479, lon = 28.2293): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=Africa/Johannesburg&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();

  const weatherCodes: Record<number, { desc: string; icon: string }> = {
    0: { desc: 'Clear sky', icon: 'sun' },
    1: { desc: 'Mainly clear', icon: 'sun' },
    2: { desc: 'Partly cloudy', icon: 'cloud-sun' },
    3: { desc: 'Overcast', icon: 'cloud' },
    45: { desc: 'Foggy', icon: 'cloud-fog' },
    48: { desc: 'Depositing rime fog', icon: 'cloud-fog' },
    51: { desc: 'Light drizzle', icon: 'cloud-drizzle' },
    53: { desc: 'Moderate drizzle', icon: 'cloud-drizzle' },
    55: { desc: 'Dense drizzle', icon: 'cloud-drizzle' },
    61: { desc: 'Slight rain', icon: 'cloud-rain' },
    63: { desc: 'Moderate rain', icon: 'cloud-rain' },
    65: { desc: 'Heavy rain', icon: 'cloud-rain' },
    71: { desc: 'Slight snow', icon: 'snowflake' },
    73: { desc: 'Moderate snow', icon: 'snowflake' },
    75: { desc: 'Heavy snow', icon: 'snowflake' },
    80: { desc: 'Slight rain showers', icon: 'cloud-rain' },
    81: { desc: 'Moderate rain showers', icon: 'cloud-rain' },
    82: { desc: 'Violent rain showers', icon: 'cloud-rain' },
    95: { desc: 'Thunderstorm', icon: 'cloud-lightning' },
    96: { desc: 'Thunderstorm with hail', icon: 'cloud-lightning' },
    99: { desc: 'Thunderstorm with heavy hail', icon: 'cloud-lightning' },
  };

  const code = data.current.weather_code;
  const info = weatherCodes[code] || { desc: 'Unknown', icon: 'cloud' };

  const forecast: ForecastDay[] = data.daily.time.map((date: string, i: number) => {
    const fc = data.daily.weather_code[i];
    const fInfo = weatherCodes[fc] || { desc: 'Unknown', icon: 'cloud' };
    return {
      date,
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      description: fInfo.desc,
      icon: fInfo.icon,
      rain: data.daily.precipitation_sum[i] || 0,
    };
  });

  return {
    temperature: Math.round(data.current.temperature_2m),
    humidity: data.current.relative_humidity_2m,
    description: info.desc,
    icon: info.icon,
    windSpeed: Math.round(data.current.wind_speed_10m),
    location: 'Pretoria, ZA',
    forecast,
  };
}
