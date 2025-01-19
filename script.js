const WEATHER_API_KEY = '98c5889e77ed4611a83121300240111';
        const locationInput = document.getElementById('locationInput');
        const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
        const weatherContainer = document.getElementById('weatherContainer');

        function formatDateTime(date) {
            return date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function getWeatherIcon(code, is_day) {
    const baseUrl = "https://basmilius.github.io/weather-icons/production/fill/all/";
    const iconMap = {
        1000: is_day ? "clear-day" : "clear-night",
        1003: is_day ? "partly-cloudy-day" : "partly-cloudy-night",
        1006: "cloudy",
        1009: "overcast",
        1030: "mist",
        1063: is_day ? "partly-cloudy-day-rain" : "partly-cloudy-night-rain",
        1066: is_day ? "partly-cloudy-day-snow" : "partly-cloudy-night-snow",
        1069: is_day ? "partly-cloudy-day-sleet" : "partly-cloudy-night-sleet",
        1072: "sleet",
        1087: is_day ? "thunderstorms-day" : "thunderstorms-night",
        1114: "snow",
        1117: "snow",
        1135: is_day ? "fog-day" : "fog-night",
        1147: is_day ? "fog-day" : "fog-night",
        1150: "drizzle",
        1153: "drizzle",
        1168: "sleet",
        1171: "sleet",
        1180: "rain",
        1183: "rain",
        1186: "rain",
        1189: "rain",
        1192: "rain",
        1195: "rain",
        1198: "sleet",
        1201: "sleet",
        1204: "sleet",
        1207: "sleet",
        1210: "snow",
        1213: "snow",
        1216: "snow",
        1219: "snow",
        1222: "snow",
        1225: "snow",
        1237: "hail",
        1240: is_day ? "partly-cloudy-day-rain" : "partly-cloudy-night-rain",
        1243: "rain",
        1246: "rain",
        1249: is_day ? "partly-cloudy-day-sleet" : "partly-cloudy-night-sleet",
        1252: "sleet",
        1255: is_day ? "partly-cloudy-day-snow" : "partly-cloudy-night-snow",
        1258: "snow",
        1261: "hail",
        1264: "hail",
        1273: is_day ? "thunderstorms-day-rain" : "thunderstorms-night-rain",
        1276: "thunderstorms-rain",
        1279: is_day ? "thunderstorms-day-snow" : "thunderstorms-night-snow",
        1282: "thunderstorms-snow"
    };
    
    const iconName = iconMap[code] || "not-available";
    return `${baseUrl}${iconName}.svg`;
}

// Add error handling for images
function addImageErrorHandler() {
    const images = document.querySelectorAll('img.weather-icon, img.forecast-icon');
    images.forEach(img => {
        img.onerror = function() {
            this.src = "https://basmilius.github.io/weather-icons/production/fill/all/not-available.svg";
            console.log('Image failed to load:', this.src);
        };
    });
}

        async function getWeather(location) {
            try {
                const response = await fetch(
                    `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${location}&days=3&aqi=no`
                );
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error.message);
                }

                // Update location and time
                document.getElementById('locationName').textContent = 
                    `${data.location.name}, ${data.location.country}`;
                document.getElementById('dateTime').textContent = 
                    formatDateTime(new Date(data.location.localtime));

                // Update current weather
                const current = data.current;
                document.getElementById('currentIcon').src = getWeatherIcon(current.condition.code, current.is_day);
                document.getElementById('currentTemp').textContent = `${current.temp_c}°C`;
                document.getElementById('currentCondition').textContent = current.condition.text;
                document.getElementById('feelsLike').textContent = `Feels like ${current.feelslike_c}°C`;
                document.getElementById('humidity').textContent = `Humidity: ${current.humidity}%`;
                document.getElementById('windSpeed').textContent = `Wind: ${current.wind_kph} km/h`;
                document.getElementById('windDirection').textContent = `Direction: ${current.wind_dir}`;

                // Update forecast
                const forecastHTML = data.forecast.forecastday
                    .map(day => {
                        const date = new Date(day.date);
                        return `
                            <div class="forecast-card">
                                <div class="forecast-date">
                                    ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <img class="forecast-icon" 
                                     src="${getWeatherIcon(day.day.condition.code, 1)}" 
                                     alt="${day.day.condition.text}">
                                <div class="forecast-temp">
                                    ${day.day.avgtemp_c}°C
                                </div>
                                <div class="forecast-condition">
                                    ${day.day.condition.text}
                                </div>
                            </div>
                        `;
                    })
                    .join('');
                
                document.getElementById('forecast').innerHTML = forecastHTML;
                weatherContainer.style.display = 'block';
            } catch (error) {
                console.error('Error fetching weather:', error);
                alert('Error fetching weather data. Please try again.');
            }
        }

        // Handle location input
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const location = this.value.trim();
                if (location) {
                    getWeather(location);
                }
            }
        });

        // Get current location
        getCurrentLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                getCurrentLocationBtn.disabled = true;
                navigator.geolocation.getCurrentPosition(
                    async function(position) {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        try {
                            getWeather(`${lat},${lon}`);
                        } catch (error) {
                            console.error('Error getting weather for current location:', error);
                            alert('Unable to get weather for your current location.');
                        } finally {
                            getCurrentLocationBtn.disabled = false;
                        }
                    },
                    function(error) {
                        console.error("Error getting location:", error);
                        alert("Unable to retrieve your location. Please check your settings and try again.");
                        getCurrentLocationBtn.disabled = false;
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        });

        // Add loading state
        function setLoading(isLoading) {
            const searchInput = document.querySelector('.search-input');
            const locationBtn = document.querySelector('.location-button');
            
            if (isLoading) {
                searchInput.disabled = true;
                locationBtn.disabled = true;
                locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            } else {
                searchInput.disabled = false;
                locationBtn.disabled = false;
                locationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
            }
        }

        // Format numbers for display
        function formatNumber(num, decimals = 1) {
            return Number(num).toFixed(decimals);
        }

        // Update time every minute
        function updateDateTime() {
            const now = new Date();
            document.getElementById('dateTime').textContent = formatDateTime(now);
        }
        setInterval(updateDateTime, 60000);

        // Auto-refresh weather data every 30 minutes
        function autoRefresh() {
            const location = locationInput.value.trim();
            if (location && weatherContainer.style.display !== 'none') {
                getWeather(location);
            }
        }
        setInterval(autoRefresh, 1800000);

        // Handle errors gracefully
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
            return false;
        };