"use client";

import { useEffect, useState } from "react";
import { Select, MenuItem, TextField, Button, Typography, Box, CircularProgress, IconButton } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://192.168.0.119:3000/api/settings/interested-party";

const InterestedParty_C = () => {
    const [interestedParties, setInterestedParties] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [relationships, setRelationships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canAdd, setCanAdd] = useState(true);

    useEffect(() => {
        fetchOrganizations();
        fetchRelationships();
        fetchInterestedParties();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await fetch("http://192.168.0.119:3000/api/settings/organization");
            if (!response.ok) throw new Error("Failed to fetch organizations");

            const data = await response.json();
            setOrganizations(data.data);
        } catch (error) {
            console.error("Error fetching organizations:", error);
            toast.error("Failed to fetch organizations.");
        }
    };

    const fetchRelationships = async () => {
        try {
            const response = await fetch("http://192.168.0.119:3000/api/settings/relationship");
            if (!response.ok) throw new Error("Failed to fetch relationships");

            const data = await response.json();
            setRelationships(data.data);
        } catch (error) {
            console.error("Error fetching relationships:", error);
            toast.error("Failed to fetch relationships.");
        }
    };

    const fetchInterestedParties = async () => {
      try {
          const response = await fetch(API_URL);
          if (!response.ok) throw new Error("Failed to fetch data");

          const data = await response.json();
          setInterestedParties(data.map((party) => ({
              id: party._id,
              organization: party.organization?._id || "",
              businessType: party.organization?.businessType || "N/A",
              relationships: party.relationships?.map(r => r.name) || [],
              branches: party.branches || [{ branchName: "", address: "" }],
              contactNumber: party.contactNumber || "",
              isEditable: false,
              isSaved: true,
          })));
      } catch (error) {
          console.error("Error fetching interested parties:", error);
          toast.error("Failed to fetch interested parties.");
      } finally {
          setLoading(false);
      }
  };


    const handleEditToggle = (id) => {
        setInterestedParties((prev) =>
            prev.map((party) => (party.id === id ? { ...party, isEditable: !party.isEditable, isSaved: false } : party))
        );
        setCanAdd(true);
    };

    const handleSaveToAPI = async (id) => {
      const party = interestedParties.find((party) => party.id === id);

      if (!party || !party.organization.trim() || !party.contactNumber.trim()) {
          toast.error("Please fill in all fields before saving!");
          return;
      }

      if (!Array.isArray(party.relationships) || party.relationships.length === 0) {
        toast.error("Please select at least one relationship.");
        return;
    }

      try {
          let url = `${API_URL}/create`;
          let method = "POST";

          let relationshipsIds = party.relationships.map(rel =>
              relationships.find(r => r._id === rel)?._id
          );

          let formattedBranches = party.branches.map(branch => ({
              branchName: branch.branchName || "Unnamed Branch",
              address: branch.address || "Unknown Address"
          }));

          let body = JSON.stringify({
              organizationId: party.organization,
              relationships: party.relationships,
              branches: formattedBranches,
              contactNumber: party.contactNumber,
          });

          if (!party.id.startsWith("temp-")) {
              url = `${API_URL}/${party.id}`;
              method = "PUT";
          }

          const response = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body,
          });

          if (!response.ok) {
              const errorResponse = await response.json();
              console.error("Server Error:", errorResponse);
              throw new Error(`Failed to save interested party: ${errorResponse.message}`);
          }

          toast.success("Interested Party saved successfully!");
          fetchInterestedParties();
          setCanAdd(true);
      } catch (error) {
          toast.error("Failed to save interested party.");
          console.error("Error:", error);
      }
  };

    const handleDeleteInterestedParty = async (partyId) => {
      try {
          const response = await fetch(`${API_URL}/${partyId}`, { method: "DELETE" });
          if (!response.ok) throw new Error(`Failed to delete interested party (${response.status})`);

          toast.success("Interested Party deleted successfully!");
          fetchInterestedParties();
      } catch (error) {
          toast.error("Failed to delete interested party.");
      }
  };

  const handleAddInterestedParty = () => {
      setInterestedParties((prev) => [
          ...prev,
          {
              id: `temp-${Date.now()}`,
              organization: "",
              businessType: "",
              relationships: [],
              branches: [{ branchName: "", address: "" }],
              contactNumber: "",
              isEditable: true,
              isSaved: false,
          },
      ]);
      setCanAdd(false);
  };

  const handleCancelAdd = () => {
      setInterestedParties((prev) => prev.filter((party) => !party.id.startsWith("temp-")));
      setCanAdd(true);
  };

    return (
        <Box sx={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <ToastContainer />

            <Typography variant="h4" align="center" gutterBottom>
                Interested Party Management
            </Typography>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                interestedParties.map((party) => (
                    <Box key={party.id} sx={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>

                        {/* ✅ Organization Dropdown */}
                        <Select
                            fullWidth
                            disabled={!party.isEditable}
                            value={party.organization || ""}
                            onChange={(e) => setInterestedParties((prev) =>
                                prev.map((d) => (d.id === party.id ? { ...d, organization: e.target.value } : d))
                            )}
                        >
                            {organizations.map((org) => (
                                <MenuItem key={org._id} value={org._id}>
                                    {org.name}
                                </MenuItem>
                            ))}
                        </Select>

                        {/* ✅ Business Type */}
                        <TextField
                            fullWidth
                            disabled
                            value={organizations.find(org => org._id === party.organization)?.businessType || "N/A"}
                        />

                        {/* ✅ Relationship Dropdown (Multiple) */}
                        <Select
                            fullWidth
                            multiple
                            disabled={!party.isEditable}
                            value={party.relationships || []} // ✅ ใช้ name แสดงค่า
                            onChange={(e) => setInterestedParties((prev) =>
                                prev.map((d) => (d.id === party.id ? { ...d, relationships: e.target.value } : d))
                            )}
                        >
                            {relationships.map((rel) => (
                                <MenuItem key={rel._id} value={rel.name}> {/* ✅ ใช้ name */}
                                    {rel.name}
                                </MenuItem>
                            ))}
                        </Select>

                        {/* ✅ Contact Number */}
                        <TextField
                            fullWidth
                            label="Contact Number"
                            disabled={!party.isEditable}
                            value={party.contactNumber}
                            onChange={(e) => setInterestedParties((prev) =>
                                prev.map((d) => (d.id === party.id ? { ...d, contactNumber: e.target.value } : d))
                            )}
                        />

                        {/* ✅ Branches (เพิ่ม/ลบได้) */}
                        {/* ✅ Branches (เพิ่ม/ลบได้) */}
                        {party.branches.map((branch, index) => (
                            <Box key={index} sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <TextField
                                    fullWidth
                                    disabled={!party.isEditable}
                                    label={`Branch ${index + 1} Name`}
                                    value={branch.branchName}
                                    onChange={(e) => {
                                        const updatedBranches = [...party.branches];
                                        updatedBranches[index].branchName = e.target.value;
                                        setInterestedParties((prev) =>
                                            prev.map((d) => (d.id === party.id ? { ...d, branches: updatedBranches } : d))
                                        );
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    disabled={!party.isEditable}
                                    label={`Branch ${index + 1} Address`}
                                    value={branch.address}
                                    onChange={(e) => {
                                        const updatedBranches = [...party.branches];
                                        updatedBranches[index].address = e.target.value;
                                        setInterestedParties((prev) =>
                                            prev.map((d) => (d.id === party.id ? { ...d, branches: updatedBranches } : d))
                                        );
                                    }}
                                />
                                <IconButton onClick={() => {
                                    setInterestedParties((prev) =>
                                        prev.map((d) => d.id === party.id ? { ...d, branches: d.branches.filter((_, i) => i !== index) } : d)
                                    );
                                }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}

                        {/* 🔹 ปุ่มเพิ่ม Branch */}
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setInterestedParties((prev) =>
                                    prev.map((d) => d.id === party.id ? { ...d, branches: [...d.branches, { branchName: "", address: "" }] } : d)
                                );
                            }}
                        >
                            Add Branch
                        </Button>


                        <Button variant="contained" color="secondary" onClick={() => handleEditToggle(party.id)}>Edit</Button>
                        <Button variant="contained" color="primary" onClick={() => handleSaveToAPI(party.id)}>Save</Button>
                        <Button variant="contained" color="error" onClick={() => handleDeleteInterestedParty(party.id)}>Delete</Button>

                    </Box>
                ))
            )}

             {canAdd ? (
                <Box sx={{ textAlign: "center", marginTop: "20px" }}>
                    <Button variant="contained" color="success" onClick={handleAddInterestedParty}>
                        Add Interested Party
                    </Button>
                </Box>
            ) : (
                <Box sx={{ textAlign: "center", marginTop: "20px" }}>
                    <Button variant="contained" color="error" onClick={handleCancelAdd}>
                        Cancel Add
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default InterestedParty_C;
