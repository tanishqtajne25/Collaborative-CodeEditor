function Sidebar() {
    return (
        <div
            style={{
                width: "250px", // constant size
                backgroundColor: "#1e1e1e",
                color: "white",
                padding: "16px",
                borderRight: "1px solid #333"
            }}
        >

            <h3>Explore</h3>

            <ul>
                <li>main.js</li>
                <li>utils.js</li>    
            </ul>    
        </div>
    )
}

export default Sidebar