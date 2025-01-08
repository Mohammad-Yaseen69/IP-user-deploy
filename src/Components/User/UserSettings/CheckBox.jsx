
const CheckBox = ({ enabled }) => {
    return (
        <div style={{
            background: enabled ? "#5926f063" : "white",
            height: '20px',
            width: '40px',
            border: '2px solid #5926f0',
            borderRadius: '100px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
        }}>
            <div style={{
                height: '18px',
                width: '18px',
                backgroundColor: '#5926f0',
                position: 'absolute',
                borderRadius: '100%',
                left: enabled ? "18px" : 0
            }}></div>
        </div>
    )
}

export default CheckBox