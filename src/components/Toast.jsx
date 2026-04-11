import { useEffect, useState } from "react";

export default function Toast({ visible, message }) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#E91E8C",
      color: "white",
      padding: "10px 20px",
      borderRadius: "999px",
      fontSize: "14px",
      fontWeight: 500,
      zIndex: 9999,
      animation: "slideUp 0.3s ease forwards",
      boxShadow: "0 4px 12px rgba(233, 30, 140, 0.3)",
    }}>
      {message}
    </div>
  );
}
