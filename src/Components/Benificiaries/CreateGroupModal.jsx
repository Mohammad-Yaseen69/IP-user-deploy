import React, { useState } from "react";
import { X } from "react-feather";
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "./Search.css"

const CreateGroupModal = ({ modalOpen, toggleModal, createGroup }) => {
    const [groupName, setGroupName] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const handleSearchChange = (event) => {
        const value = event.target.value;
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

    const handleUserSelect = (user) => {
        setSelectedFriends(prev => [{ name: user.name, id: user.id, status: user.status }, ...prev]);
        setSearchValue("");
    };

    const clearSelectedFriend = (id) => {
        const filtered = selectedFriends.filter(item => item.id !== id)
        setSelectedFriends(filtered);
    };

    const handleCreateGroup = () => {
        createGroup(groupName, selectedFriends);
        setGroupName("");
        setSelectedFriends([]);
    };

    return (
        <Modal isOpen={modalOpen} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>Creating Group</ModalHeader>
            <ModalBody style={{
                height: searchValue ? "300px" : "fit-content"
            }}>
                <FormGroup>
                    <Label>Group Name</Label>
                    <Input type="text" placeholder="Enter group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>Add Friends</Label>
                    <div className="search-wrapper">
                        <Input
                            type="text"
                            placeholder="Search friends"
                            value={searchValue}
                            onChange={handleSearchChange}
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
                        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                            {selectedFriends.length > 0 && selectedFriends.map((item) => (
                                <div className="selected-user">
                                    {item.name}
                                    <span className="clear-button" onClick={() => clearSelectedFriend(item.id)}>
                                        <X size={16} cursor={"pointer"} />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button
                    color="primary"
                    onClick={handleCreateGroup}
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                    }}
                >
                    Create Group
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default CreateGroupModal;