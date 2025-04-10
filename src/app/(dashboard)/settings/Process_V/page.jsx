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
  { icon: '✏️', name: 'Edit', path: 'Process_C' }
]

const Process_V = () => {
  const [processes, setProcesses] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await fetch('https://ismsp-backend.onrender.com/api/settings/process')
        if (!response.ok) throw new Error('Failed to fetch data')

        const result = await response.json()
        if (!Array.isArray(result.data)) throw new Error('Invalid data format')

        console.log('🔎 API Response Received:', result.data)

        const formattedData = result.data.map(process => ({
          processId: process.processId,
          name: process.name,
          details: process.details || 'N/A',
          department: process.department?.name || 'N/A',
          subDepartment:
            process.subDepartment && typeof process.subDepartment === 'object'
              ? process.subDepartment.name || 'N/A'
              : 'N/A',
          soas:
            process.soas?.map(soa => ({
              controlId: soa.controlId,
              controlName: soa.controlName,
              implementationStatus: soa.implementationStatus
            })) || []
        }))

        setProcesses(formattedData)
      } catch (error) {
        console.error('Error fetching Processes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProcesses()
  }, [])

  return (
    <Box sx={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      <Typography variant='h4' align='center' gutterBottom>
        Process List
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
                <TableCell>Process Name</TableCell>
                <TableCell>Details</TableCell> {/* ✅ เพิ่ม Details */}
                <TableCell>Department</TableCell>
                <TableCell>Sub-Department</TableCell>
                <TableCell>SOA Controls</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processes.length > 0 ? (
                processes.map((process, index) => (
                  <TableRow key={process.processId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{process.processId}</TableCell>
                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal', maxWidth: '180px' }}>
                      {process.name}
                    </TableCell>
                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal', maxWidth: '200px' }}>
                      {process.details}
                    </TableCell>
                    <TableCell>{process.department}</TableCell>
                    <TableCell>{process.subDepartment || 'N/A'}</TableCell>
                    <TableCell>
                      {process.soas && process.soas.length > 0 ? (
                        <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {process.soas.map((soa, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                mb: 1,
                                p: 1,
                                borderRadius: 1
                                /*bgcolor:
                                  soa.implementationStatus === 'Partially Implemented'
                                    ? '#fff3e0'
                                    : soa.implementationStatus === 'Fully Implemented'
                                      ? '#e8f5e9'
                                      : '#ffebee'*/
                              }}
                            >
                              <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                                {soa.controlId}
                              </Typography>
                              <Typography variant='body2'>{soa.controlName}</Typography>
                              {/*
                              <Typography
                                variant='caption'
                                sx={{
                                  color:
                                    soa.implementationStatus === 'Partially Implemented'
                                      ? '#f57c00'
                                      : soa.implementationStatus === 'Fully Implemented'
                                        ? '#2e7d32'
                                        : '#c62828'
                                }}
                              >
                                {soa.implementationStatus}
                              </Typography>
                              */}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        'No SOA Controls'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    No Data Available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* SpeedDial Floating Action Button */}
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

export default Process_V
