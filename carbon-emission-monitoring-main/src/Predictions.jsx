import { useEffect, useState } from "react";

function Predictions() {
  // ==========================================
  // SENSOR DATA FROM FASTAPI
  // ==========================================

  const [sensorData, setSensorData] = useState({
    co2: 0,
    co: 0,
    temperature: 0,
    humidity: 0,
  });

  // Actual CO2 readings received from Arduino
  const [history, setHistory] = useState([]);

  // Forecast values
  const [predictionData, setPredictionData] = useState([]);

  // Backend connection status
  const [backendConnected, setBackendConnected] = useState(false);

  // Last update time
  const [currentTime, setCurrentTime] = useState("--:--");


  // ==========================================
  // FETCH LIVE DATA FROM FASTAPI
  // ==========================================

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/sensor-data",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status}`
          );
        }

        const data = await response.json();

        console.log("Prediction page sensor data:", data);

        // --------------------------------------
        // UPDATE LIVE SENSOR DATA
        // --------------------------------------

        const co2 = Number(data.co2) || 0;

        setSensorData({
          co2: co2,
          co: Number(data.co) || 0,
          temperature:
            Number(data.temperature) || 0,
          humidity:
            Number(data.humidity) || 0,
        });

        setBackendConnected(true);

        // --------------------------------------
        // UPDATE TIME
        // --------------------------------------

        setCurrentTime(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );

        // --------------------------------------
        // STORE REAL CO2 READING
        // --------------------------------------

        setHistory((oldHistory) => {
          const newHistory = [
            ...oldHistory,
            co2,
          ];

          // Keep last 20 real readings
          return newHistory.slice(-20);
        });
      } catch (error) {
        console.error(
          "Prediction backend connection error:",
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

    return () => clearInterval(interval);
  }, []);


  // ==========================================
  // CREATE FORECAST FROM REAL SENSOR DATA
  // ==========================================

  useEffect(() => {
    if (history.length === 0) {
      setPredictionData([]);
      return;
    }

    const recentValues = history.slice(-10);

    // If there is only one reading,
    // use the current reading as the base.
    if (recentValues.length === 1) {
      const current = recentValues[0];

      setPredictionData(
        Array(10).fill(Math.round(current))
      );

      return;
    }

    // --------------------------------------
    // CALCULATE TREND FROM REAL READINGS
    // --------------------------------------

    let totalChange = 0;

    for (let i = 1; i < recentValues.length; i++) {
      totalChange +=
        recentValues[i] -
        recentValues[i - 1];
    }

    const averageChange =
      totalChange /
      (recentValues.length - 1);

    // Limit the prediction change so a single
    // abnormal sensor reading doesn't make
    // the graph jump excessively.
    const limitedChange = Math.max(
      -30,
      Math.min(30, averageChange)
    );

    // --------------------------------------
    // GENERATE 10 FUTURE VALUES
    // BASED ON ACTUAL SENSOR TREND
    // --------------------------------------

    const lastValue =
      recentValues[recentValues.length - 1];

    const forecast = [];

    for (let i = 1; i <= 10; i++) {
      const predicted =
        lastValue +
        limitedChange * i;

      // Keep forecast within a sensible
      // display range.
      const bounded = Math.max(
        300,
        Math.min(3000, predicted)
      );

      forecast.push(
        Math.round(bounded)
      );
    }

    setPredictionData(forecast);
  }, [history]);


  // ==========================================
  // CURRENT CO2
  // ==========================================

  const currentCO2 = Math.round(
    sensorData.co2
  );


  // ==========================================
  // PREDICTED CO2
  // ==========================================

  const predictedValue =
    predictionData.length > 0
      ? predictionData[
          predictionData.length - 1
        ]
      : currentCO2;


  // ==========================================
  // TREND
  // ==========================================

  let trend = "Stable";

  if (predictedValue > currentCO2 + 10) {
    trend = "Increasing";
  } else if (
    predictedValue <
    currentCO2 - 10
  ) {
    trend = "Decreasing";
  }


  // ==========================================
  // RISK FORECAST
  // ==========================================

  const getRisk = () => {
    if (predictedValue >= 1200) {
      return {
        text: "HIGH RISK",
        className: "high",
        message:
          "Predicted CO₂ level requires attention.",
      };
    }

    if (predictedValue >= 800) {
      return {
        text: "MODERATE",
        className: "moderate",
        message:
          "Predicted CO₂ level is above the normal monitoring range.",
      };
    }

    return {
      text: "SAFE",
      className: "safe",
      message:
        "Predicted CO₂ level remains within the current monitoring range.",
    };
  };

  const risk = getRisk();


  // ==========================================
  // CHART DATA
  // ==========================================

  /*
    Combine the latest actual readings with
    future forecast values.

    Actual:
      Arduino -> FastAPI -> React

    Forecast:
      Calculated from actual recent readings
  */

  const actualChartData =
    history.slice(-10);

  const combinedChartData = [
    ...actualChartData,
    ...predictionData,
  ];


  // ==========================================
  // CHART SCALE
  // ==========================================

  const max = Math.max(
    1400,
    ...combinedChartData
  );

  const min = Math.min(
    300,
    ...combinedChartData
  );

  const chartRange =
    max - min || 1;


  // ==========================================
  // CHART POINTS
  // ==========================================

  const points =
    combinedChartData.length > 0
      ? combinedChartData
          .map((value, index) => {
            const x =
              combinedChartData.length === 1
                ? 50
                : (index /
                    (combinedChartData.length -
                      1)) *
                  100;

            const y =
              100 -
              ((value - min) /
                chartRange) *
                100;

            return `${x},${Math.max(
              5,
              Math.min(95, y)
            )}`;
          })
          .join(" ")
      : "";


  // ==========================================
  // CHART Y LABELS
  // ==========================================

  const chartTop = Math.ceil(max / 100) * 100;
  const chartBottom =
    Math.floor(min / 100) * 100;

  const chartMiddle1 =
    Math.round(
      chartBottom +
        (chartTop - chartBottom) *
          0.25
    );

  const chartMiddle2 =
    Math.round(
      chartBottom +
        (chartTop - chartBottom) *
          0.5
    );

  const chartMiddle3 =
    Math.round(
      chartBottom +
        (chartTop - chartBottom) *
          0.75
    );


  // ==========================================
  // FRONTEND
  // ==========================================

  return (
    <div className="page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="page-header">

        <div>

          <div className="eyebrow">
            INTELLIGENT ANALYSIS
          </div>

          <h1>
            AI Predictions
          </h1>

          <p>
            Emission trend prediction and
            risk forecasting
          </p>

        </div>


        <div className="prediction-model">

          <span>MODEL</span>

          <strong>
            Live Trend Forecast
          </strong>

          <small
            style={{
              display: "block",
              marginTop: "4px",
            }}
          >
            Based on Arduino readings
          </small>

        </div>

      </header>


      {/* ======================================
          LIVE CONNECTION STATUS
      ====================================== */}

      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
        }}
      >

        <span
          style={{
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            backgroundColor:
              backendConnected
                ? "#16a34a"
                : "#dc2626",
            display: "inline-block",
          }}
        />

        <strong>
          {backendConnected
            ? "Live Arduino data connected"
            : "Backend disconnected"}
        </strong>

        <span>
          {backendConnected &&
            ` • Updated ${currentTime}`}
        </span>

      </div>


      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <section className="prediction-summary">


        {/* CURRENT CO2 */}

        <div className="prediction-stat">

          <span>
            CURRENT CO₂
          </span>

          <strong>
            {currentCO2}
            <small>
              {" "}ppm
            </small>
          </strong>

          <em>
            Live Arduino reading
          </em>

        </div>


        {/* PREDICTED CO2 */}

        <div className="prediction-stat">

          <span>
            PREDICTED CO₂
          </span>

          <strong>
            {predictedValue}
            <small>
              {" "}ppm
            </small>
          </strong>

          <em>
            Forecast from recent readings
          </em>

        </div>


        {/* TREND */}

        <div className="prediction-stat">

          <span>
            EMISSION TREND
          </span>

          <strong className="blue-text">
            {trend}
          </strong>

          <em>
            Based on live sensor history
          </em>

        </div>


        {/* RISK */}

        <div className="prediction-stat">

          <span>
            RISK FORECAST
          </span>

          <strong
            className={
              risk.className === "high"
                ? "red-text"
                : risk.className ===
                  "moderate"
                ? "amber-text"
                : "green-text"
            }
          >
            {risk.text}
          </strong>

          <em>
            Based on predicted CO₂
          </em>

        </div>

      </section>


      {/* ======================================
          CHART + INSIGHTS
      ====================================== */}

      <section className="prediction-main-grid">


        {/* ====================================
            CHART
        ==================================== */}

        <div className="panel prediction-chart-panel">

          <div className="panel-header">

            <div>

              <h2>
                Predicted CO₂ Trend
              </h2>

              <p>
                Live sensor readings and
                forecast
              </p>

            </div>

            <div className="forecast-label">
              LIVE FORECAST
            </div>

          </div>


          <div className="prediction-chart-area">


            {/* Y AXIS */}

            <div className="prediction-y-axis">

              <span>
                {chartTop}
              </span>

              <span>
                {chartMiddle3}
              </span>

              <span>
                {chartMiddle2}
              </span>

              <span>
                {chartMiddle1}
              </span>

              <span>
                {chartBottom}
              </span>

            </div>


            {/* CHART */}

            <div className="prediction-chart">


              <div className="prediction-grid">

                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>

              </div>


              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="forecast-svg"
              >


                {/* LINE */}

                {combinedChartData.length >
                  0 && (

                  <polyline
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />

                )}


                {/* POINTS */}

                {combinedChartData.map(
                  (value, index) => {

                    const x =
                      combinedChartData.length ===
                      1
                        ? 50
                        : (index /
                            (combinedChartData.length -
                              1)) *
                          100;

                    const y =
                      100 -
                      ((value - min) /
                        chartRange) *
                        100;

                    return (

                      <circle
                        key={index}
                        cx={x}
                        cy={Math.max(
                          5,
                          Math.min(95, y)
                        )}
                        r="1"
                        fill="currentColor"
                        vectorEffect="non-scaling-stroke"
                      />

                    );

                  }
                )}

              </svg>


              {/* X AXIS */}

              <div className="chart-x-labels">

                <span>
                  Live
                </span>

                <span>
                  Recent
                </span>

                <span>
                  Now
                </span>

                <span>
                  +1
                </span>

                <span>
                  +5
                </span>

                <span>
                  +10
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ====================================
            AI INSIGHTS
        ==================================== */}

        <div className="panel insight-panel">

          <div className="panel-header">

            <div>

              <h2>
                AI Insights
              </h2>

              <p>
                Live emission trend analysis
              </p>

            </div>

          </div>


          <div className="insight-list">


            {/* TREND */}

            <div className="insight-item">

              <div className="insight-icon blue-icon">
                T
              </div>

              <div>

                <strong>
                  Emission Trend
                </strong>

                <p>

                  {trend === "Increasing" &&
                    "CO₂ levels are showing an upward trend based on recent Arduino readings."}

                  {trend === "Decreasing" &&
                    "CO₂ levels are showing a downward trend based on recent Arduino readings."}

                  {trend === "Stable" &&
                    "CO₂ levels are currently relatively stable based on recent Arduino readings."}

                </p>

              </div>

            </div>


            {/* RISK */}

            <div className="insight-item">

              <div className="insight-icon green-icon">
                R
              </div>

              <div>

                <strong>
                  Risk Assessment
                </strong>

                <p>
                  {risk.message}
                </p>

              </div>

            </div>


            {/* EARLY WARNING */}

            <div className="insight-item">

              <div className="insight-icon amber-icon">
                W
              </div>

              <div>

                <strong>
                  Early Warning
                </strong>

                <p>

                  {predictedValue >=
                    1200
                    ? "Predicted CO₂ is in the high monitoring range. Immediate attention is recommended."
                    : predictedValue >=
                      800
                    ? "Predicted CO₂ is approaching or above the moderate monitoring range. Continue monitoring."
                    : "Continuous monitoring is active. Current predicted CO₂ remains below the moderate threshold."}

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          FORECAST
      ====================================== */}

      <section className="panel forecast-panel">

        <div className="panel-header">

          <div>

            <h2>
              Emission Forecast
            </h2>

            <p>
              Predicted environmental condition
              from live sensor readings
            </p>

          </div>

        </div>


        <div className="forecast-cards">


          {/* CO2 */}

          <div>

            <span>
              CO₂
            </span>

            <strong>
              {predictedValue} ppm
            </strong>

            <small>
              Predicted level
            </small>

          </div>


          {/* TREND */}

          <div>

            <span>
              Trend
            </span>

            <strong>
              {trend}
            </strong>

            <small>
              Emission direction
            </small>

          </div>


          {/* RISK */}

          <div>

            <span>
              Risk Level
            </span>

            <strong
              className={
                risk.className === "high"
                  ? "red-text"
                  : risk.className ===
                    "moderate"
                  ? "amber-text"
                  : "green-text"
              }
            >
              {risk.text}
            </strong>

            <small>
              Forecast assessment
            </small>

          </div>

        </div>

      </section>


      {/* ======================================
          LIVE SENSOR DETAILS
      ====================================== */}

      <section className="panel forecast-panel">

        <div className="panel-header">

          <div>

            <h2>
              Live Sensor Data
            </h2>

            <p>
              Same Arduino readings used by
              the Dashboard
            </p>

          </div>

        </div>


        <div className="forecast-cards">


          <div>

            <span>
              CO₂
            </span>

            <strong>
              {Math.round(sensorData.co2)}
              {" "}ppm
            </strong>

            <small>
              MH-Z19E
            </small>

          </div>


          <div>

            <span>
              CO
            </span>

            <strong>
              {Math.round(sensorData.co)}
            </strong>

            <small>
              MQ-7 raw
            </small>

          </div>


          <div>

            <span>
              Temperature
            </span>

            <strong>
              {sensorData.temperature.toFixed(1)}
              {" "}°C
            </strong>

            <small>
              DHT22
            </small>

          </div>


          <div>

            <span>
              Humidity
            </span>

            <strong>
              {sensorData.humidity.toFixed(1)}
              {" "}%
            </strong>

            <small>
              DHT22
            </small>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Predictions;