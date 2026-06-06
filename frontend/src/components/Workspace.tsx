import CollaborativeEditor from "./CollaborativeEditor"
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
      <CollaborativeEditor roomId="room-1" />

      <Terminal output={output} />
    </div>
  )
}

export default Workspace