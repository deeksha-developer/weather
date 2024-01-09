import React, { useState, useEffect, useCallback } from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
// import Forcast from "./forcast";
// import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "black",
  size: 112,
  animate: true,
};

const Weather = () => {
  const [state, setState] = useState({
    lat: undefined,
    lon: undefined,
    errorMessage: undefined,
    temperatureC: undefined,
    temperatureF: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    icon: "CLEAR_DAY",
    sunrise: undefined,
    sunset: undefined,
    errorMsg: undefined,
  });
console.log(setState);

  const getWeather = useCallback(async (lat, lon) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      
      const data = await api_call.json();
      setState((prevState) => ({
        ...prevState,
        lat: lat,
        lon: lon,
        city: data.name,
        temperatureC: Math.round(data.main.temp),
        temperatureF: Math.round(data.main.temp * 1.8 + 32),
        humidity: data.main.humidity,
        main: data.weather[0].main,
        country: data.sys.country,
      }));
    

      switch (data.weather[0].main) {
        case "Haze":
          setState((prevState) => ({ ...prevState, icon: "CLEAR_DAY" }));
          break;
        case "Clouds":
          setState((prevState) => ({ ...prevState, icon: "CLOUDY" }));
          break;
        case "Rain":
          setState((prevState) => ({ ...prevState, icon: "RAIN" }));
          break;
        case "Snow":
          setState((prevState) => ({ ...prevState, icon: "SNOW" }));
          break;
        case "Dust":
          setState((prevState) => ({ ...prevState, icon: "WIND" }));
          break;
        case "Drizzle":
          setState((prevState) => ({ ...prevState, icon: "SLEET" }));
          break;
        case "Fog":
        case "Smoke":
          setState((prevState) => ({ ...prevState, icon: "FOG" }));
          break;
        case "Tornado":
          setState((prevState) => ({ ...prevState, icon: "WIND" }));
          break;
        default:
          setState((prevState) => ({ ...prevState, icon: "CLEAR_DAY" }));
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }, []);

  const getPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };
  console.log("getPosition", getPosition);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (navigator.geolocation) {
          const position = await getPosition();
          getWeather(position.coords.latitude, position.coords.longitude);
        } else {
          getWeather(28.67, 77.22);
          alert(
            "Geolocation is not available. Using default location for weather."
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const timerID = setInterval(() => {
      getWeather(state.lat, state.lon);
    }, 600000);

    return () => {
      clearInterval(timerID);
    };
  }, [state.lat, state.lon, getWeather]);


  return (
    <>
      {state.temperatureC ? (
        <>
          <div className="city">
            <div className="title">
              <h2>{state.city}</h2>
              <h3>{state.country}</h3>
            </div>
            <div className="mb-icon">
              {" "}
              <ReactAnimatedWeather
                icon={state.icon}
                color={defaults.color}
                size={defaults.size}
                animate={defaults.animate}
              />
              <p>{state.main}</p>
            </div>
            <div className="date-time">
              <div className="dmy">
                <div id="txt"></div>
                <div className="current-time">
                  <Clock format="HH:mm:ss" interval={1000} ticking={true} />
                </div>
                <div className="current-date">{dateBuilder(new Date())}</div>
              </div>
              <div className="temperature">
                <p>
                  {state.temperatureC}°<span>C</span>
                </p>
              </div>
            </div>
          </div>
          {/* <Forcast icon={state.icon} weather={state.main} /> */}
        </>
      ) : (
        <>
          {/* <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} /> */}
          <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
            Detecting your location
          </h3>
          <h3 style={{ color: "white", marginTop: "10px" }}>
            Your current location will be displayed on the App <br /> & used
            for calculating Real-time weather.
          </h3>
        </>
      )}
    </>
  );
};

export default Weather;
