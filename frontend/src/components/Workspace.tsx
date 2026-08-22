import CollaborativeEditor from "./CollaborativeEditor";
import Terminal from "./Terminal";
import type { editor as MonacoEditorType } from "monaco-editor";
import type { Collaborator } from "../utils/user";

type WorkspaceProps = {
  roomId: string;
  language: string;
  defaultCode?: string;
  output: string;
  stderr: string;
  isRunning: boolean;
  onEditorMount: (editor: MonacoEditorType.IStandaloneCodeEditor) => void;
  onCollaboratorsChange?: (collaborators: Collaborator[]) => void;
};

function Workspace({
  roomId,
  language,
  defaultCode,
  output,
  stderr,
  isRunning,
  onEditorMount,
  onCollaboratorsChange,
}: WorkspaceProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CollaborativeEditor
        roomId={roomId}
        language={language}
        defaultCode={defaultCode}
        onEditorMount={onEditorMount}
        onCollaboratorsChange={onCollaboratorsChange}
      />

      <Terminal output={output} stderr={stderr} isRunning={isRunning} />
    </div>
  );
}

export default Workspace;

