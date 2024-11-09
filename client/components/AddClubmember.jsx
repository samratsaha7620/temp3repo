"use client"
import React from 'react'
import { Button } from './ui/button'

const AddClubmember = () => {
  const handleAddMember = async () => {
    try {
      const response = await axios.post(`http://localhost:3001/api/clubs/club/${clubId}/user/add`, {
        userId:localStorage.getItem("userID"),
      });
      if (response.ok) {
        alert("Member added successfully!");
      } else {
        alert("Failed to add member.");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("There was an error adding the member.");
    }
  };
  return (
    <div>
      <Button onClick={handleAddMember}>
        add club member
      </Button>
    </div>
  )
}

export default AddClubmember
