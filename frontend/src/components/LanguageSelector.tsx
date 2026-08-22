export interface LanguageOption {
  id: string;
  name: string;
  monacoLang: string;
  extension: string;
  defaultCode: string;
}


export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    id: "python",
    name: "Python 3",
    monacoLang: "python",
    extension: "py",
    defaultCode: `# Python 3.13
def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("Developer"))
`,
  },
  {
    id: "javascript",
    name: "JavaScript (Node)",
    monacoLang: "javascript",
    extension: "js",
    defaultCode: `// JavaScript (Node.js 20)
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));
`,
  },
  {
    id: "cpp",
    name: "C++ (GCC)",
    monacoLang: "cpp",
    extension: "cpp",
    defaultCode: `// C++ 14 (GCC 14)
#include <iostream>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::cout << greet("Developer") << std::endl;
    return 0;
}
`,
  },
  {
    id: "java",
    name: "Java (OpenJDK)",
    monacoLang: "java",
    extension: "java",
    defaultCode: `// Java 21 (OpenJDK)
public class Main {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(greet("Developer"));
    }
}
`,
  },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (langId: string) => void;
  disabled?: boolean;
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <label
        htmlFor="language-select"
        style={{
          color: "#888",
          fontSize: "12px",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Language:
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        style={{
          padding: "6px 12px",
          backgroundColor: "#2a2a2a",
          color: "#ffffff",
          border: "1px solid #444",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: "500",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
