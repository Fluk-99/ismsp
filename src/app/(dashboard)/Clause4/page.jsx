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
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";

// Styled component for Accordion component
const Accordion = styled(MuiAccordion)({
  margin: "0 !important",
  borderRadius: 0,
  boxShadow: "none !important",
  border: "1px solid #ddd",
  "&:before": { display: "none" },
});

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  backgroundColor: "#f5f5f5",
  "&.Mui-expanded": { backgroundColor: "#e0e0e0" },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(3),
}));

export default function Page() {
  const [expanded, setExpanded] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  const [swotFields, setSwotFields] = useState({
    strengths: [{ value: "", type: "Internal Factors" }],
    weaknesses: [{ value: "", type: "Internal Factors" }],
    opportunities: [{ value: "", type: "External Factors" }],
    threats: [{ value: "", type: "External Factors" }],
  });

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const handleAddField = (key) => {
    setSwotFields((prev) => ({
      ...prev,
      [key]: [...prev[key], { value: "", type: "Internal Factors" }],
    }));
  };

  const handleRemoveField = (key, index) => {
    setSwotFields((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (key, index, field, value) => {
    setSwotFields((prev) => {
      const updated = [...prev[key]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [key]: updated };
    });
  };

  const toggleEdit = () => {
    setIsEditable(!isEditable);
  };

  const handleSave = () => {
    setIsEditable(false);
    console.log("SWOT Fields:", swotFields);
    alert("Data Saved Successfully!");
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
        Clause 4
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

      {/* Accordion for SWOT Analysis */}
      <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
        <AccordionSummary
          expandIcon={
            <i
              className={expanded === "panel1" ? "tabler-minus" : "tabler-plus"}
            />
          }
        >
          <Typography>SWOT Analysis</Typography>
        </AccordionSummary>

        <AccordionDetails>
          {["strengths", "weaknesses", "opportunities", "threats"].map((key) => (
            <div key={key} style={{ marginBottom: "20px" }}>
              <Typography variant="h6" style={{ marginBottom: "10px" }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Typography>

              {swotFields[key].map((field, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <TextField
                    fullWidth
                    margin="normal"
                    disabled={!isEditable}
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)} Field ${
                      index + 1
                    }`}
                    value={field.value}
                    onChange={(e) =>
                      handleFieldChange(key, index, "value", e.target.value)
                    }
                  />

                  <Select
                    disabled={!isEditable}
                    value={field.type}
                    onChange={(e) =>
                      handleFieldChange(key, index, "type", e.target.value)
                    }
                  >
                    <MenuItem value="Internal Factors">
                      Internal Factors
                    </MenuItem>

                    <MenuItem value="External Factors">
                      External Factors
                    </MenuItem>
                  </Select>

                  {isEditable && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleRemoveField(key, index)}
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
                  onClick={() => handleAddField(key)}
                  style={{ marginTop: "10px" }}
                >
                  Add Field
                </Button>
              )}
            </div>
          ))}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
