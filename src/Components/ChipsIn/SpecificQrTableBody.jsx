import { useSelector } from "react-redux";
import ChipsInTableColumn from "./ChipsInTableColumn";

const SpecificQrTableBody = ({ ssit, sti }) => {
    const items = useSelector(state => state.chipsInRequests).filter(item => item.type === "Specific")

    return (
        <tbody>
            {
                items.length > 0
                    ?
                    items.map(item => {
                        return <ChipsInTableColumn key={item.id} item={item} ssit={ssit} sti={sti} />
                    })
                    :
                    "No Results"
            }
        </tbody>
    );
};

export default SpecificQrTableBody;