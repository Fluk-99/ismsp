"use client";
// React Imports
import { useState, useEffect } from "react";

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
  const [interestedParties, setInterestedParties] = useState([
    { name: "", needOrExpectation: "Needs" },
  ]);
  const [swotFields, setSwotFields] = useState("");

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const handleAddParty = () => {
    setInterestedParties((prev) => [...prev, { name: "", needOrExpectation: "Needs" }]);
  };

  const handleRemoveParty = (index) => {
    setInterestedParties((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePartyChange = (index, field, value) => {
    setInterestedParties((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const toggleEdit = () => {
    setIsEditable(!isEditable);
  };

  const handleSave = () => {
    setIsEditable(false);
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

      {/* SWOT Section */}
      <div style={{ marginBottom: "20px" }}>
        <Typography variant="h6" style={{ marginBottom: "10px" }}>
          SWOT Analysis
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          disabled={!isEditable}
          label="Enter SWOT Analysis"
          value={swotFields}
          onChange={(e) => setSwotFields(e.target.value)}
        />
      </div>

      {/* Interested Parties Section */}
      <div style={{ marginBottom: "20px" }}>
        <Typography variant="h6" style={{ marginBottom: "10px" }}>
          Interested Parties
        </Typography>
        {interestedParties.map((party, index) => (
          <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              fullWidth
              disabled={!isEditable}
              label="Enter Interested Party"
              value={party.name}
              onChange={(e) => handlePartyChange(index, "name", e.target.value)}
            />
            <Select
              disabled={!isEditable}
              value={party.needOrExpectation}
              onChange={(e) => handlePartyChange(index, "needOrExpectation", e.target.value)}
            >
              <MenuItem value="Needs">Needs</MenuItem>
              <MenuItem value="Expectations">Expectations</MenuItem>
            </Select>
            {isEditable && (
              <Button variant="contained" color="secondary" onClick={() => handleRemoveParty(index)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        {isEditable && (
          <Button variant="contained" color="primary" onClick={handleAddParty}>
            Add Party
          </Button>
        )}
      </div>
    </div>
  );
}
