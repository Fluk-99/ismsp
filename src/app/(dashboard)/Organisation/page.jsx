"use client"; //
// React Imports
import { useState } from "react";

// MUI Imports
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const companyTypes = [
  "Corporation",
  "Partnership",
  "Sole Proprietorship",
  "Cooperative",
  "Registered Business",
  "Unregistered Business",
  "Manufacturing",
  "Service",
  "Retail/Wholesale",
  "Technology",
  "Construction",
  "Logistics",
  "Local Business",
  "National Business",
  "International Business",
  "Non-Profit Organization",
  "Government-Owned Enterprise",
  "Joint Venture",
];

export default function SettingsPage() {
  const [isEditable, setIsEditable] = useState(false);

  const [companyName, setCompanyName] = useState("");

  const [companyType, setCompanyType] = useState(companyTypes[0]);

  const [employees, setEmployees] = useState([{ id: "ID001", name: "", position: "" }]);

  const [departments, setDepartments] = useState([{ id: "DEP001", name: "" }]);

  const [organizationChart, setOrganizationChart] = useState([
    { employee: "", reportTo: "", type: "Personal" },
  ]);

  const toggleEdit = () => {
    setIsEditable(!isEditable);
  };

  const handleSave = () => {
    setIsEditable(false);

    console.log("Company Name:", companyName);

    console.log("Company Type:", companyType);

    console.log("Employees:", employees);

    console.log("Departments:", departments);

    console.log("Organization Chart:", organizationChart);

    alert("Data Saved Successfully!");
  };

  const handleRemoveEmployee = (index) => {
    setEmployees((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveDepartment = (index) => {
    setDepartments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveOrgChart = (index) => {
    setOrganizationChart((prev) => prev.filter((_, i) => i !== index));
  };

  const generateNewId = (items, prefix) => {
    const lastId = items.length > 0 ? items[items.length - 1].id : `${prefix}000`;
    const newIdNumber = parseInt(lastId.replace(prefix, "")) + 1;

    return `${prefix}${newIdNumber.toString().padStart(3, "0")}`;
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <Typography
        variant="h4"
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        Organization Information
      </Typography>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          onClick={toggleEdit}
          style={{ marginRight: "10px" }}
        >
          {isEditable ? "Cancel" : "Edit"}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!isEditable}
        >
          Save
        </Button>
      </div>

      {/* Company Name and Type */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <TextField
          fullWidth
          disabled={!isEditable}
          label="Enter Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <Select
          fullWidth
          disabled={!isEditable}
          value={companyType}
          onChange={(e) => setCompanyType(e.target.value)}
        >
          {companyTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </div>

      {/* Employees */}
      <div style={{ marginBottom: "20px" }}>
        <Typography variant="h6" style={{ marginBottom: "10px" }}>
          Employees
        </Typography>
        {employees.map((employee, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "10px",
              alignItems: "center",
            }}
          >
            <TextField
              style={{ width: "20%" }}
              disabled
              label="ID"
              value={employee.id}
            />

            <TextField
              fullWidth
              disabled={!isEditable}
              label={`Employee ${index + 1} Name`}
              value={employee.name}
              onChange={(e) =>
                setEmployees((prev) => {
                  console.log(`GGGGG`)
                  const updated = [...prev];
                  updated[index].name = e.target.value;
                  console.log(updated)
                  return updated;
                })
              }
            />

            <TextField
              fullWidth
              disabled={!isEditable}
              label={`Employee ${index + 1} Position`}
              value={employee.position}
              onChange={(e) =>
                setEmployees((prev) => {
                  const updated = [...prev];
                  updated[index].position = e.target.value;

                  return updated;
                })
              }
            />

            {isEditable && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleRemoveEmployee(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        {isEditable && (
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              setEmployees((prev) => [
                ...prev,
                { id: generateNewId(prev, "ID"), name: "", position: "" },
              ])
            }
            style={{ marginTop: "10px" }}
          >
            Add Employee
          </Button>
        )}
      </div>

      {/* Departments */}
      <div style={{ marginBottom: "20px" }}>
        <Typography variant="h6" style={{ marginBottom: "10px" }}>
          Departments
        </Typography>
        {departments.map((department, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "10px",
              alignItems: "center",
            }}
          >
            <TextField
              style={{ width: "20%" }}
              disabled
              label="ID"
              value={department.id}
            />

            <TextField
              fullWidth
              disabled={!isEditable}
              label={`Department ${index + 1} Name`}
              value={department.name}
              onChange={(e) =>
                setDepartments((prev) => {
                  const updated = [...prev];
                  updated[index].name = e.target.value;

                  return updated;
                })
              }
            />

            {isEditable && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleRemoveDepartment(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        {isEditable && (
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              setDepartments((prev) => [
                ...prev,
                { id: generateNewId(prev, "DEP"), name: "" },
              ])
            }
            style={{ marginTop: "10px" }}
          >
            Add Department
          </Button>
        )}
      </div>
    </div>
  );
}
