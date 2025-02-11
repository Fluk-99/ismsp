"use client";

import { useState, useEffect } from "react";
import { Typography, TextField, Button, Select, MenuItem } from "@mui/material";

// Separate third-party imports from local imports
import Section from "@/components/Section"; // Local component import

const companyTypes = [
  "Corporation", "Partnership", "Sole Proprietorship", "Cooperative", "Registered Business",
  "Unregistered Business", "Manufacturing", "Service", "Retail/Wholesale", "Technology",
  "Construction", "Logistics", "Local Business", "National Business", "International Business",
  "Non-Profit Organization", "Government-Owned Enterprise", "Joint Venture",
];

export default function SettingsPage() {
  const [isEditable, setIsEditable] = useState(false);
  const [data, setData] = useState({
    companyName: "",
    companyType: companyTypes[0],
    departments: [{ id: "DEP001", name: "" }],
    employees: [{ id: "ID001", name: "", position: "" }],
    orgChart: [{ department: "", reportsTo: "", type: "Personal" }]
  });

  useEffect(() => {
    const storedData = localStorage.getItem("organizationData");
    if (storedData) {
      try {
        setData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing localStorage:", error);
        localStorage.removeItem("organizationData");
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem("organizationData", JSON.stringify(data));
    }
  }, [data]);

  const toggleEdit = () => setIsEditable(!isEditable);
  const handleSave = () => {
    setIsEditable(false);
    alert("Data Saved Successfully!");
  };

  const handleRemoveItem = (type, index) => {
    setData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Organization Information
      </Typography>
    </div>
  );
}
