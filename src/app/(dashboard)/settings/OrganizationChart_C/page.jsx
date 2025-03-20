"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Select,
  MenuItem,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.119:3000/api";
const ENDPOINTS = {
  ORGANIZATION_CHART: `${API_URL}/settings/organization-chart`,
  EMPLOYEE: `${API_URL}/settings/employee`,
  DEPARTMENT: `${API_URL}/settings/department`,
};

const OrganizationChart_C = () => {
  const [state, setState] = useState({
    organizationCharts: [],
    employees: [],
    departments: [],
    loading: true,
    canAdd: true
  });

const fetchAllData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
        const [chartsRes, employeesRes, departmentsRes] = await Promise.all([
            fetch(ENDPOINTS.ORGANIZATION_CHART),
            fetch(ENDPOINTS.EMPLOYEE),
            fetch(ENDPOINTS.DEPARTMENT)
        ]);

        const [charts, employees, departments] = await Promise.all([
            chartsRes.json(),
            employeesRes.json(),
            departmentsRes.json()
        ]);

        console.log("Fetched Data:", { charts, employees, departments }); // 🛠 Debug ข้อมูล API
        console.log("Departments Structure:", JSON.stringify(departments, null, 2)); // 🛠 Debug `departments`
        console.log("Employees Structure:", JSON.stringify(employees, null, 2)); // 🛠 Debug `employees`

        setState(prev => ({
            ...prev,
            organizationCharts: charts.data.map(formatChartData),
            employees: employees.data || [],
            departments: departments.data || [],
            loading: false
        }));
    } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
        setState(prev => ({ ...prev, loading: false }));
    }
}, []);

useEffect(() => {
  fetchAllData();
}, [fetchAllData]);


