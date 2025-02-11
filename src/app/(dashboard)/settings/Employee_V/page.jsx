"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box, Button } from "@mui/material";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

const actions = [
  { icon: "📋", name: "Share" },
  { icon: "🖨️", name: "Export" },
  { icon: "✏️", name: "Edit", path: "Employee_C" }, //
];

const Employee_V = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://192.168.0.119:3000/api/settings/employee");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setEmployees(data.data); // ใช้ `data.data` เพราะ JSON API ห่อข้อมูลใน key `data`
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleDeleteEmployee = async (employeeId) => {
    try {
      if (!employeeId) {
        throw new Error("Invalid employee ID.");
      }

      console.log(`Deleting employee with ID: ${employeeId}`);

      const response = await fetch(`http://192.168.0.119:3000/api/settings/employee/${employeeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to delete employee. Status: ${response.status}, Error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Delete Success:", result);

      setEmployees((prev) => prev.filter((emp) => emp.employeeId !== employeeId));
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  return (
    <Box sx={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Employee List
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Number</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((emp, index) => (
                  <TableRow key={emp.employeeId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{emp.employeeId}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="error" onClick={() => handleDeleteEmployee(emp.employeeId)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
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
            onClick={() => action.path && router.push(action.path)}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default Employee_V;
