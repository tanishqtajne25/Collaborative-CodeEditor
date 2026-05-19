import { useState } from "react"

import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import Workspace from "../components/Workspace"

function EditorPage() {
  const [code, setCode] = useState(
`function greet() {
  console.log("Hello World")
}

greet()
`
  )

  const [output, setOutput] = useState(
    "Console output will appear here..."
  )

  function handleRunCode() {
    setOutput(code)
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1e1e1e"
      }}
    >
      <Header onRun={handleRunCode} />

      <div
        style={{
          flex: 1,
          display: "flex"
        }}
      >
        <Sidebar />

        <Workspace
          code={code}
          setCode={setCode}
          output={output}
        />
      </div>
    </div>
  )
}

export default EditorPage