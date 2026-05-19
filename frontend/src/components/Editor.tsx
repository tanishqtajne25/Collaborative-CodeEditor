import MonacoEditor from "@monaco-editor/react"

type EditorProps = {
  code: string
  setCode: React.Dispatch<React.SetStateAction<string>>
}

function Editor({ code, setCode }: EditorProps) {
  return (
    <MonacoEditor
      height="70vh"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={code}
      onChange={(value) => {
        setCode(value || "")
      }}
    />
  )
}

export default Editor