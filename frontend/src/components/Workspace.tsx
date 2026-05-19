import Editor from "./Editor"
import Terminal from "./Terminal"

type WorkspaceProps = {
  code: string
  setCode: React.Dispatch<React.SetStateAction<string>>
  output: string
}

function Workspace({
  code,
  setCode,
  output
}: WorkspaceProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Editor code={code} setCode={setCode} />

      <Terminal output={output} />
    </div>
  )
}

export default Workspace