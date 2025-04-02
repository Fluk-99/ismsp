"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://192.168.0.119:3000/api/settings/relationship";

const actions = [
  { icon: "📋", name: "Share" },
  { icon: "🖨️", name: "Export" },
  { icon: "✏️", name: "Edit", path: "Relationship_C" },
];

const Relationship_V = () => {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Fetched Data:", responseData); // Debugging log

        // ✅ Ensure API response format matches expectations
        const formattedData =
          responseData.data?.map((rel) => ({
            relationshipId: rel._id, // ✅ ใช้ `_id` แทน `relationshipId`
            name: rel.name || "Unknown",
          })) || [];

        setRelationships(formattedData);
      } catch (error) {
        console.error("Error fetching Relationships:", error.message);
        toast.error("Failed to fetch Relationships.");
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, []);

  return (
    <Box sx={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
      <ToastContainer />

      <Typography variant="h4" align="center" gutterBottom>
        Relationship List
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relationships.length > 0 ? (
                relationships.map((relationship, index) => (
                  <TableRow key={relationship.relationshipId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{relationship.name}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No Data Available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Floating SpeedDial Actions */}
      <SpeedDial
        ariaLabel="SpeedDial openIcon example"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={<span>{action.icon}</span>}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => action.path && router.push(action.path)}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default Relationship_V;
