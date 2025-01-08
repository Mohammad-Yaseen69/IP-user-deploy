import { Eye, Edit, Trash2 } from 'react-feather';
import { ToolTip } from '../../AbstractElements';
import { useEffect, useState } from 'react';

const GTItem = (props) => {
    const {
        index,
        group,
        toggleGDM,
        setHeading,
        setEditModal,
        handleDeleteClick,
    } = props



    const [eyeTooltip, setEyeTooltip] = useState(false)
    const [editTooltip, setEditTooltip] = useState(false)
    const [delTooltip, setDelTooltip] = useState(false)

    const ttt = (handler, value) => handler(!value)


    useEffect(() => {
        if (eyeTooltip) {
            setTimeout(() => {
                setEyeTooltip(false)
            }, 2000);
        }
        if (editTooltip) {
            setTimeout(() => {
                setEditTooltip(false)
            }, 2000);
        }
        if (delTooltip) {
            setTimeout(() => {
                setDelTooltip(false)
            }, 2000);
        }
    }, [eyeTooltip, editTooltip, delTooltip])

    return (
        <tr key={index}>
            <td>{group.groupName}</td>
            <td>{group.groupMembers.length}</td>
            <td
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                }}
            >
                <Eye
                    color="#5826f0"
                    size={20}
                    cursor="pointer"
                    onClick={() => {
                        toggleGDM();
                        setHeading(group.groupName);
                        setEditModal(false)
                    }}
                    id={`g-eye-${group.id}`}
                />
                <ToolTip attrToolTip={{ placement: 'top', isOpen: eyeTooltip, target: `g-eye-${group.id}`, toggle: () => ttt(setEyeTooltip, eyeTooltip) }}>
                    View Group Details
                </ToolTip>
                <Edit
                    color="orange"
                    size={20}
                    cursor="pointer"
                    onClick={() => {
                        toggleGDM();
                        setHeading(group.groupName);
                        setEditModal(true)
                    }}
                    id={`g-edit-${group.id}`}
                />
                <ToolTip attrToolTip={{ placement: 'top', isOpen: editTooltip, target: `g-edit-${group.id}`, toggle: () => ttt(setEditTooltip, editTooltip) }}>
                    Edit Group Details
                </ToolTip>
                <Trash2
                    color="red"
                    size={20}
                    cursor="pointer"
                    onClick={() => handleDeleteClick(group.groupName)}
                    id={`g-del-${group.id}`}
                />
                <ToolTip attrToolTip={{ placement: 'top', isOpen: delTooltip, target: `g-del-${group.id}`, toggle: () => ttt(setDelTooltip, delTooltip) }}>
                    Delete Group
                </ToolTip>
            </td>
        </tr>
    )
}

export default GTItem;