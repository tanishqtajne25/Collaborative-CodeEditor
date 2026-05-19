type TerminalProps = {
  output: string
}

function Terminal({ output }: TerminalProps) {
  return (
    <div
      style={{
        backgroundColor: "black",
        color: "lime",
        padding: "16px",
        minHeight: "150px",
        borderRadius: "8px",
        fontFamily: "monospace"
      }}
    >
      <pre>{output}</pre> // preserve formatting exactly
    </div>
  )
}

export default Terminal