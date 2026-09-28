import { useEffect, useState } from "react";

function Monitoring() {
  const [data, setData] = useState({
    co2: 0,
    co: 0,
    temperature: 0,
    humidity: 0,
  });

  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("--:--");

  // ==========================================
  // FETCH LIVE DATA FROM FASTAPI
  // ==========================================

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/sensor-data"
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const sensor = await response.json();

        console.log("Monitoring live data:", sensor);

        setData({
          co2: Number(sensor.co2) || 0,
          co: Number(sensor.co) || 0,
          temperature: Number(sensor.temperature) || 0,
          humidity: Number(sensor.humidity) || 0,
        });

        setIsOnline(true);

        setLastUpdate(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch (error) {
        console.error(
          "Monitoring backend connection error:",
          error
        );

        setIsOnline(false);
      }
    };

    // Fetch immediately
    fetchSensorData();

    // Fetch every 3 seconds
    const interval = setInterval(
      fetchSensorData,
      3000
    );

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // SENSOR STATUS
  // ==========================================

  const getCO2Status = () => {
    if (data.co2 >= 1200) {
      return "HIGH";
    }

    if (data.co2 >= 800) {
      return "MODERATE";
    }

    return "NORMAL";
  };

  const getCOStatus = () => {
    // Your MQ-7 value is currently a RAW ADC value,
    // not calibrated ppm.
    return "LIVE";
  };

  const getTemperatureStatus = () => {
    if (data.temperature >= 38) {
      return "HIGH";
    }

    if (data.temperature >= 35) {
      return "MODERATE";
    }

    return "NORMAL";
  };

  const getHumidityStatus = () => {
    if (data.humidity >= 80 || data.humidity <= 30) {
      return "MODERATE";
    }

    return "NORMAL";
  };

  // ==========================================
  // SENSOR LIST
  // ==========================================

  const sensors = [
    {
      key: "co2",
      code: "CO₂",
      name: "Carbon Dioxide",
      value: Math.round(data.co2),
      unit: "ppm",
      status: getCO2Status(),
      limit: "800 ppm",
    },

    {
      key: "co",
      code: "CO",
      name: "MQ-7 Signal",
      value: Math.round(data.co),
      unit: "raw",
      status: getCOStatus(),
      limit: "Uncalibrated",
    },

    {
      key: "temperature",
      code: "TEMP",
      name: "Temperature",
      value: data.temperature.toFixed(1),
      unit: "°C",
      status: getTemperatureStatus(),
      limit: "Monitoring",
    },

    {
      key: "humidity",
      code: "RH",
      name: "Humidity",
      value: data.humidity.toFixed(1),
      unit: "%",
      status: getHumidityStatus(),
      limit: "Monitoring",
    },
  ];

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "HIGH") {
      return "high";
    }

    if (status === "MODERATE") {
      return "moderate";
    }

    return "safe";
  };

  return (
    <div className="page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="page-header">

        <div>

          <div className="eyebrow">
            SENSOR NETWORK
          </div>

          <h1>
            Live Monitoring
          </h1>

          <p>
            Real-time readings from environmental sensors
          </p>

        </div>


        {/* CONNECTION STATUS */}

        <div className="header-status">

          <span
            className={`online-dot ${
              isOnline ? "" : "offline-dot"
            }`}
          ></span>

          <div>

            <strong>
              {isOnline
                ? "System Online"
                : "System Offline"}
            </strong>

            <small>
              {isOnline
                ? "Live sensor readings"
                : "Waiting for FastAPI"}
            </small>

          </div>

        </div>

      </header>


      {/* ==========================================
          MONITORING SUMMARY
      ========================================== */}

      <section className="monitoring-summary">

        <div>

          <span>
            CONNECTED SENSORS
          </span>

          <strong>
            {isOnline ? "4 / 4" : "0 / 4"}
          </strong>

        </div>


        <div>

          <span>
            MONITORING STATUS
          </span>

          <strong
            className={
              isOnline
                ? "green-text"
                : ""
            }
          >
            {isOnline
              ? "ACTIVE"
              : "OFFLINE"}
          </strong>

        </div>


        <div>

          <span>
            DATA UPDATE
          </span>

          <strong>
            Every 3 seconds
          </strong>

        </div>

      </section>


      {/* ==========================================
          LIVE SENSOR CARDS
      ========================================== */}

      <section className="sensor-grid">

        {sensors.map((sensor) => (

          <div
            className="sensor-card"
            key={sensor.key}
          >

            {/* TOP */}

            <div className="sensor-card-top">

              <div className="sensor-code">
                {sensor.code}
              </div>

              <span
                className={`status-pill ${
                  getStatusClass(sensor.status)
                }-pill`}
              >
                {sensor.status}
              </span>

            </div>


            {/* NAME */}

            <span className="sensor-name">
              {sensor.name}
            </span>


            {/* VALUE */}

            <div className="sensor-value">

              {sensor.value}

              <small>
                {sensor.unit}
              </small>

            </div>


            {/* FOOTER */}

            <div className="sensor-footer">

              <span>
                Current reading
              </span>

              <span>
                {sensor.limit}
              </span>

            </div>

          </div>

        ))}

      </section>


      {/* ==========================================
          SENSOR OVERVIEW TABLE
      ========================================== */}

      <section className="panel monitoring-table-panel">

        <div className="panel-header">

          <div>

            <h2>
              Sensor Overview
            </h2>

            <p>
              Connected environmental parameters
            </p>

          </div>

          <span className="table-live">
            {isOnline ? "LIVE" : "OFFLINE"}
          </span>

        </div>


        <div className="sensor-table">

          {/* TABLE HEADER */}

          <div className="table-row table-heading">

            <span>
              PARAMETER
            </span>

            <span>
              VALUE
            </span>

            <span>
              UNIT
            </span>

            <span>
              STATUS
            </span>

          </div>


          {/* TABLE DATA */}

          {sensors.map((sensor) => (

            <div
              className="table-row"
              key={sensor.key}
            >

              <strong>
                {sensor.name}
              </strong>

              <strong>
                {sensor.value}
              </strong>

              <span>
                {sensor.unit}
              </span>

              <span className="table-status">

                <i
                  className={
                    sensor.status === "HIGH"
                      ? "status-high-dot"
                      : sensor.status === "MODERATE"
                      ? "status-moderate-dot"
                      : ""
                  }
                ></i>

                {sensor.status}

              </span>

            </div>

          ))}

        </div>

      </section>


      {/* ==========================================
          DATA SOURCE
      ========================================== */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Live Data Source
            </h2>

            <p>
              Current readings received from ESP32
              through FastAPI
            </p>

          </div>

        </div>


        <div className="monitoring-summary">

          <div>

            <span>
              CO₂ SENSOR
            </span>

            <strong>
              MH-Z19E
            </strong>

          </div>


          <div>

            <span>
              CO SENSOR
            </span>

            <strong>
              MQ-7
            </strong>

          </div>


          <div>

            <span>
              ENVIRONMENT
            </span>

            <strong>
              DHT22
            </strong>

          </div>


          <div>

            <span>
              LAST UPDATE
            </span>

            <strong>
              {lastUpdate}
            </strong>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Monitoring;