import "./ErrorBoundary.css"

const BroadcastPage = () => {
    return (
        <div className="error-container">
            <div className="error-box">
                <h1>InstaPay is open on another tab/window.</h1>
                <p>Please close this tab, or close other tabs and then refresh this page.</p>
                <button onClick={() => window.close()} className="error-button">Close This Tab</button>
            </div>
        </div>
    )
}

export default BroadcastPage