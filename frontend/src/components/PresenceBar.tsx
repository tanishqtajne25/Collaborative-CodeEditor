import { useState } from "react";
import type { Collaborator } from "../utils/user";

interface PresenceBarProps {
  collaborators: Collaborator[];
  localUser: { name: string; color: string };
}


export default function PresenceBar({
  collaborators,
  localUser,
}: PresenceBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        position: "relative",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Online Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "#1c2a22",
          border: "1px solid #166534",
          color: "#4ade80",
          padding: "4px 10px",
          borderRadius: "16px",
          fontSize: "12px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            display: "inline-block",
            boxShadow: "0 0 8px #22c55e",
          }}
        />
        <span>
          {collaborators.length}{" "}
          {collaborators.length === 1 ? "Collaborator" : "Collaborators"}
        </span>
      </div>

      {/* Avatars Stack */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {collaborators.map((c, index) => {
          const isSelf = c.name === localUser.name;
          const initials = c.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={c.clientId || index}
              title={`${c.name}${isSelf ? " (You)" : ""}`}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: c.color || "#3b82f6",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "700",
                border: isSelf ? "2px solid #ffffff" : "2px solid #111111",
                marginLeft: index === 0 ? "0" : "-8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                zIndex: collaborators.length - index,
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
            >
              {initials}
            </div>
          );
        })}
      </div>

      {/* Expanded Collaborators Dropdown Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            marginTop: "8px",
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            padding: "10px 14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            zIndex: 100,
            minWidth: "200px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "8px",
            }}
          >
            Active in Room
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {collaborators.map((c, i) => (
              <div
                key={c.clientId || i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#f3f4f6",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: c.color,
                  }}
                />
                <span
                  style={{
                    fontWeight: c.name === localUser.name ? "700" : "500",
                  }}
                >
                  {c.name}
                  {c.name === localUser.name && (
                    <span style={{ color: "#9ca3af", marginLeft: "4px" }}>
                      (You)
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
