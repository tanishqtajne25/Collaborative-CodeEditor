type TerminalProps = {
  output: string
  stderr?: string
  isRunning?: boolean
}

function Terminal({ output, stderr, isRunning }: TerminalProps) {
  return (
    <div
      style={{
        backgroundColor: "#0d0d0d",
        color: "#e0e0e0",
        padding: "12px 16px",
        minHeight: "150px",
        maxHeight: "250px",
        overflowY: "auto",
        fontFamily: "'Cascadia Code', 'Fira Code', monospace",
        fontSize: "13px",
        borderTop: "1px solid #333"
      }}
    >
      <div style={{ color: "#888", marginBottom: "8px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
        Terminal
      </div>

      {isRunning && (
        <div style={{ color: "#ffa726" }}>
          ⏳ Executing code...
        </div>
      )}

      {!isRunning && output && (
        <pre style={{ margin: 0, color: "#4caf50", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{output}</pre>
      )}

      {!isRunning && stderr && (
        <pre style={{ margin: "8px 0 0 0", color: "#ef5350", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {stderr}
        </pre>
      )}

      {!isRunning && !output && !stderr && (
        <div style={{ color: "#555" }}>Console output will appear here...</div>
      )}
    </div>
  )
}

export default Terminal