import { useEffect, useState } from "react";

function Dashboard() {

  // ==========================================
  // SENSOR DATA
  // ==========================================

  const [sensorData, setSensorData] = useState({
    co2: 0,
    co: 0,
    temperature: 0,
    humidity: 0,
  });

  // ==========================================
  // CHART DATA
  // ==========================================

  const [chartData, setChartData] = useState([]);

  // ==========================================
  // CONNECTION STATUS
  // ==========================================

  const [backendConnected, setBackendConnected] = useState(false);

  // ==========================================
  // LAST UPDATE
  // ==========================================

  const [currentTime, setCurrentTime] = useState("--:--:--");


  // ==========================================
  // FETCH SENSOR DATA
  // ==========================================

  useEffect(() => {

    const fetchSensorData = async () => {

      try {

        const response = await fetch(
          "http://localhost:8000/sensor-data?t=" +
          Date.now(),
          {
            method: "GET",
            cache: "no-store",
          }
        );


        if (!response.ok) {

          throw new Error(
            `HTTP error: ${response.status}`
          );

        }


        const data = await response.json();


        console.log(
          "Latest sensor data:",
          data
        );


        // ======================================
        // UPDATE SENSOR VALUES
        // ======================================

        setSensorData({

          co2: Number(data.co2) || 0,

          co: Number(data.co) || 0,

          temperature:
            Number(data.temperature) || 0,

          humidity:
            Number(data.humidity) || 0,

        });


        // ======================================
        // UPDATE CHART
        // ======================================

        setChartData((oldData) => {

          const newData = [
            ...oldData,
            Number(data.co2) || 0,
          ];

          return newData.slice(-10);

        });


        // ======================================
        // CONNECTION
        // ======================================

        setBackendConnected(true);


        // ======================================
        // UPDATE TIME
        // ======================================

        setCurrentTime(
          data.updated_at ||
          new Date().toLocaleTimeString()
        );


      } catch (error) {

        console.error(
          "Backend connection error:",
          error
        );

        setBackendConnected(false);

      }

    };


    // Fetch immediately

    fetchSensorData();


    // Fetch every 3 seconds

    const interval = setInterval(
      fetchSensorData,
      3000
    );


    return () => {
      clearInterval(interval);
    };

  }, []);


  // ==========================================
  // RISK STATUS
  // ==========================================

  const getRisk = () => {

    if (sensorData.co2 >= 1200) {

      return {
        text: "HIGH RISK",
        className: "high",
        message:
          "CO₂ level requires attention",
      };

    }


    if (sensorData.co2 >= 800) {

      return {
        text: "MODERATE",
        className: "moderate",
        message:
          "CO₂ level is above normal range",
      };

    }


    return {
      text: "SAFE",
      className: "safe",
      message:
        "CO₂ level is within the current monitoring range",
    };

  };


  const risk = getRisk();


  // ==========================================
  // CHART SETTINGS
  // ==========================================

  const chartMin = 400;
  const chartMax = 2000;


  const chartPoints = chartData
    .map((value, index) => {

      const x =
        chartData.length === 1
          ? 50
          : (index /
              (chartData.length - 1)) *
            100;


      const y =
        100 -
        ((value - chartMin) /
          (chartMax - chartMin)) *
          100;


      return `${x},${Math.max(
        4,
        Math.min(96, y)
      )}`;

    })
    .join(" ");


  // ==========================================
  // FRONTEND
  // ==========================================

  return (

    <div className="page dashboard-page">


      {/* ======================================
          HEADER
      ====================================== */}

      <header className="page-header">

        <div>

          <div className="eyebrow">
            INDUSTRIAL MONITORING
          </div>

          <h1>
            Industry Overview
          </h1>

          <p>
            Real-time environmental emission
            monitoring
          </p>

        </div>


        <div className="header-status">

          <span
            className={
              backendConnected
                ? "online-dot"
                : "offline-dot"
            }
          ></span>


          <div>

            <strong>

              {backendConnected
                ? "System Online"
                : "Backend Offline"}

            </strong>

            <small>

              {backendConnected
                ? "Sensors connected"
                : "Waiting for FastAPI"}

            </small>

          </div>

        </div>

      </header>


      {/* ======================================
          INDUSTRY BAR
      ====================================== */}

      <section className="industry-info">

        <div className="info-block">

          <span>
            INDUSTRY UNIT
          </span>

          <strong>
            Coal Processing Unit
          </strong>

        </div>


        <div className="info-block">

          <span>
            MONITORING STATUS
          </span>

          <strong className="green-text">

            {backendConnected
              ? "Active Monitoring"
              : "Connecting..."}

          </strong>

        </div>


        <div className="info-block">

          <span>
            LAST UPDATE
          </span>

          <strong>
            {currentTime}
          </strong>

        </div>

      </section>


      {/* ======================================
          METRICS
      ====================================== */}

      <section className="metric-grid">


        {/* CO2 */}

        <div className="metric-card">

          <div className="metric-card-top">

            <div className="metric-symbol">
              CO₂
            </div>

            <span className="status-pill safe-pill">
              LIVE
            </span>

          </div>


          <span className="metric-name">
            Carbon Dioxide
          </span>


          <div className="metric-value">

            {Math.round(sensorData.co2)}

            <small>
              ppm
            </small>

          </div>


          <div className="metric-bottom">

            <span>
              Current level
            </span>

            <span>
              MH-Z19E
            </span>

          </div>

        </div>


        {/* CO */}

        <div className="metric-card">

          <div className="metric-card-top">

            <div className="metric-symbol">
              CO
            </div>

            <span className="status-pill safe-pill">
              LIVE
            </span>

          </div>


          <span className="metric-name">
            MQ-7 Signal
          </span>


          <div className="metric-value">

            {Math.round(sensorData.co)}

            <small>
              raw
            </small>

          </div>


          <div className="metric-bottom">

            <span>
              MQ-7 reading
            </span>

            <span>
              Uncalibrated
            </span>

          </div>

        </div>


        {/* TEMPERATURE */}

        <div className="metric-card">

          <div className="metric-card-top">

            <div className="metric-symbol">
              TEMP
            </div>

            <span className="status-pill safe-pill">
              LIVE
            </span>

          </div>


          <span className="metric-name">
            Temperature
          </span>


          <div className="metric-value">

            {Number(
              sensorData.temperature
            ).toFixed(1)}

            <small>
              °C
            </small>

          </div>


          <div className="metric-bottom">

            <span>
              DHT22
            </span>

            <span>
              Live sensor
            </span>

          </div>

        </div>


        {/* HUMIDITY */}

        <div className="metric-card">

          <div className="metric-card-top">

            <div className="metric-symbol">
              HUM
            </div>

            <span className="status-pill safe-pill">
              LIVE
            </span>

          </div>


          <span className="metric-name">
            Humidity
          </span>


          <div className="metric-value">

            {Number(
              sensorData.humidity
            ).toFixed(1)}

            <small>
              %
            </small>

          </div>


          <div className="metric-bottom">

            <span>
              DHT22
            </span>

            <span>
              Live sensor
            </span>

          </div>

        </div>

      </section>


      {/* ======================================
          CHART + RISK
      ====================================== */}

      <section className="dashboard-two-column">


        {/* CHART */}

        <div className="panel chart-panel">

          <div className="panel-header">

            <div>

              <h2>
                CO₂ Emission Trend
              </h2>

              <p>
                Live CO₂ monitoring from ESP32
              </p>

            </div>


            <div className="current-reading">

              <strong>
                {Math.round(sensorData.co2)}
              </strong>

              <span>
                ppm
              </span>

            </div>

          </div>


          <div className="chart-wrapper">


            <div className="chart-y-labels">

              <span>2000</span>

              <span>1600</span>

              <span>1200</span>

              <span>800</span>

              <span>400</span>

            </div>


            <div className="chart-main">


              <div className="chart-grid">

                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>

              </div>


              <svg
                className="emission-chart"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >

                {chartData.length > 0 && (

                  <polyline
                    points={chartPoints}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />

                )}


                {chartData.map(
                  (value, index) => {

                    const x =
                      chartData.length === 1
                        ? 50
                        : (index /
                            (chartData.length - 1)) *
                          100;


                    const y =
                      100 -
                      ((value -
                        chartMin) /
                        (chartMax -
                          chartMin)) *
                        100;


                    return (

                      <circle
                        key={index}
                        cx={x}
                        cy={Math.max(
                          4,
                          Math.min(
                            96,
                            y
                          )
                        )}
                        r="1.1"
                        fill="currentColor"
                        vectorEffect="non-scaling-stroke"
                      />

                    );

                  }
                )}

              </svg>


              <div className="chart-x-labels">

                <span>
                  Live
                </span>

                <span>
                  -8
                </span>

                <span>
                  -6
                </span>

                <span>
                  -4
                </span>

                <span>
                  -2
                </span>

                <span>
                  Now
                </span>

              </div>


            </div>

          </div>

        </div>


        {/* ====================================
            RISK
        ==================================== */}

        <div className="panel risk-panel">

          <div className="panel-header">

            <div>

              <h2>
                Current Risk Status
              </h2>

              <p>
                CO₂ monitoring status
              </p>

            </div>

          </div>


          <div className="risk-content">

            <div
              className={
                `risk-circle ${risk.className}`
              }
            >

              <div className="risk-inner">

                {risk.text}

              </div>

            </div>


            <h3>
              {risk.message}
            </h3>


            <div className="risk-scale">

              <div>

                <span className="scale-dot safe-dot"></span>

                Safe

              </div>


              <div>

                <span className="scale-dot moderate-dot"></span>

                Moderate

              </div>


              <div>

                <span className="scale-dot high-dot"></span>

                High Risk

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          ENVIRONMENT
      ====================================== */}

      <section className="panel environment-panel">

        <div className="panel-header">

          <div>

            <h2>
              Environmental Conditions
            </h2>

            <p>
              Current atmospheric parameters
            </p>

          </div>

        </div>


        <div className="environment-grid">


          <div className="environment-item">

            <span>
              Temperature
            </span>

            <strong>

              {Number(
                sensorData.temperature
              ).toFixed(1)}

              {" °C"}

            </strong>

            <small className="condition-good">
              Live
            </small>

          </div>


          <div className="environment-item">

            <span>
              Humidity
            </span>

            <strong>

              {Number(
                sensorData.humidity
              ).toFixed(1)}

              {" %"}

            </strong>

            <small className="condition-good">
              Live
            </small>

          </div>


          <div className="environment-item">

            <span>
              CO₂
            </span>

            <strong>

              {Math.round(
                sensorData.co2
              )}

              {" ppm"}

            </strong>

            <small className="condition-good">
              MH-Z19E
            </small>

          </div>


          <div className="environment-item">

            <span>
              MQ-7
            </span>

            <strong>

              {Math.round(
                sensorData.co
              )}

            </strong>

            <small className="condition-good">
              Raw value
            </small>

          </div>

        </div>

      </section>

    </div>

  );

}

export default Dashboard;