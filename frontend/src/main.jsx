import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
            textAlign: "center",
            fontFamily: "'Inter', 'Roboto', sans-serif",
            background: "#f8fafc",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ color: "#1e293b", marginBottom: "8px" }}>
            Đã xảy ra lỗi không mong muốn
          </h2>
          <p style={{ color: "#64748b", marginBottom: "24px", maxWidth: 480 }}>
            Ứng dụng gặp sự cố. Vui lòng tải lại trang, nếu vấn đề vẫn tiếp
            diễn hãy liên hệ quản trị viên.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 28px",
              borderRadius: "8px",
              border: "none",
              background: "#1976d2",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🔄 Tải lại trang
          </button>
          {isDev && (
            <details style={{ marginTop: "24px", textAlign: "left", maxWidth: 640 }}>
              <summary style={{ cursor: "pointer", color: "#94a3b8", fontSize: "0.85rem" }}>
                Chi tiết lỗi (chỉ hiển thị trong môi trường phát triển)
              </summary>
              <pre
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  background: "#1e293b",
                  color: "#f1f5f9",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  overflow: "auto",
                }}
              >
                {this.state.error?.toString()}
                {"\n\n"}
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
