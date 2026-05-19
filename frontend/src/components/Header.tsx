type HeaderProps = {
  onRun: () => void
}

function Header({ onRun }: HeaderProps) {
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
        borderBottom: "1px solid #333"
      }}
    >
      <h2>Cloud Code Editor</h2>
      <div>Room: XYZ-123</div>

      <button
        onClick={onRun}
        style={{
          padding: "10px 16px",
          cursor: "pointer"
        }}
      >
        Run Code
      </button>
    </div>
  )
}

export default Header