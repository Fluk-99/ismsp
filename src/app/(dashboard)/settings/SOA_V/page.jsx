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
  Chip,
  Box
} from '@mui/material'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const API_URL = 'http://192.168.0.119:3000/api/settings/soa'

const actions = [
  { icon: '📋', name: 'Share' },
  { icon: '🖨️', name: 'Export' },
  { icon: '✏️', name: 'Edit', path: 'SOA_C' }
]

const SOA_V = () => {
  const [soas, setSoas] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSOAs = async () => {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error(`Failed to fetch SOA data. Status: ${response.status}`)

        const result = await response.json()
        console.log('Fetched SOA Data:', result)

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Invalid data format')
        }

        const formattedData = result.data.map(soa => ({
          soaId: soa.soaId,
          controlId: soa.controlId,
          controlName: soa.controlName,
          controlDescription: soa.controlDescription || 'No description available',
          implementationStatus: soa.implementationStatus || 'Not Implemented'
        }))

        setSoas(formattedData)
      } catch (error) {
        console.error('Error fetching SOAs:', error)
        toast.error('Failed to fetch SOAs.')
      } finally {
        setLoading(false)
      }
    }

    fetchSOAs()
  }, [])

  const renderImplementationStatus = status => {
    let color
    switch (status) {
      case 'Fully Implemented':
        color = 'success'
        break
      case 'Partially Implemented':
        color = 'warning'
        break
      case 'Not Implemented':
        color = 'error'
        break
      default:
        color = 'default'
    }
    return <Chip label={status} color={color} size='small' />
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      <ToastContainer />

      <Typography variant='h4' align='center' gutterBottom>
        Statement of Applicability (SOA) List
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 3, marginTop: '20px' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ fontWeight: 'bold' }}>
                <TableCell>Number</TableCell>
                <TableCell>Control ID</TableCell>
                <TableCell>Control Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Implementation Status</TableCell> {/* ✅ เพิ่ม Status */}
              </TableRow>
            </TableHead>
            <TableBody>
              {soas.length > 0 ? (
                soas.map((soa, index) => (
                  <TableRow key={soa.soaId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{soa.controlId}</TableCell>
                    <TableCell>{soa.controlName}</TableCell>
                    <TableCell>{soa.controlDescription}</TableCell>
                    <TableCell>{renderImplementationStatus(soa.implementationStatus)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
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

export default SOA_V
