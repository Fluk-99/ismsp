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

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <Button variant="contained" color="secondary" onClick={toggleEdit} style={{ marginRight: "10px" }}>
          {isEditable ? "Cancel" : "Edit"}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={!isEditable}>
          Save
        </Button>
      </div>

      {/* Company Details */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <TextField
          fullWidth
          disabled={!isEditable}
          label="Company Name"
          value={data.companyName}
          onChange={(e) => setData((prev) => ({ ...prev, companyName: e.target.value }))}
        />
        <Select
          fullWidth
          disabled={!isEditable}
          value={data.companyType}
          onChange={(e) => setData((prev) => ({ ...prev, companyType: e.target.value }))}
        >
          {companyTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </div>

      {/* Departments Section */}
      <Section
        title="Departments"
        isEditable={isEditable}
        data={data.departments}
        onAdd={() =>
          setData((prev) => ({
            ...prev,
            departments: [...prev.departments, { id: `DEP${prev.departments.length + 1}`, name: "" }]
          }))
        }
        onRemove={(index) => handleRemoveItem("departments", index)}
        renderItem={(department, index) => (
          <>
            <TextField style={{ width: "20%" }} disabled label="ID" value={department.id} />
            <TextField
              fullWidth
              disabled={!isEditable}
              label={`Department ${index + 1} Name`}
              value={department.name}
              onChange={(e) => {
                const updated = [...data.departments];
                updated[index].name = e.target.value;
                setData((prev) => ({ ...prev, departments: updated }));
              }}
            />
          </>
        )}
      />

      {/* Employees Section */}
      <Section
        title="Employees"
        isEditable={isEditable}
        data={data.employees}
        onAdd={() =>
          setData((prev) => ({
            ...prev,
            employees: [...prev.employees, { id: `ID${prev.employees.length + 1}`, name: "", position: "" }]
          }))
        }
        onRemove={(index) => handleRemoveItem("employees", index)}
        renderItem={(employee, index) => (
          <>
            <TextField style={{ width: "20%" }} disabled label="ID" value={employee.id} />
            <TextField
              fullWidth
              disabled={!isEditable}
              label={`Employee ${index + 1} Name`}
              value={employee.name}
              onChange={(e) => {
                const updated = [...data.employees];
                updated[index].name = e.target.value;
                setData((prev) => ({ ...prev, employees: updated }));
              }}
            />
            <TextField
              fullWidth
              disabled={!isEditable}
              label={`Employee ${index + 1} Position`}
              value={employee.position}
              onChange={(e) => {
                const updated = [...data.employees];
                updated[index].position = e.target.value;
                setData((prev) => ({ ...prev, employees: updated }));
              }}
            />
          </>
        )}
      />

      {/* Organization Chart Section */}
      <Section
        title="Organization Chart"
        isEditable={isEditable}
        data={data.orgChart}
        onAdd={() =>
          setData((prev) => ({
            ...prev,
            orgChart: [...prev.orgChart, { department: "", reportsTo: "", type: "Personal" }]
          }))
        }
        onRemove={(index) => handleRemoveItem("orgChart", index)}
        renderItem={(entry, index) => (
          <>
            <TextField
              fullWidth
              disabled={!isEditable}
              label="Department Name"
              value={entry.department}
              onChange={(e) => {
                const updated = [...data.orgChart];
                updated[index].department = e.target.value;
                setData((prev) => ({ ...prev, orgChart: updated }));
              }}
            />
            <Typography style={{ padding: "10px" }}>Report To</Typography>
            <Select
              fullWidth
              disabled={!isEditable}
              value={entry.reportsTo}
              onChange={(e) => {
                const updated = [...data.orgChart];
                updated[index].reportsTo = e.target.value;
                setData((prev) => ({ ...prev, orgChart: updated }));
              }}
            >
              {[...data.employees, ...data.departments].map((option) => (
                <MenuItem key={option.id} value={option.name}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              fullWidth
              disabled={!isEditable}
              value={entry.type}
              onChange={(e) => {
                const updated = [...data.orgChart];
                updated[index].type = e.target.value;
                setData((prev) => ({ ...prev, orgChart: updated }));
              }}
            >
              <MenuItem value="Personal">Personal</MenuItem>
              <MenuItem value="Department">Department</MenuItem>
            </Select>
          </>
        )}
      />
    </div>
  );
}
