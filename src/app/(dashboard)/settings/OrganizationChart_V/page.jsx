"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Typography, Box, CircularProgress } from "@mui/material";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

// โหลด react-d3-tree แบบ dynamic (เพราะใช้ window object)
const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

const actions = [
  { icon: "📋", name: "Share" },
  { icon: "🖨️", name: "Export" },
  { icon: "✏️", name: "Edit", path: "OrganizationChart_C" },
];

const API_URL = "http://192.168.0.119:3000/api/settings/organization-chart";

const OrganizationChart_V = () => {
  const [organizationCharts, setOrganizationCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizationCharts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        console.log("API Response:", data); // ✅ Debug API Response

        if (Array.isArray(data.data)) {
          setOrganizationCharts(data.data); // ✅ ใช้ `data.data` แทน `data`
        } else {
          console.error("Unexpected API response:", data);
          setOrganizationCharts([]);
        }
      } catch (error) {
        console.error("Error fetching organization charts:", error);
        setOrganizationCharts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationCharts();
  }, []);

  // ✅ ปรับโครงสร้าง tree ให้รวมทุก `chartId` เป็น subtree ของ Root
  const treeData = {
    name: "Organization Charts",
    children: Array.isArray(organizationCharts)
      ? organizationCharts.map(chart => ({
          name: chart.chartId,
          attributes: { "Report To": chart.reportToReference?.name || "N/A" },
          children: chart.departments?.map(dept => ({
            name: dept.department?.name || "N/A",
            attributes: { "Department": dept.department?.name || "N/A" },
            children: dept.employees?.map(emp => ({
              name: emp.employee?.name || "N/A",
              attributes: {
                "Position": emp.employee?.position || "N/A",
                "Sub-Department": emp.subDepartment || "N/A"
              }
            })) || [],
          })) || [],
        }))
      : [],
  };

  return (
    <Box sx={{ padding: "20px", maxWidth: "100%", height: "80vh", position: "relative" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Organization Chart Tree View
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: "100%" }}>
          {treeData.children.length > 0 ? (
            <Tree
              data={treeData}
              orientation="vertical"
              translate={{ x: window.innerWidth / 2, y: 100 }}
              nodeSize={{ x: 200, y: 150 }}
              separation={{ siblings: 1, nonSiblings: 2 }}
              zoomable
              collapsible
            />
          ) : (
            <Typography align="center" sx={{ marginTop: "20px" }}>
              No Data Available
            </Typography>
          )}
        </Box>
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

export default OrganizationChart_V;
