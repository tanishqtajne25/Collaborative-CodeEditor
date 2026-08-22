import { useRef, useEffect } from "react";
import type { JSX } from "react";
import Editor, { useMonaco } from "@monaco-editor/react"; // react wrapper
import * as Y from "yjs"; // crdt engine
import { WebsocketProvider } from "y-websocket";  // connects yjs doc to backend server
import { MonacoBinding } from "y-monaco"; // bridges monaco-editor to y-js doc
import type { editor as MonacoEditorType } from 'monaco-editor';
import type { WebsocketProvider as WebsocketProviderType } from 'y-websocket';
import type { MonacoBinding as MonacoBindingType } from 'y-monaco';
import { getOrCreateLocalUser, type Collaborator } from "../utils/user";

interface CollaborativeEditorProps {
  roomId?: string;
  language?: string;
  defaultCode?: string;
  onEditorMount?: (editor: MonacoEditorType.IStandaloneCodeEditor) => void;
  onCollaboratorsChange?: (collaborators: Collaborator[]) => void;
}

interface YDoc extends Y.Doc {}

const CollaborativeEditor = ({
  roomId = 'room-1',
  language = 'python',
  defaultCode,
  onEditorMount,
  onCollaboratorsChange,
}: CollaborativeEditorProps): JSX.Element => {
  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null);
  const monaco = useMonaco();

  // Dynamically update Monaco model language when language prop changes
  useEffect(() => {
    if (monaco && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language, monaco]);

  // This fires exactly once when Monaco is fully initialized in the DOM
  const handleEditorDidMount = (
    editor: MonacoEditorType.IStandaloneCodeEditor,
    _monaco: typeof MonacoEditorType
  ): void => {
    editorRef.current = editor;

    // Expose the editor instance to the parent component
    if (onEditorMount) {
      onEditorMount(editor);
    }

    // 1. Initialize the CRDT document
    const ydoc: YDoc = new Y.Doc();

    // 2. Connect to your local Node WebSocket server
    const provider: WebsocketProviderType = new WebsocketProvider(
      'ws://localhost:3001',
      roomId,
      ydoc
    );

    // 3. Set local awareness user details (for collaborative cursors & presence)
    const localUser = getOrCreateLocalUser();
    provider.awareness.setLocalStateField('user', {
      name: localUser.name,
      color: localUser.color,
    });

    // 4. Listen to awareness changes to update active collaborators list
    const updateCollaborators = () => {
      const states = provider.awareness.getStates();
      const list: Collaborator[] = [];
      states.forEach((state: any, clientId: number) => {
        if (state.user) {
          list.push({
            clientId,
            name: state.user.name || `User ${clientId}`,
            color: state.user.color || '#3b82f6',
            isSelf: clientId === provider.awareness.clientID,
          });
        }
      });
      if (onCollaboratorsChange) {
        onCollaboratorsChange(list);
      }
    };

    provider.awareness.on('change', updateCollaborators);
    // Initial call once provider is ready
    updateCollaborators();

    // 5. Define a shared text type on the document
    const ytext: Y.Text = ydoc.getText('monaco');

    // If doc is completely fresh/empty and we have default starter code, insert it
    provider.on('sync', (isSynced: boolean) => {
      if (isSynced && ytext.length === 0 && defaultCode) {
        ytext.insert(0, defaultCode);
      }
    });

    // 6. Bind the Yjs document to the Monaco Editor instance with awareness
    const model = editor.getModel();
    if (!model) return;

    const binding: MonacoBindingType = new MonacoBinding(
      ytext,
      model,
      new Set([editor]),
      provider.awareness
    );

    // 7. CRITICAL: Cleanup to prevent memory leaks and zombie WebSockets
    editor.onDidDispose(() => {
      provider.awareness.off('change', updateCollaborators);
      binding.destroy();
      provider.disconnect();
      ydoc.destroy();
    });
  };

  return (
    <div style={{ height: '70vh', width: '100%' }}>
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CollaborativeEditor;

