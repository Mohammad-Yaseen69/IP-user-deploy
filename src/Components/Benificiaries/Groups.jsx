import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import CreateGroupModal from './CreateGroupModal';
import GroupDetailsModal from './GroupDetailsModa';
import styles from "./styles/table.module.scss"
import BenConfirmationModal from './ConfirmationModal';
import GTItem from './GTItem';

const Groups = () => {
    const [showGDM, setShowGDM] = useState(false);
    const [isGroupModal, setIsGroupModal] = useState(false);
    const [heading, setHeading] = useState('');
    const [editModal, setEditModal] = useState(false)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [groupNameToDelete, setGroupNameToDelete] = useState('');
    const [data, setData] = useState([
        {
            id: 1,
            groupName: 'Group 1',
            numberOfMembers: 5,
            groupMembers: [
                { memberName: 'Member 1', status: 'InstaPay' },
                { memberName: 'Member 2', status: 'Beneficiary' },
                { memberName: 'Member 3', status: 'InstaPay' },
                { memberName: 'Member 4', status: 'Beneficiary' },
                { memberName: 'Member 5', status: 'InstaPay' },
            ],
        },
        {
            id: 2,
            groupName: 'Group 2',
            numberOfMembers: 8,
            groupMembers: [
                { memberName: 'Member 1', status: 'Other' },
                { memberName: 'Member 2', status: 'InstaPay' },
                { memberName: 'Member 3', status: 'InstaPay' },
                { memberName: 'Member 4', status: 'Beneficiary' },
                { memberName: 'Member 5', status: 'InstaPay' },
                { memberName: 'Member 6', status: 'Beneficiary' },
                { memberName: 'Member 7', status: 'InstaPay' },
                { memberName: 'Member 8', status: 'Beneficiary' },
            ],
        },
        {
            id: 3,
            groupName: 'Group 3',
            numberOfMembers: 3,
            groupMembers: [
                { memberName: 'Member 1', status: 'Beneficiary' },
                { memberName: 'Member 2', status: 'InstaPay' },
                { memberName: 'Member 3', status: 'Other' },
            ],
        },
    ]);

    const toggleGroupModal = () => setIsGroupModal(!isGroupModal);
    const toggleGDM = () => setShowGDM(!showGDM);

    const deleteGroup = (groupName) => {
        setData((prevData) => prevData.filter((group) => group.groupName !== groupName));
    };

    const handleDeleteClick = (groupName) => {
        setGroupNameToDelete(groupName);
        setShowConfirmationModal(true);
    };

    const handleConfirmDelete = () => {
        deleteGroup(groupNameToDelete);
        setShowConfirmationModal(false);
    };

    const handleCancelDelete = () => {
        setShowConfirmationModal(false);
    };

    const deleteMember = (groupName, memberName) => {
        setData((prevData) =>
            prevData.map((group) => {
                if (group.groupName === groupName) {
                    return {
                        ...group,
                        groupMembers: group.groupMembers.filter((member) => member.memberName !== memberName),
                    };
                }
                return group;
            })
        );
    };

    const createGroup = (groupName, selectedFriends) => {
        const newGroup = {
            groupName: groupName,
            numberOfMembers: selectedFriends.length,
            groupMembers: selectedFriends.map((friend) => ({ memberName: friend.name, status: friend.status })),
        };
        setData((prevData) => [...prevData, newGroup]);
        toggleGroupModal();
    };

    const handleEditGroupName = (groupName, newGroupName) => {
        setData((prevData) =>
            prevData.map((group) => {
                if (group.groupName === groupName) {
                    return {
                        ...group,
                        groupName: newGroupName,
                    };
                }
                return group;
            })
        );
    };

    return (
        <div className="container">
            <div className="d-flex justify-content-end mb-3">
                <Button
                    size="sm"
                    style={{
                        fontSize: '.7rem',
                        background: 'linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)',
                        border: 'none',
                        outline: 'none',
                    }}
                    onClick={toggleGroupModal}
                >
                    Create Group
                </Button>
            </div>
            <div className={styles.table_container}>
                <table className={styles.table} style={{ minWidth: '550px' }}>
                    <thead>
                        <tr>
                            <th>Group Name</th>
                            <th>Number of Members</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((group, index) => (
                            <GTItem
                                key={group.id}
                                index={index}
                                group={group}
                                toggleGDM={toggleGDM}
                                setHeading={setHeading}
                                setEditModal={setEditModal}
                                handleDeleteClick={handleDeleteClick}
                                handleEditGroupName={handleEditGroupName}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <CreateGroupModal modalOpen={isGroupModal} toggleModal={toggleGroupModal} createGroup={createGroup} />
            {
                heading
                &&
                <GroupDetailsModal
                    heading={heading}
                    isOpen={showGDM}
                    toggle={toggleGDM}
                    showAction={editModal}
                    data={data.find((group) => group.groupName === heading)?.groupMembers || []}
                    deleteMember={deleteMember}
                    setData={setData}
                />
            }
            <BenConfirmationModal
                isOpen={showConfirmationModal}
                toggle={handleCancelDelete}
                heading="Confirm"
                message="Are you sure you want to delete the group?"
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default Groups;