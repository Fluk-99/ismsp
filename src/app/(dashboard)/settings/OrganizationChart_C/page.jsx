'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Typography, Box, CircularProgress, useTheme } from '@mui/material'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'

// โหลด react-d3-tree แบบ dynamic (เพราะใช้ window object)
const Tree = dynamic(() => import('react-d3-tree'), { ssr: false })

const actions = [
  { icon: '📋', name: 'Share' },
  { icon: '🖨️', name: 'Export' },
  { icon: '✏️', name: 'Edit', path: 'OrganizationChart_C' }
]

const API_URL = 'https://ismsp-backend.onrender.com/api/settings/organization-chart'
const DEPARTMENTS_API_URL = 'https://ismsp-backend.onrender.com/api/settings/department' // เพิ่ม API URL สำหรับดึงข้อมูลแผนก

const OrganizationChart_V = () => {
  const theme = useTheme() // เพิ่ม theme เพื่อดึงค่าสี primary และ secondary
  const [organizationCharts, setOrganizationCharts] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูลพร้อมกันทั้งแผนภูมิองค์กรและข้อมูลแผนก
        const [chartsResponse, departmentsResponse] = await Promise.all([fetch(API_URL), fetch(DEPARTMENTS_API_URL)])

        if (!chartsResponse.ok) throw new Error('Failed to fetch organization charts')
        if (!departmentsResponse.ok) throw new Error('Failed to fetch departments')

        const chartsData = await chartsResponse.json()
        const departmentsData = await departmentsResponse.json()

        console.log('Organization Charts API Response:', chartsData)
        console.log('Departments API Response:', departmentsData)

        if (Array.isArray(chartsData.data)) {
          setOrganizationCharts(chartsData.data)
        } else {
          console.error('Unexpected organization charts API response:', chartsData)
          setOrganizationCharts([])
        }

        if (Array.isArray(departmentsData.data)) {
          setDepartments(departmentsData.data)
        } else {
          console.error('Unexpected departments API response:', departmentsData)
          setDepartments([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setOrganizationCharts([])
        setDepartments([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ฟังก์ชันสำหรับค้นหาชื่อของ Sub-Department จาก ID
  const getSubDepartmentName = (deptId, subDeptId) => {
    if (!subDeptId) return 'N/A'

    const department = departments.find(dept => dept._id === deptId)
    if (!department || !department.subDepartments) return 'N/A'

    const subDept = department.subDepartments.find(sub => sub.subDeptId === subDeptId)
    return subDept ? subDept.name : 'N/A'
  }

  // ปรับโครงสร้าง tree ให้รวมทุก `chartId` เป็น subtree ของ Root และแสดงชื่อ Sub-Department แทน ID
  const treeData = {
    name: 'Organization Charts',
    children: Array.isArray(organizationCharts)
      ? organizationCharts.map(chart => ({
          name: chart.chartId,
          attributes: { 'Report To': chart.reportToReference?.name || 'N/A' },
          children:
            chart.departments?.map(dept => ({
              name: dept.department?.name || 'N/A',
              attributes: { Department: dept.department?.name || 'N/A' },
              children:
                dept.employees?.map(emp => ({
                  name: emp.employee?.name || 'N/A',
                  attributes: {
                    Position: emp.employee?.position || 'N/A',
                    'Sub-Department': getSubDepartmentName(dept.department?._id, emp.subDepartment),
                    'Job Details': emp.jobDetails || 'N/A' // เพิ่ม Job Details
                  }
                })) || []
            })) || []
        }))
      : []
  }

  // Custom node renderer สำหรับ react-d3-tree ที่ใช้สี primary และ secondary
  const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => {
    // กำหนดสีตาม level ของโหนด
    let nodeColor
    let textColor

    if (nodeDatum.name === 'Organization Charts') {
      // Root node - ใช้สี primary จาก theme
      nodeColor = theme.palette.primary.main
      textColor = theme.palette.primary.main
    } else if (nodeDatum.children && nodeDatum.children.length > 0) {
      // Department or chart node - ใช้สี secondary จาก theme
      nodeColor = theme.palette.secondary.main
      textColor = theme.palette.secondary.main
    } else {
      // Employee node (leaf) - ใช้สีเขียว
      nodeColor = theme.palette.success.main
      textColor = theme.palette.success.main
    }

    return (
      <g onClick={toggleNode}>
        <circle r={15} fill={nodeColor} stroke='none' />
        <text fill={textColor} strokeWidth='0' x='20' y='0' style={{ fontSize: '0.9em', fontWeight: 'bold' }}>
          {nodeDatum.name}
        </text>
        {nodeDatum.attributes && (
          <foreignObject width='250' height='160' x='20' y='10'>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '8px',
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '0.8em',
                border: 'none'
              }}
            >
              {Object.entries(nodeDatum.attributes).map(([key, value], i) => (
                <div key={i} style={{ margin: '3px 0' }}>
                  <strong style={{ color: theme.palette.text.secondary }}>{key}:</strong> {value}
                </div>
              ))}
            </div>
          </foreignObject>
        )}
      </g>
    )
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '100%', height: '80vh', position: 'relative' }}>
      <Typography variant='h4' align='center' gutterBottom>
        Organization Chart Tree View
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: '100%' }}>
          {treeData.children.length > 0 ? (
            <Tree
              data={treeData}
              orientation='vertical'
              translate={{ x: window.innerWidth / 2, y: 100 }}
              nodeSize={{ x: 300, y: 200 }} // เพิ่มขนาดโหนดให้มีพื้นที่มากขึ้น
              separation={{ siblings: 1.5, nonSiblings: 2 }} // เพิ่มระยะห่างระหว่างโหนด
              zoomable
              collapsible
              renderCustomNodeElement={renderCustomNodeElement}
            />
          ) : (
            <Typography align='center' sx={{ marginTop: '20px' }}>
              No Data Available
            </Typography>
          )}
        </Box>
      )}

      {/* SpeedDial เพิ่มเข้ามา */}
      <SpeedDial
        ariaLabel='SpeedDial example'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        FabProps={{
          sx: {
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }
        }}
      >
        {actions.map(action => (
          <SpeedDialAction
            key={action.name}
            icon={<span>{action.icon}</span>}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => action.path && router.push(action.path)}
            FabProps={{
              sx: {
                bgcolor: theme.palette.background.paper
              }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  )
}

export default OrganizationChart_V
