import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, Label, Input } from 'reactstrap';
import { Trash2 } from 'react-feather';
import styles from "./styles/table.module.scss";
import BenConfirmationModal from './ConfirmationModal';

const GroupDetailsModal = ({ isOpen, toggle, heading, data, showAction, deleteMember, setData }) => {
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [memberName, setMemberName] = useState('');
    const [editedGroupName, setEditedGroupName] = useState(heading);
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [memberStatus, setMemberStatus] = useState("")

    useEffect(() => setEditedGroupName(heading), [heading])

    const handleDeleteConfirmation = (groupName, memberName) => {
        setMemberToDelete({ groupName, memberName });
        setIsConfirmationOpen(true);
    };

    const handleDeleteConfirmed = () => {
        if (memberToDelete) {
            const { groupName, memberName } = memberToDelete;
            deleteMember(groupName, memberName);
            setMemberToDelete(null);
        }
        setIsConfirmationOpen(false);
    };

    const handleDeleteMember = (groupName, memberName) => {
        handleDeleteConfirmation(groupName, memberName);
    };

    const handleMemberNameChange = (event) => {
        const value = event.target.value;
        setMemberName(value);
        searchMembers(value);
    };

    const handleUserSelect = (user) => {
        setMemberName(user.name);
        setSearchValue('');
        setMemberStatus(user.status); // Add this line to store the member status
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const newMember = {
            memberName: memberName,
            status: memberStatus, // Use the stored member status value
        };

        // Add the new member to the group data
        setData((prevData) =>
            prevData.map((group) => {
                if (group.groupName === heading) {
                    return {
                        ...group,
                        groupMembers: [...group.groupMembers, newMember],
                    };
                }
                return group;
            })
        );

        setMemberName('');
        setSearchValue('');
        setMemberStatus(''); // Reset the member status after adding the member
    };

    const handleEditGroupName = (event) => {
        event.preventDefault();

        // Update the group name in the data
        setData((prevData) =>
            prevData.map((group) => {
                if (group.groupName === heading) {
                    return {
                        ...group,
                        groupName: editedGroupName,
                    };
                }
                return group;
            })
        );

        toggle(); // Close the modal after saving the changes
    };

    const searchMembers = (value) => {
        setSearchValue(value);
        const dummyData = [
            { id: 1, status: "Instapay", name: "John Doe", email: "john.doe@example.com", phone: "1234567890" },
            { id: 2, status: "Beneficiary", name: "Jane Smith", email: "jane.smith@example.com", phone: "9876543210" },
            { id: 3, status: "Invite", name: "Alice Johnson", email: "alice.johnson@example.com", phone: "5555555555" },
        ];
        const results = dummyData.filter(
            (user) =>
                user.name.toLowerCase().includes(value.toLowerCase()) ||
                user.email.toLowerCase().includes(value.toLowerCase()) ||
                user.phone.includes(value)
        );
        setSearchResults(results);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{showAction ? "Edit Group" : "Group Details"}</ModalHeader>
            <ModalBody>
                {showAction && (
                    <Form onSubmit={handleEditGroupName} style={{ display: "flex", alignItems: "flex-end", gap: ".5rem", marginBottom: "1rem" }}>
                        <div style={{ width: "100%", flex: "1" }}>
                            <Label for="groupName">Edit Group Name</Label>
                            <Input
                                type="text"
                                id="groupName"
                                value={editedGroupName}
                                onChange={(event) => setEditedGroupName(event.target.value)}
                            />
                        </div>
                        <Button type="submit" style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none"
                        }} disabled={!editedGroupName}>Save</Button>
                    </Form>
                )}
                {showAction && (
                    <Form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "flex-end", gap: ".5rem" }}>
                        <div style={{ width: "100%", flex: "1" }}>
                            <Label>Add Members</Label>
                            <div className="search-wrapper">
                                <Input
                                    type="text"
                                    className="form-control"
                                    placeholder='Search User'
                                    id="memberName"
                                    value={memberName}
                                    onChange={handleMemberNameChange}
                                />
                                {searchValue && searchResults.length > 0 && (
                                    <ul className="search-suggestions">
                                        {searchResults.map((user, index) => (
                                            <li key={index} onClick={() => handleUserSelect(user)}>
                                                {user.name} <span>{user.status}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <Button type="submit" style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none"
                        }} disabled={!memberName}>Add</Button>
                    </Form>
                )}

                <div className={styles.table_container}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Members</th>
                                <th>Source</th>
                                {showAction && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.memberName}</td>
                                    <td>{item.status}</td>
                                    {showAction && (
                                        <td>
                                            <Trash2 color="red" cursor="pointer" onClick={() => handleDeleteMember(heading, item.memberName)} />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ModalBody>

            <BenConfirmationModal
                isOpen={isConfirmationOpen}
                toggle={() => setIsConfirmationOpen(false)}
                heading="Confirm Delete"
                message="Are you sure you want to delete this member?"
                onCancel={() => setIsConfirmationOpen(false)}
                onConfirm={handleDeleteConfirmed}
            />
        </Modal>
    );
};

export default GroupDetailsModal;
