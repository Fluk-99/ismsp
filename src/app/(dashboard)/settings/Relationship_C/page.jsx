"use client";

import { useEffect, useState } from "react";
import { TextField, Button, Typography, Box, CircularProgress } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// API Endpoint หลัก
const API_URL = "http://192.168.0.119:3000/api/settings/relationship";

const Relationship_C = () => {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canAdd, setCanAdd] = useState(true);
  const [isAdding, setIsAdding] = useState(false); // ✅ เช็คว่ากำลังเพิ่มอยู่ไหม

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        const formattedData = data.data.map((relationship) => ({
          id: relationship._id,
          name: relationship.name,
          isEditable: false,
          isSaved: true,
        }));

        setRelationships(formattedData);
      } catch (error) {
        console.error("Error fetching Relationships:", error);
        toast.error("Failed to fetch Relationships.");
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, []);

  const handleEditToggle = (id) => {
    setRelationships((prev) =>
      prev.map((relationship) =>
        relationship.id === id ? { ...relationship, isEditable: !relationship.isEditable, isSaved: false } : relationship
      )
    );
    setCanAdd(true);
  };

  const handleSaveToAPI = async (id) => {
    const relationship = relationships.find((relationship) => relationship.id === id);

    if (!relationship || relationship.name.trim() === "") {
        toast.error("Please enter the relationship name before saving!", { position: "top-right", autoClose: 3000 });
        return;
    }

    try {
        const isNew = id.startsWith("temp-");
        const method = isNew ? "POST" : "PUT";
        const url = isNew ? `${API_URL}/create` : `${API_URL}/${id}`;

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: relationship.name }),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        toast.success("Relationship saved successfully!", { position: "top-right", autoClose: 3000 });

        // ✅ อัปเดต ID หลังจากบันทึกสำเร็จ
        const data = await response.json();
        setRelationships((prev) =>
            prev.map((rel) => (rel.id === id ? { ...rel, id: data.data._id, isEditable: false, isSaved: true } : rel))
        );

        setIsAdding(false); // ✅ ปิดโหมดเพิ่ม
        setCanAdd(true);
    } catch (error) {
        console.error("Error saving Relationship:", error);
        toast.error("Failed to save Relationship. Please try again.");
    }
};


  const handleAddRelationship = () => {
    const newRelationship = {
      id: `temp-${Date.now()}`,
      name: "",
      isEditable: true,
      isSaved: false,
    };
    setRelationships((prev) => [...prev, newRelationship]);
    setCanAdd(false);
    setIsAdding(true); // ✅ ตั้งค่าให้กำลังเพิ่ม Relationship อยู่
  };

  const handleCancelAdd = () => {
    setRelationships((prev) => prev.slice(0, -1)); // ✅ ลบ Relationship ล่าสุดออก
    setCanAdd(true);
    setIsAdding(false); // ✅ ปิดโหมดการเพิ่ม
  };

  const handleDeleteRelationship = async (relationshipId) => {
    try {
      if (!relationshipId) {
        throw new Error("Invalid Relationship ID.");
      }

      console.log(`Deleting Relationship with ID: ${relationshipId}`);

      const response = await fetch(`${API_URL}/${relationshipId}`, { method: "DELETE" });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete Relationship. Status: ${response.status}, Error: ${errorText}`);
      }

      setRelationships((prev) => prev.filter((relationship) => relationship.id !== relationshipId));
      toast.success("Relationship deleted successfully!", { position: "top-right", autoClose: 3000 });

    } catch (error) {
      console.error("Error deleting Relationship:", error);
      toast.error(error.message || "Failed to delete Relationship. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <ToastContainer />

      <Typography variant="h4" align="center" gutterBottom>
        Relationship Management
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </Box>
      ) : (
        relationships.map((relationship) => (
          <Box
            key={relationship.id}
            sx={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              marginTop: "30px",
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              label="Relationship Name"
              value={relationship.name}
              disabled={!relationship.isEditable}
              onChange={(e) =>
                setRelationships((prev) =>
                  prev.map((d) => (d.id === relationship.id ? { ...d, name: e.target.value } : d))
                )
              }
            />

            <Button variant="contained" color="secondary" onClick={() => handleEditToggle(relationship.id)}>
              {relationship.isEditable ? "Cancel" : "Edit"}
            </Button>

            <Button variant="contained" color="primary" onClick={() => handleSaveToAPI(relationship.id)}>
              Save
            </Button>

            <Button variant="contained" color="error" onClick={() => handleDeleteRelationship(relationship.id)}>
              Delete
            </Button>
          </Box>
        ))
      )}

      {canAdd && (
        <Box sx={{ textAlign: "center", marginTop: "20px" }}>
          <Button variant="contained" color="success" onClick={handleAddRelationship}>
            Add Relationship
          </Button>
        </Box>
      )}

      {isAdding && (
        <Box sx={{ textAlign: "center", marginTop: "10px" }}>
          <Button variant="contained" color="error" onClick={handleCancelAdd}>
            Cancel Add
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Relationship_C;
