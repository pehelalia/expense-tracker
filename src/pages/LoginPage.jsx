import { useState } from "react";

export default function LoginPage({ onSignUp, onSignIn, error: authError }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Basic validation
    if (!isSignUp && !email.trim()) {
      setLocalError("Email is required");
      return;
    }
    if (!password.trim()) {
      setLocalError("Password is required");
      return;
    }
    if (isSignUp && !username.trim()) {
      setLocalError("Username is required");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await onSignUp(email, password, username);
      } else {
        await onSignIn(email, password);
      }
      // Clear form on success
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (err) {
      // Error is already set by the hook, but we can show a generic message
      setLocalError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo & Title */}
        <div className="login-header">
          <div className="login-logo">💰</div>
          <h1 className="login-title">Spendwise</h1>
          <p className="login-subtitle">Student Expense Tracker</p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${!isSignUp ? "login-tab--active" : ""}`}
            onClick={() => {
              setIsSignUp(false);
              setLocalError("");
              setUsername("");
            }}
          >
            Sign in
          </button>
          <button
            className={`login-tab ${isSignUp ? "login-tab--active" : ""}`}
            onClick={() => {
              setIsSignUp(true);
              setLocalError("");
            }}
          >
            Create account
          </button>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Username field - only on signup */}
          {isSignUp && (
            <div className="login-field">
              <label htmlFor="username" className="login-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Email field */}
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Password field */}
          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Error message */}
          {displayError && <div className="login-error">{displayError}</div>}

          {/* Submit button */}
          <button
            type="submit"
            className="login-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner spinner--sm"></span>
                Loading...
              </>
            ) : isSignUp ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Helper text */}
        <p className="login-helper">
          {isSignUp
            ? "Already have an account? Switch to sign in above."
            : "Don't have an account? Use the Create account tab above."}
        </p>
      </div>
    </div>
  );
}
