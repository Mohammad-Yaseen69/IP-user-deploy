import "./ErrorBoundary.css"
import png from "./assets/tabImg.png"

const BroadcastPage = () => {
    return (
        <div className="broadcast-container">
            <div className="broadcast-div">
                <img src={png} alt="" />
                <div className="text-cont">
                    <div>
                        <h1>
                            InstaPay is open on another tab/window.
                        </h1>
                        <p>
                            Please close this tab, or close other tabs and then refresh this page.
                        </p>
                    </div>

                    <button>Close this Tab</button>
                </div>
            </div>
        </div>
    )
}

export default BroadcastPage