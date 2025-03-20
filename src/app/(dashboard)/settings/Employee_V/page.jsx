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

        console.log("Fetched Employees:", data.data); // Debugging

        // ✅ ใช้ชื่อ department และ subDepartment แทน ID
        const processedEmployees = data.data.map(emp => ({
          ...emp,
          department: emp.department?.name || "N/A", // ✅ ใช้ชื่อแผนก
          subDepartment: emp.subDepartment?.name || "N/A", // ✅ ใช้ชื่อหน่วยย่อย
        }));

        setEmployees(processedEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

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
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Department</TableCell> {/* ✅ เพิ่มคอลัมน์ Department */}
                <TableCell>Sub-Department</TableCell> {/* ✅ เพิ่มคอลัมน์ Sub-Department */}
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
                    <TableCell>{emp.department }</TableCell> {/* ✅ แก้ไขให้ตรวจสอบค่า */}
                    <TableCell>{emp.subDepartment}</TableCell> {/* ✅ แก้ไขให้ตรวจสอบค่า */}
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
            onClick={() => action.path && router.push(action.path)}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default Employee_V;
