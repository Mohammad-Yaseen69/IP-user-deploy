import "./ErrorBoundary.css"
import png from "./assets/tabImg.png"

const BroadcastPage = () => {
    return (
        <div className="broadcast-container">
            <div className="broadcast-div">
                <img src={png} alt="" loading="lazy"    
w                />
                <div className="text-cont">
                    <div>
                        <h1>
                            InstaPay is open on another tab/window.
                        </h1>
                        <p>
                            Please close this tab, or click the button below
                        </p>
                    </div>

                    <button onClick={() => window.location.reload()}>Open here</button>
                </div>
            </div>
        </div>
    )
}

export default BroadcastPage