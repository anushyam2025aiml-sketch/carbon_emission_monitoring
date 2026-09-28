import { useEffect, useState } from "react";

function Alerts() {
  const [co2, setCo2] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("--:--");

  // ==========================================
  // FETCH LIVE CO2 DATA FROM FASTAPI
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

        const data = await response.json();

        console.log("Alerts live data:", data);

        setCo2(Number(data.co2) || 0);

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
          "Alerts backend connection error:",
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
  // DETERMINE CURRENT ALERT
  // ==========================================

  const getCurrentAlert = () => {
    if (co2 >= 1200) {
      return {
        type: "high",
        title: "High emission detected",
        message:
          "CO₂ level has crossed the monitored threshold.",
      };
    }

    if (co2 >= 800) {
      return {
        type: "moderate",
        title: "CO₂ level increasing",
        message:
          "CO₂ level is approaching the monitored threshold.",
      };
    }

    return {
      type: "safe",
      title: "Emission levels normal",
      message:
        "Current emission levels are within the monitored range.",
    };
  };

  const currentAlert = getCurrentAlert();

  // ==========================================
  // ALERT LABEL
  // ==========================================

  const getAlertLabel = () => {
    if (currentAlert.type === "high") {
      return "HIGH RISK";
    }

    if (currentAlert.type === "moderate") {
      return "MODERATE";
    }

    return "NORMAL";
  };

  // ==========================================
  // CURRENT STATUS ICON
  // ==========================================

  const getStatusIcon = () => {
    if (currentAlert.type === "safe") {
      return "OK";
    }

    return "!";
  };

  return (
    <div className="page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="page-header">

        <div>

          <div className="eyebrow">
            ENVIRONMENTAL EVENTS
          </div>

          <h1>
            Alerts
          </h1>

          <p>
            Emission alerts and monitoring events
          </p>

        </div>


        {/* SYSTEM STATUS */}

        <div className="header-status">

          <span
            className={`online-dot ${
              isOnline ? "" : "offline-dot"
            }`}
          ></span>

          <div>

            <strong>
              {isOnline
                ? "Monitoring Active"
                : "Monitoring Offline"}
            </strong>

            <small>
              {isOnline
                ? "Alert detection enabled"
                : "Waiting for FastAPI"}
            </small>

          </div>

        </div>

      </header>


      {/* ==========================================
          ALERT SUMMARY
      ========================================== */}

      <section className="alert-summary">

        {/* SAFE */}

        <div className="alert-summary-card">

          <span className="summary-number safe-number">
            {currentAlert.type === "safe" ? 1 : 0}
          </span>

          <div>

            <strong>
              Safe
            </strong>

            <small>
              Normal conditions
            </small>

          </div>

        </div>


        {/* MODERATE */}

        <div className="alert-summary-card">

          <span className="summary-number moderate-number">
            {currentAlert.type === "moderate" ? 1 : 0}
          </span>

          <div>

            <strong>
              Moderate
            </strong>

            <small>
              Requires attention
            </small>

          </div>

        </div>


        {/* HIGH */}

        <div className="alert-summary-card">

          <span className="summary-number high-number">
            {currentAlert.type === "high" ? 1 : 0}
          </span>

          <div>

            <strong>
              High Risk
            </strong>

            <small>
              Immediate attention
            </small>

          </div>

        </div>

      </section>


      {/* ==========================================
          CURRENT ALERT
      ========================================== */}

      <section className="panel current-alert-panel">

        <div className="panel-header">

          <div>

            <h2>
              Current Status
            </h2>

            <p>
              Latest emission assessment
            </p>

          </div>


          <span
            className={`alert-badge ${currentAlert.type}`}
          >
            {getAlertLabel()}
          </span>

        </div>


        <div
          className={`current-alert ${currentAlert.type}`}
        >

          {/* STATUS ICON */}

          <div className="alert-status-circle">

            {getStatusIcon()}

          </div>


          {/* MESSAGE */}

          <div>

            <h3>
              {currentAlert.title}
            </h3>

            <p>
              {currentAlert.message}
            </p>

          </div>


          {/* LIVE READING */}

          <div className="alert-reading">

            <span>
              CO₂
            </span>

            <strong>
              {Math.round(co2)} ppm
            </strong>

          </div>

        </div>

      </section>


      {/* ==========================================
          LIVE SENSOR INFORMATION
      ========================================== */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Live Alert Monitoring
            </h2>

            <p>
              Alerts are calculated from the current
              ESP32 CO₂ reading
            </p>

          </div>

        </div>


        <div className="monitoring-summary">

          <div>

            <span>
              CURRENT CO₂
            </span>

            <strong>
              {Math.round(co2)} ppm
            </strong>

          </div>


          <div>

            <span>
              ALERT THRESHOLD
            </span>

            <strong>
              800 ppm
            </strong>

          </div>


          <div>

            <span>
              HIGH RISK THRESHOLD
            </span>

            <strong>
              1200 ppm
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


      {/* ==========================================
          RECENT ALERTS
      ========================================== */}

      <section className="panel recent-alerts-panel">

        <div className="panel-header">

          <div>

            <h2>
              Current Monitoring Events
            </h2>

            <p>
              Latest system assessment
            </p>

          </div>

        </div>


        <div className="alerts-list">

          {/* CURRENT EVENT */}

          <div className="alert-row">

            <div
              className={`alert-row-indicator ${
                currentAlert.type
              }-indicator`}
            ></div>


            <div className="alert-row-content">

              <strong>
                {currentAlert.title}
              </strong>

              <span>
                {currentAlert.message}
              </span>

            </div>


            <time>
              {lastUpdate}
            </time>


            <span
              className={`alert-badge ${
                currentAlert.type
              }`}
            >
              {getAlertLabel()}
            </span>

          </div>


          {/* SYSTEM STATUS */}

          <div className="alert-row">

            <div className="alert-row-indicator safe-indicator"></div>


            <div className="alert-row-content">

              <strong>
                Monitoring system online
              </strong>

              <span>
                ESP32 sensor data is being received
                through FastAPI.
              </span>

            </div>


            <time>
              {lastUpdate}
            </time>


            <span className="alert-badge safe">
              LIVE
            </span>

          </div>


          {/* SENSOR CONNECTION */}

          <div className="alert-row">

            <div
              className={`alert-row-indicator ${
                isOnline
                  ? "safe-indicator"
                  : "moderate-indicator"
              }`}
            ></div>


            <div className="alert-row-content">

              <strong>
                Sensor connection status
              </strong>

              <span>
                {isOnline
                  ? "FastAPI is receiving live environmental sensor data."
                  : "Unable to connect to the FastAPI sensor endpoint."}
              </span>

            </div>


            <time>
              {lastUpdate}
            </time>


            <span
              className={`alert-badge ${
                isOnline
                  ? "safe"
                  : "moderate"
              }`}
            >
              {isOnline
                ? "ONLINE"
                : "OFFLINE"}
            </span>

          </div>

        </div>

      </section>


      {/* ==========================================
          THRESHOLD INFORMATION
      ========================================== */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <h2>
              CO₂ Alert Thresholds
            </h2>

            <p>
              Current thresholds used by the monitoring
              application
            </p>

          </div>

        </div>


        <div className="monitoring-summary">

          <div>

            <span>
              SAFE
            </span>

            <strong className="green-text">
              Below 800 ppm
            </strong>

          </div>


          <div>

            <span>
              MODERATE
            </span>

            <strong>
              800–1199 ppm
            </strong>

          </div>


          <div>

            <span>
              HIGH RISK
            </span>

            <strong>
              1200+ ppm
            </strong>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Alerts;