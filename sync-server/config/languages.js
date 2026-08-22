const languages = {
    python: {
        name: "Python",
        monacoLang: "python",
        extension: "py",
        filename: "main.py",
        image: "python:3.13-slim",
        command: ["python", "/app/main.py"],
        defaultCode: `# Python 3.13
def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("Developer"))
`,
    },
    javascript: {
        name: "JavaScript (Node)",
        monacoLang: "javascript",
        extension: "js",
        filename: "main.js",
        image: "node:20-slim",
        command: ["node", "/app/main.js"],
        defaultCode: `// JavaScript (Node.js 20)
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));
`,
    },
    cpp: {
        name: "C++ (GCC)",
        monacoLang: "cpp",
        extension: "cpp",
        filename: "main.cpp",
        image: "gcc:14",
        // Note: Compile to /tmp because /tmp is writable tmpfs while /app is mounted read-only (:ro)
        command: ["sh", "-c", "g++ /app/main.cpp -O2 -o /tmp/main && /tmp/main"],
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
    java: {
        name: "Java (OpenJDK 21)",
        monacoLang: "java",
        extension: "java",
        filename: "Main.java",
        image: "openjdk:21-slim",
        // Note: Compile class files to /tmp tmpfs
        command: ["sh", "-c", "javac -d /tmp /app/Main.java && java -cp /tmp Main"],
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
};

module.exports = languages;
