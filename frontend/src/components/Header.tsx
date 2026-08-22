import LanguageSelector from "./LanguageSelector";
import PresenceBar from "./PresenceBar";
import { Link } from "react-router-dom";
import type { Collaborator } from "../utils/user";
import { useAuth } from "../context/AuthContext";

type HeaderProps = {
  roomId: string;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  collaborators: Collaborator[];
  localUser: { name: string; color: string };
  onRun: () => void;
  isRunning: boolean;
};

function Header({
  roomId,
  selectedLanguage,
  onLanguageChange,
  collaborators,
  localUser,
  onRun,
  isRunning,
}: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        height: "60px",
        backgroundColor: "#111",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid #333",
      }}
    >
      {/* Brand & Room info */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link
          to="/"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          title="Return to Home"
        >
          <span>⚡</span>
          <span>Cloud Code Editor</span>
        </Link>

        <div
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            backgroundColor: "#222",
            padding: "4px 10px",
            borderRadius: "6px",
            border: "1px solid #333",
          }}
        >
          <span style={{ color: "#888" }}>Room: </span>
          <span style={{ color: "#38bdf8", fontWeight: "600" }}>{roomId}</span>
        </div>
      </div>

      {/* Center/Right Controls: Presence + Language + Run + User */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <PresenceBar
          collaborators={collaborators}
          localUser={localUser}
        />

        <div style={{ width: "1px", height: "24px", backgroundColor: "#333" }} />

        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          disabled={isRunning}
        />

        <button
          onClick={onRun}
          disabled={isRunning}
          style={{
            padding: "8px 18px",
            cursor: isRunning ? "not-allowed" : "pointer",
            backgroundColor: isRunning ? "#4b5563" : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "background-color 0.2s",
          }}
        >
          {isRunning ? (
            <>
              <span>⏳</span>
              <span>Running...</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>Run Code</span>
            </>
          )}
        </button>

        <div style={{ width: "1px", height: "24px", backgroundColor: "#333" }} />

        {/* User Account Controls */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#e5e5e5",
                backgroundColor: "#222",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid #374151",
              }}
              title={user.email}
            >
              👤 {user.name}
            </div>
            <button
              onClick={logout}
              style={{
                padding: "4px 8px",
                backgroundColor: "transparent",
                border: "1px solid #4b5563",
                borderRadius: "4px",
                color: "#9ca3af",
                fontSize: "12px",
                cursor: "pointer",
              }}
              title="Sign Out"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              padding: "6px 14px",
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              color: "#60a5fa",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;


