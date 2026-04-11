import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "12px",
          fontFamily: "sans-serif",
        }}>
          <div style={{ fontSize: "32px" }}>💸</div>
          <div style={{ fontSize: "16px", fontWeight: 500 }}>
            Something went wrong
          </div>
          <div style={{
            fontSize: "13px",
            color: "#888",
            maxWidth: "300px",
            textAlign: "center",
          }}>
            {this.state.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1.5px solid #E91E8C",
              background: "transparent",
              color: "#E91E8C",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
