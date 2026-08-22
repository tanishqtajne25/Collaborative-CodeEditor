import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  owner?: { id: string; name: string; email: string };
  room?: { docName: string; updatedAt: string };
  files: { id: string; name: string; language: string }[];
  updatedAt: string;
}

export default function LandingPage() {
  const [joinRoomId, setJoinRoomId] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectLang, setNewProjectLang] = useState("python");
  const [loading, setLoading] = useState(false);

  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("http://localhost:3001/api/projects", { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch {
      // Backend may be starting or offline
    }
  };

  const handleCreateRoom = () => {
    const randomId = "room-" + Math.random().toString(36).substring(2, 8);
    navigate(`/room/${randomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinRoomId.trim();
    if (trimmed) {
      navigate(`/room/${trimmed}`);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("http://localhost:3001/api/projects", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: newProjectName.trim(),
          initialLanguage: newProjectLang,
        }),
      });
      const data = await res.json();
      if (data.success && data.project?.room?.docName) {
        navigate(`/room/${data.project.room.docName}`);
      } else {
        handleCreateRoom();
      }
    } catch {
      handleCreateRoom();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#0d0d0d",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "30px 20px 60px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* Top Navbar / Auth Banner */}
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "36px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700" }}>
          <span>⚡</span>
          <span>Cloud Code Editor</span>
        </div>

        <div>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "13px", color: "#d1d5db" }}>
                Welcome, <strong style={{ color: "#fff" }}>{user.name}</strong>
              </span>
              <button
                onClick={logout}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "transparent",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#9ca3af",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <Link
                to="/login"
                style={{
                  padding: "6px 14px",
                  color: "#d1d5db",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  padding: "6px 14px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <div style={{ textAlign: "center", maxWidth: "600px", marginBottom: "36px" }}>
        <div style={{ fontSize: "42px", marginBottom: "8px" }}>⚡</div>
        <h1 style={{ margin: "0 0 10px 0", fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          Collaborative Code Editor
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "16px", margin: 0, lineHeight: 1.5 }}>
          Real-time collaborative IDE with Yjs CRDT synchronization, persistent project storage, and sandboxed Docker execution.
        </p>
      </div>


      {/* Main Action Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          width: "100%",
          maxWidth: "880px",
          marginBottom: "40px",
        }}
      >
        {/* Quick Room Box */}
        <div
          style={{
            backgroundColor: "#171717",
            padding: "28px",
            borderRadius: "12px",
            border: "1px solid #262626",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "#60a5fa" }}>
              🚀 Quick Collaborative Room
            </div>
            <p style={{ color: "#737373", fontSize: "13px", margin: "0 0 20px 0" }}>
              Instantly start coding with live peer presence and multi-language execution.
            </p>

            <button
              onClick={handleCreateRoom}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#ffffff",
                backgroundColor: "#2563eb",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              + Create Instant Room
            </button>
          </div>

          <div>
            <div style={{ height: "1px", backgroundColor: "#262626", margin: "12px 0 16px 0" }} />
            <form onSubmit={handleJoinRoom} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Enter room ID (e.g. room-xyz)"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  backgroundColor: "#262626",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!joinRoomId.trim()}
                style={{
                  padding: "10px 16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#fff",
                  backgroundColor: joinRoomId.trim() ? "#16a34a" : "#333",
                  border: "none",
                  borderRadius: "6px",
                  cursor: joinRoomId.trim() ? "pointer" : "not-allowed",
                }}
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Create Saved Project Box */}
        <div
          style={{
            backgroundColor: "#171717",
            padding: "28px",
            borderRadius: "12px",
            border: "1px solid #262626",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "#34d399" }}>
            📁 Persisted Projects (Database)
          </div>
          <p style={{ color: "#737373", fontSize: "13px", margin: "0 0 16px 0" }}>
            Create a named project persisted in the SQLite/PostgreSQL database with CRDT snapshots.
          </p>

          {!isCreatingProject ? (
            <button
              onClick={() => setIsCreatingProject(true)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#ffffff",
                backgroundColor: "#059669",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              + Create New Named Project
            </button>
          ) : (
            <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Project name (e.g. My Algorithm)"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
                style={{
                  padding: "10px 12px",
                  backgroundColor: "#262626",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  value={newProjectLang}
                  onChange={(e) => setNewProjectLang(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: "#262626",
                    color: "#fff",
                    border: "1px solid #404040",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node)</option>
                  <option value="cpp">C++ (GCC)</option>
                  <option value="java">Java (OpenJDK)</option>
                </select>
                <button
                  type="submit"
                  disabled={loading || !newProjectName.trim()}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#059669",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Creating..." : "Save & Open"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "transparent",
                    color: "#a3a3a3",
                    border: "1px solid #404040",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Persisted Projects Grid */}
      {projects.length > 0 && (
        <div style={{ width: "100%", maxWidth: "880px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#e5e5e5", marginBottom: "16px" }}>
            📂 Saved Database Projects ({projects.length})
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {projects.map((proj) => {
              const docName = proj.room?.docName || `room-${proj.id.slice(0, 6)}`;
              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/room/${docName}`)}
                  style={{
                    backgroundColor: "#171717",
                    border: "1px solid #262626",
                    borderRadius: "8px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "border-color 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#262626";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#fff", marginBottom: "4px" }}>
                    {proj.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#737373", marginBottom: "12px", fontFamily: "monospace" }}>
                    Room: {docName}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#a3a3a3" }}>
                    <span>{proj.files.length} {proj.files.length === 1 ? "file" : "files"}</span>
                    <span style={{ color: "#3b82f6", fontWeight: "600" }}>Open →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

