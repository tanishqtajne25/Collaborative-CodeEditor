import React, {useRef} from "react";
import Editor from "@monaco-editor/react"; // react wrapper
import * as Y from "yjs"; // crdt engine
import { WebsocketProvider } from "y-websocket";  // connects yjs doc to backend server
import {MonacoBinding} from "y-monaco"; // bridges monaco-editor to y-js doc

const CollaborativeEditor = ({ roomId = 'room-1' }) => { // If no room passed -> room 1 : simple react destructruing
  const editorRef = useRef(null);

  // This fires exactly once when Monaco is fully initialized in the DOM
  const handleEditorDidMount = (editor, monaco) => { // component finished rendering to dom
    editorRef.current = editor;

    // 1. Initialize the CRDT document
    const ydoc = new Y.Doc(); // y.Doc stores collaborative state, react is no longer source of truth, yjs is
    //y.docc->shared collaborative memory->has local memory->automatic syncro

    // 2. Connect to your local Node WebSocket server
    // The roomId acts as the channel name. Anyone on 'room-1' shares this doc.
    const provider = new WebsocketProvider(
      'ws://localhost:3001', // ws not http, because websocket protocol
      roomId, //room name
      ydoc // shared crdt doc for syncro
    );

    // 3. Define a shared text type on the document
    const ytext = ydoc.getText('monaco'); 

    // 4. Bind the Yjs document to the Monaco Editor instance
    const binding = new MonacoBinding(
      ytext, // shared crdt text
      editor.getModel(), // monaco text model
      new Set([editor]), //set of connected editors->supports multiple editors sharing same model
      provider.awareness // Handles the cursor tracking automatically
    );

    // 5. CRITICAL: Cleanup to prevent memory leaks and zombie WebSockets
    editor.onDidDispose(() => {
      binding.destroy();
      provider.disconnect();
      ydoc.destroy();
    });
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false }, // Hiding minimap keeps the UI cleaner
          fontSize: 16,
          wordWrap: 'on'
        }}
      />
    </div>
  );
};

export default CollaborativeEditor;