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
  { icon: '✏️', name: 'Edit', path: 'InformationClassification_C' } //
]

const InformationClassification_V = () => {
  const [classifications, setClassifications] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        const response = await fetch('https://ismsp-backend.onrender.com/api/settings/information-classification')
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()

        console.log('Fetched Data:', data)

        setClassifications(data.data || [])
      } catch (error) {
        console.error('Error fetching classifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClassifications()
  }, [])

  return (
    <Box sx={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      <Typography variant='h4' align='center' gutterBottom>
        Information Classification List
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
                <TableCell>Label</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classifications.length > 0 ? (
                classifications.map((cls, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{cls.label}</TableCell>
                    <TableCell>{cls.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align='center'>
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

export default InformationClassification_V
