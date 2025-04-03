'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Box
} from '@mui/material'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'

const actions = [
  { icon: '📋', name: 'Share' },
  { icon: '🖨️', name: 'Export' },
  { icon: '✏️', name: 'Edit', path: 'Department_C' } //
]

const Department_V = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('https://ismsp-backend.onrender.com/api/settings/department')
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()
        setDepartments(data.data) // ใช้ `data.data` เพราะ JSON API ห่อข้อมูลใน key `data`
      } catch (error) {
        console.error('Error fetching departments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  return (
    <Box sx={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      <Typography variant='h4' align='center' gutterBottom>
        Department List
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Department Name</TableCell>
                <TableCell>Sub-Departments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length > 0 ? (
                departments.map((dept, index) => (
                  <TableRow key={dept.deptId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{dept.deptId}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>
                      {dept.subDepartments?.length > 0 ? dept.subDepartments.map(sub => sub.name).join(', ') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align='center'>
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
        ariaLabel='SpeedDial openIcon example'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map(action => (
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
  )
}

export default Department_V
