import { useState } from "react";
import Dashboard from "./Dashboard";
import Monitoring from "./Monitoring";
import Predictions from "./Predictions";
import Alerts from "./Alerts";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email.trim() && password.trim()) {
      onLogin();
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">

        <div className="login-brand">
          <div className="login-logo">CE</div>

          <div>
            <h2>CarbonGuard</h2>
            <span>Emission Monitoring & Predicting</span>
          </div>
        </div>

        <div className="login-main-content">

          <div className="login-label">
            INDUSTRIAL ENVIRONMENT MONITORING & PREDICTING.
          </div>

          <h1>
            Monitor & predicts emissions.<br />
            Protect your industry.
          </h1>

          <p>
            Real-time carbon emission monitoring & predicting and intelligent
            environmental insights for industrial operations.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <div className="feature-icon">CO₂</div>
              <div>
                <strong>Emission Monitoring</strong>
                <span>Track critical emission parameters</span>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-icon">AI</div>
              <div>
                <strong>AI-Powered Insights</strong>
                <span>Identify emission trends and risks</span>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-icon">24</div>
              <div>
                <strong>Continuous Monitoring</strong>
                <span>Stay informed about current conditions</span>
              </div>
            </div>

          </div>

        </div>

        <div className="login-footer">
          CarbonGuard Industrial Monitoring & Prediction System
        </div>

      </div>


      <div className="login-right">

        <div className="login-card">

          <div className="login-card-header">

            <h2>Industry Admin Login</h2>

            <p>
              Sign in to access your monitoring dashboard
            </p>

          </div>


          <form onSubmit={handleLogin}>

            <div className="login-field">

              <label>Admin Email</label>

              <input
                type="email"
                placeholder="admin@industry.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>


            <div className="login-field">

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

            </div>


            <div className="login-options">

              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>


            <button
              type="submit"
              className="login-button"
            >
              Sign In
            </button>

          </form>


          <div className="login-security">

            <span className="security-dot"></span>

            Secure access for authorized administrators

          </div>

        </div>

      </div>

    </div>
  );
}


function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");


  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }


  const renderPage = () => {

    switch (activePage) {

      case "monitoring":
        return <Monitoring />;

      case "predictions":
        return <Predictions />;

      case "alerts":
        return <Alerts />;

      default:
        return <Dashboard />;
    }
  };


  return (
    <div className="app-layout">

      <aside className="main-sidebar">

        <div className="brand">

          <div className="brand-logo">
            CE
          </div>

          <div>
            <h2>CarbonGuard</h2>
            <span>Emission & Prediction Monitoring</span>
          </div>

        </div>


        <nav className="sidebar-nav">

          <button
            className={`nav-button ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>


          <button
            className={`nav-button ${
              activePage === "monitoring" ? "active" : ""
            }`}
            onClick={() => setActivePage("monitoring")}
          >
            Live Monitoring
          </button>


          <button
            className={`nav-button ${
              activePage === "predictions" ? "active" : ""
            }`}
            onClick={() => setActivePage("predictions")}
          >
            AI Predictions
          </button>


          <button
            className={`nav-button ${
              activePage === "alerts" ? "active" : ""
            }`}
            onClick={() => setActivePage("alerts")}
          >
            Alerts
          </button>

        </nav>


        <div className="sidebar-bottom">

          <div className="sidebar-online">
            <span></span>

            <div>
              <strong>System Online</strong>
              <small>Monitoring active</small>
            </div>
          </div>

        </div>

      </aside>


      <main className="app-content">

        {renderPage()}

      </main>

    </div>
  );
}

export default App;