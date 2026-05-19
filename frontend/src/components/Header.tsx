function Header() {
    return (
        <div
        style={{
            height: "60px",
            backgroundColor: "#111",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid #333"
        }}
        >
            <h2>Collaborative Code Editor</h2>

            <button
                style={{
                    padding: "10px 16px",
                    cursor: "pointer"
                }}
            >
                Run Code
            </button>
        </div>
    )
}

export default Header