const formatChartData = (chart) => {
  console.log("Raw chart data:", chart);
  return {
      id: chart.chartId,
      reportToType: chart.reportToType,
      reportToReference: chart.reportToReference?._id || "",
      departments: chart.departments?.map(dept => ({
          department: dept.department?._id || "",
          employees: dept.employees?.map(emp => ({
              employee: emp.employee?._id || "",
              subDepartment: emp.subDepartment || "",  // เปลี่ยนจาก subDeptId เป็น subDepartment
              jobDetails: emp.jobDetails || ""
          })) || []
      })) || []
  };
};


  const handleAddChart = () => {
    const newChart = {
      id: `TEMP-${Date.now()}`,
      reportToType: "Employee",
      reportToReference: "",
      departments: [{
        department: "",
        employees: []
      }],
      isEditable: true
    };

    setState(prev => ({
      ...prev,
      organizationCharts: [...prev.organizationCharts, newChart],
      canAdd: false
    }));
  };

  const handleSaveChart = async (chartId) => {
    const chart = state.organizationCharts.find(c => c.id === chartId);
    if (!validateChart(chart)) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Debug: เช็คค่าก่อนส่งไป API
    console.log("Saving Chart Data:", JSON.stringify(chart, null, 2));

    try {
      const formattedData = {
        reportToType: chart.reportToType,
        reportToReference: chart.reportToReference,
        departments: chart.departments.map(dept => ({
          department: dept.department,
          employees: dept.employees.map(emp => ({
            employee: emp.employee,
            subDepartment: emp.subDepartment && emp.subDepartment !== "No Sub-Department" ? emp.subDepartment : null,  // ✅ แก้ให้เช็ค subDepartment ก่อนส่ง
            jobDetails: emp.jobDetails
          }))
        }))
      };

      console.log("Formatted Data before Saving:", JSON.stringify(formattedData, null, 2)); // 🛠 Debug

      let response;
      if (chart.id.startsWith('TEMP-')) {
        response = await fetch(`${ENDPOINTS.ORGANIZATION_CHART}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData)
        });
      } else {
        // Find the actual chart ID if needed
        let updateId = chart.id;
        if (chart.id.startsWith('CHRT')) {
          const findRes = await fetch(`${ENDPOINTS.ORGANIZATION_CHART}/find-by-chartId/${chart.id}`);
          if (findRes.ok) {
            const foundChart = await findRes.json();
            updateId = foundChart.data._id;
          }
        }

        response = await fetch(`${ENDPOINTS.ORGANIZATION_CHART}/${updateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData)
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save chart');
      }

      toast.success('Organization chart saved successfully');
      fetchAllData(); // Refresh data after successful save

    } catch (error) {
      console.error('Error saving chart:', error);
      toast.error(error.message || 'Failed to save organization chart');
    }
};


  const handleUpdateChart = (chartId, field, value, deptIndex = null, empIndex = null) => {
    setState(prev => ({
      ...prev,
      organizationCharts: prev.organizationCharts.map(chart => {
        if (chart.id !== chartId) return chart;

        const updatedDepartments = [...chart.departments];

        if (deptIndex === null) {
          return { ...chart, [field]: value };
        }

        if (empIndex === null) {
          updatedDepartments[deptIndex] = {
            ...updatedDepartments[deptIndex],
            [field]: value
          };
        } else {
          const employeeData = updatedDepartments[deptIndex].employees[empIndex];

          updatedDepartments[deptIndex].employees[empIndex] = {
            ...employeeData,
            employee: employeeData.employee,  // ✅ คงค่า Employee ไว้
            subDepartment: employeeData.subDepartment || "No Sub-Department",  // ✅ ดึง Sub-Department เดิม ถ้าไม่มีให้ใช้ "No Sub-Department"
            [field]: value
          };
        }

        return { ...chart, departments: updatedDepartments };
      })
    }));
  };

  const handleUpdateEmployee = (chartId, deptIndex, empIndex, employeeId) => {
    const selectedEmployee = state.employees.find(emp => emp._id === employeeId);

    setState(prev => ({
      ...prev,
      organizationCharts: prev.organizationCharts.map(chart => {
        if (chart.id !== chartId) return chart;

        const updatedDepartments = [...chart.departments];

        updatedDepartments[deptIndex].employees[empIndex] = {
          ...updatedDepartments[deptIndex].employees[empIndex],
          employee: selectedEmployee?._id || "",
          subDepartment: selectedEmployee?.subDepartment?.subDeptId || null, // ✅ เปลี่ยนจาก name เป็น subDeptId
          jobDetails: updatedDepartments[deptIndex].employees[empIndex].jobDetails || ""
        };

        return { ...chart, departments: updatedDepartments };
      })
    }));
  };


  const handleAddDepartment = (chartId) => {
    setState(prev => ({
      ...prev,
      organizationCharts: prev.organizationCharts.map(chart =>
        chart.id === chartId ? {
          ...chart,
          departments: [...chart.departments, {
            department: "",
            employees: []
          }]
        } : chart
      )
    }));
  };

  const handleAddEmployee = (chartId, deptIndex) => {
    setState(prev => ({
      ...prev,
      organizationCharts: prev.organizationCharts.map(chart =>
        chart.id === chartId ? {
          ...chart,
          departments: chart.departments.map((dept, idx) =>
            idx === deptIndex ? {
              ...dept,
              employees: [...dept.employees, {
                employee: "",
                subDepartment: "",
                jobDetails: ""
              }]
            } : dept
          )
        } : chart
      )
    }));
  };

  const handleRemoveDepartment = (chartId, deptIndex) => {
    setState(prev => ({
      ...prev,
      organizationCharts: prev.organizationCharts.map(chart =>
        chart.id === chartId ? {
          ...chart,
          departments: chart.departments.filter((_, idx) => idx !== deptIndex)
        } : chart
      )
    }));
  };

  const handleRemoveEmployee = (chartId, deptIndex, empIndex) => {
    setState(prev => ({
      ...prev,
      organizationCharts: prev.organizationCharts.map(chart =>
        chart.id === chartId ? {
          ...chart,
          departments: chart.departments.map((dept, idx) =>
            idx === deptIndex ? {
              ...dept,
              employees: dept.employees.filter((_, eIdx) => eIdx !== empIndex)
            } : dept
          )
        } : chart
      )
    }));
  };

  const handleRemoveChart = async (chartId) => {
    console.log("Trying to delete chart:", chartId); // ✅ Debug

    if (chartId.startsWith("TEMP-")) {
        console.log("Removing Temporary Chart:", chartId);
        setState(prev => ({
            ...prev,
            organizationCharts: prev.organizationCharts.filter(chart => chart.id !== chartId),
            canAdd: true
        }));
        return;
    }

    try {
        const response = await fetch(`${ENDPOINTS.ORGANIZATION_CHART}/${chartId}`, {
            method: "DELETE",
        });

        const result = await response.json();
        console.log("Delete Response:", result); // ✅ Debug

        if (!response.ok) throw new Error(result.message || "Failed to delete chart");

        toast.success("Chart deleted successfully");
        fetchAllData(); // รีเฟรชข้อมูลใหม่
    } catch (error) {
        console.error("Error deleting chart:", error);
        toast.error(error.message || "Failed to delete chart");
    }
};


  const validateChart = (chart) => {
    if (!chart || !chart.reportToType || !chart.reportToReference) return false;
    if (!chart.departments.length) return false;

    return chart.departments.every(dept => {
      if (!dept.department) return false;
      return dept.employees.every(emp =>
        emp.employee && emp.jobDetails
      );
    });
  };

  if (state.loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom align="center">
        Organization Chart Management
      </Typography>

      {state.organizationCharts.map(chart => (
        <Box key={chart.id} sx={{ mb: 4, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Select
              fullWidth
              value={chart.reportToType}
              onChange={(e) => handleUpdateChart(chart.id, "reportToType", e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Employee">Employee</MenuItem>
              <MenuItem value="Department">Department</MenuItem>
            </Select>

            <Select
              fullWidth
              value={chart.reportToReference}
              onChange={(e) => handleUpdateChart(chart.id, "reportToReference", e.target.value)}
            >
              {chart.reportToType === "Employee"
                ? state.employees.map(emp => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.name}
                    </MenuItem>
                  ))
                : state.departments.map(dept => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))
              }
            </Select>
          </Box>

          {chart.departments.map((dept, deptIndex) => (
            <Box key={deptIndex} sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Select
                  fullWidth
                  value={dept.department}
                  onChange={(e) => handleUpdateChart(chart.id, "department", e.target.value, deptIndex)}
                >
                  {state.departments.map(d => (
                    <MenuItem key={d._id} value={d._id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
                <IconButton onClick={() => handleRemoveDepartment(chart.id, deptIndex)}>
                  <DeleteIcon />
                </IconButton>
              </Box>

              {dept.employees.map((emp, empIndex) => (
                <Box key={empIndex} sx={{ ml: 2, mb: 2, p: 2, bgcolor: "white", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Select
                    fullWidth
                    value={emp.employee}
                    onChange={(e) => handleUpdateEmployee(chart.id, deptIndex, empIndex, e.target.value)}
                  >
                    {state.employees.map(e => (
                      <MenuItem key={e._id} value={e._id}>
                        {e.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <Select
                      fullWidth
                      value={emp.subDepartment || ""}
                      onChange={(e) => handleUpdateChart(chart.id, "subDepartment", e.target.value || null, deptIndex, empIndex)}
                  >
                      <MenuItem value="">No Sub-Department</MenuItem>
                      {state.departments
                          .find(d => d._id === dept.department)?.subDepartments
                          ?.map(sub => (
                              <MenuItem key={sub.subDeptId} value={sub.subDeptId}>
                                  {sub.name}
                              </MenuItem>
                          )) || []
                      }
                  </Select>

                    <IconButton onClick={() => handleRemoveEmployee(chart.id, deptIndex, empIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    label="Job Details"
                    value={emp.jobDetails}
                    onChange={(e) => handleUpdateChart(chart.id, "jobDetails", e.target.value, deptIndex, empIndex)}
                  />
                </Box>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={() => handleAddEmployee(chart.id, deptIndex)}
                sx={{ mt: 1 }}
              >
                Add Employee
              </Button>
            </Box>
          ))}

<Box sx={{ mt: 2, display: "flex", gap: 2 }}>
    <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => handleAddDepartment(chart.id)}
    >
        Add Department
    </Button>
    <Button
        variant="contained"
        onClick={() => handleSaveChart(chart.id)}
    >
        Save Chart
    </Button>

    {/* ปุ่มลบทั้ง Chart */}
    <Button
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => handleRemoveChart(chart.id)}
    >
        Delete Chart
    </Button>
</Box>

        </Box>
      ))}

      {state.canAdd && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddChart}
          sx={{ mt: 2 }}
        >
          Add New Chart
        </Button>
      )}
      {!state.canAdd && (
    <Button
        variant="outlined"
        color="secondary"
        onClick={handleCancelAddChart}
        sx={{ mt: 2, ml: 2 }}
    >
        Cancel Add
    </Button>
)}

    </Box>
  );
};

export default OrganizationChart_C;
