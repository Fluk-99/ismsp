"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box } from "@mui/material";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

const actions = [
  { icon: "📋", name: "Share" },
  { icon: "🖨️", name: "Export" },
  { icon: "✏️", name: "Edit", path: "Organization_C" }, // ✅ กดแล้วไปที่หน้า Organization_C
];

const OrganizationTable = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("http://192.168.0.119:3000/api/settings/organization");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setOrganizations(data.data); // ใช้ `data.data` เพราะ JSON API ห่อข้อมูลใน key `data`
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return (
    <Box sx={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Organization List
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
                <TableCell>ID</TableCell>
                <TableCell>Organization Name</TableCell>
                <TableCell>Business Type</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizations.length > 0 ? (
                organizations.map((org, index) => (
                  <TableRow key={org._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{org.orgId}</TableCell>
                    <TableCell>{org.name}</TableCell>
                    <TableCell>{org.businessType}</TableCell>
                    <TableCell>{new Date(org.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(org.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No Data Available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* SpeedDial เพิ่มเข้ามา */}
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
            onClick={() => action.path && router.push(action.path)} // ✅ ถ้าเป็นปุ่ม Edit ให้ไปที่หน้า Organization_C
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default OrganizationTable;
