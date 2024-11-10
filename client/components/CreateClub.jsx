import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function CreateClub() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coverImage: "",
    bannerURL: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e, fieldName) => {
    const userId = localStorage.getItem("userID");
    const file = e.target.files[0];
    if (file) {
      try {
        const presignedUrlResponse = await axios.post(`http://localhost:3001/api/upload/generate-presigned-url/${userId}`, 
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
        const { getSignedURL } = presignedUrlResponse.data;
        if (getSignedURL) {
          await axios.put(getSignedURL, file, {
            headers: {
              'Content-Type': file.type,
            }
          });
          const url = new URL(getSignedURL);
          const filePath = `${url.origin}${url.pathname}`;
          setFormData({ ...formData, [fieldName]: filePath });
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
    setIsSubmitting(true);
    try {
      const response = await axios.post(`http://localhost:3001/api/clubs/club/create`, 
        { ...formData, userId: localStorage.getItem("userID") },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if(response.status === 200){
        alert("club created successfully!");
        router.push("/clubs");
      }
    } catch (error) {
      console.error("Error creating club:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Create a New Club</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter Club name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter club description"
            className="block w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Cover Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "coverImage")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Banner Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "bannerURL")}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600"
        >
          {isSubmitting ? "Creating..." : "Create Club"}
        </Button>
      </form>
    </div>
  );
}
