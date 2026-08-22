import { useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { editor as MonacoEditorType } from "monaco-editor";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Workspace from "../components/Workspace";
import { SUPPORTED_LANGUAGES } from "../components/LanguageSelector";
import { getOrCreateLocalUser, type Collaborator } from "../utils/user";

function EditorPage() {
  // Get room ID from the URL: /room/:roomId
  const { roomId } = useParams<{ roomId: string }>();
  const effectiveRoomId = roomId || "default";

  // Local user identity (saved in sessionStorage)
  const localUser = useMemo(() => getOrCreateLocalUser(), []);

  // Active collaborators in the room
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Selected programming language (default: python)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");

  // Reference to the Monaco editor instance
  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null);

  // Execution output states
  const [output, setOutput] = useState("");
  const [stderr, setStderr] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const currentLangConfig =
    SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage) ||
    SUPPORTED_LANGUAGES[0];

  function handleEditorMount(editor: MonacoEditorType.IStandaloneCodeEditor) {
    editorRef.current = editor;
  }

  function handleLanguageChange(newLangId: string) {
    setSelectedLanguage(newLangId);
  }

  async function handleRunCode() {
    const code = editorRef.current?.getValue() || "";

    if (!code.trim()) {
      setOutput("");
      setStderr("Error: No code to execute.");
      return;
    }

    setIsRunning(true);
    setOutput("");
    setStderr("");

    try {
      const response = await fetch("http://localhost:3001/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage,
          code: code,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOutput(result.stdout || "");
        setStderr(result.stderr || "");
      } else {
        setStderr(result.error || "Execution failed.");
      }
    } catch (error: any) {
      setStderr(
        `Failed to connect to execution server.\n\nMake sure the sync-server is running on port 3001 and Docker is running on your system.`
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1e1e1e",
      }}
    >
      <Header
        roomId={effectiveRoomId}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        collaborators={collaborators}
        localUser={localUser}
        onRun={handleRunCode}
        isRunning={isRunning}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
        }}
      >
        <Sidebar />

        <Workspace
          roomId={effectiveRoomId}
          language={currentLangConfig.monacoLang}
          defaultCode={currentLangConfig.defaultCode}
          output={output}
          stderr={stderr}
          isRunning={isRunning}
          onEditorMount={handleEditorMount}
          onCollaboratorsChange={setCollaborators}
        />
      </div>
    </div>
  );
}

export default EditorPage;

