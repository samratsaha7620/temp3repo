const axios = require("axios");
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button"; // Ensure this is the correct path for your button component
import { Input } from "./ui/input"; // Assuming you have a shadcn Input component


export default function CreateGroup() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupURL: "" // To store S3 URL after upload
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const userId  = localStorage.getItem("userID");
    console.log(userId);
    
    const file = e.target.files[0];
    if (file) {
      try {
        // Request presigned URL from your backend
        const presignedUrlResponse = await axios.post(`http://localhost:3001/api/upload/generate-presigned-url/${userId}`, // Adjusted the URL
          {
            fileName: file.name,
            fileType: file.type,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const {getSignedURL} = presignedUrlResponse.data;
        if (getSignedURL) {
          // Upload file directly to S3
          await axios.put(getSignedURL,file,{
            headers:{
              'Content-Type': file.type,
            }
          })
          const url = new URL(getSignedURL);
          const myFilePath = `${url.origin}${url.pathname}`;

          // Set S3 URL in formData
          setFormData({ ...formData, groupURL: myFilePath });
        } else {
          console.error("Failed to get presigned URL from server");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    setIsSubmitting(true);
    try {
      const response = await axios.post(`http://localhost:3001/api/groups/group/create`,{...formData,userId:localStorage.getItem("userID")}, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.data;
      if (response.ok) {
        
      } else {
        alert(result.error || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Create a New Group</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Enter group name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="block w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Enter group description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Group Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600"
        >
          {isSubmitting ? "Creating..." : "Create Group"}
        </Button>
      </form>
    </div>
  );
}
