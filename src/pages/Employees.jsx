import React, { useState } from "react";
import "./Employees.css";

const EMPLOYEE_PASSWORD = "bacb";

const quickActions = [
  {
    title: "Mileage Reimbursement",
    description: "Review mileage reimbursement information and procedures.",
    icon: "🚗",
    url: "https://docs.google.com/document/d/1xHPYsnuUs10oMegQspqWx3idoBfPQePi/edit?usp=sharing&ouid=113727444402529804003&rtpof=true&sd=true",
  },
  {
    title: "Annual Raise Policy",
    description: "Review the company’s annual raise policy.",
    icon: "📈",
    url: "https://docs.google.com/document/d/10X38gGVdz9uWjnhws1ofQOLdmm0yz2U4XOpChiD8vck/edit?usp=sharing",
  },
  {
    title: "Employee Handbook",
    description: "Access company policies, expectations, and procedures.",
    icon: "📘",
    url: "https://docs.google.com/document/d/1y-ewWcCVNlG_mI2dnEqKiR7TItLamaEATkS9VterLXI/edit?usp=sharing",
  },
  {
    title: "Absence Request Form",
    description: "Submit a request for an employee absence.",
    icon: "📝",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSeDZmhB5JUY5YVzeUzVy5B0zAiSANUKLATlqqKADy0GCkUIBw/viewform?usp=sharing&ouid=113727444402529804003",
  },
];

const clinicalSystems = [
  {
    title: "Aloha Help Center",
    description: "Find guides and support resources for AlohaABA.",
    icon: "💻",
    url: "https://support.alohaaba.com/portal/en/kb/alohaabahelp",
  },
  {
    title: "Hi Rasmus Help Center",
    description: "Access Hi Rasmus tutorials and support articles.",
    icon: "🧩",
    url: "https://help.hirasmus.com/knowledge",
  },
];

function ResourceCard({ resource }) {
  return (
    <a
      className="employee-resource-card"
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="employee-resource-icon" aria-hidden="true">
        {resource.icon}
      </span>

      <div>
        <h3>{resource.title}</h3>
        <p>{resource.description}</p>
        <span className="employee-resource-link">
          Open resource <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  );
}

export default function Employees() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("employeeHubAccess") === "granted"
  );

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    if (password.trim().toLowerCase() === EMPLOYEE_PASSWORD) {
      sessionStorage.setItem("employeeHubAccess", "granted");
      setIsAuthenticated(true);
      setPassword("");
      setError("");
      return;
    }

    setError("The password you entered is incorrect.");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("employeeHubAccess");
    setIsAuthenticated(false);
    setPassword("");
    setError("");
  };

  if (!isAuthenticated) {
    return (
      <main className="employee-login-page">
        <section className="employee-login-card">
          <div className="employee-lock-icon" aria-hidden="true">
            🔒
          </div>

          <p className="employee-eyebrow">Staff Access</p>

          <h1>Employee Hub</h1>

          <p className="employee-login-intro">
            This area is reserved for Au-Some Teacher ABA employees. Enter the
            employee password to continue.
          </p>

          <form onSubmit={handleLogin} className="employee-login-form">
            <label htmlFor="employee-password">Employee password</label>

            <input
              id="employee-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter password"
              autoComplete="current-password"
              autoFocus
            />

            {error && (
              <p className="employee-login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit">Enter Employee Hub</button>
          </form>

          <p className="employee-login-help">
            Contact administration if you need assistance accessing this page.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="employee-hub-page">
      <section className="employee-hub-hero">
        <div className="employee-hub-container">
          <div className="employee-hub-heading-row">
            <div>
              <p className="employee-eyebrow">Au-Some Teacher ABA Services</p>

              <h1>Welcome to the Employee Hub</h1>

              <p>
                Your one-stop location for company forms, policies, clinical
                support, and day-to-day employee resources.
              </p>
            </div>

            <button
              type="button"
              className="employee-logout-button"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      <div className="employee-hub-container employee-hub-content">
        <section className="employee-resource-section">
          <div className="employee-section-heading">
            <div>
              <p className="employee-section-label">Employee resources</p>
              <h2>Quick Actions</h2>
            </div>

            <p>
              Access frequently used forms, policies, and company documents.
            </p>
          </div>

          <div className="employee-resource-grid">
            {quickActions.map((resource) => (
              <ResourceCard key={resource.title} resource={resource} />
            ))}
          </div>
        </section>

        <section className="employee-resource-section">
          <div className="employee-section-heading">
            <div>
              <p className="employee-section-label">Clinical support</p>
              <h2>Help Centers</h2>
            </div>

            <p>
              Find answers, tutorials, and support for the systems used by our
              clinical team.
            </p>
          </div>

          <div className="employee-resource-grid employee-resource-grid-two">
            {clinicalSystems.map((resource) => (
              <ResourceCard key={resource.title} resource={resource} />
            ))}
          </div>
        </section>

        <section className="employee-support-banner">
          <div>
            <p className="employee-section-label">Need help?</p>
            <h2>Contact administration</h2>
            <p>
              Contact the Au-Some Teacher ABA administrative team if you cannot
              access a document or need employee support.
            </p>
          </div>

          <a href="mailto:info@au-someteacher.com">
            Email Administration
          </a>
        </section>
      </div>
    </main>
  );
}
