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
  { icon: '✏️', name: 'Edit', path: 'InterestedParty_C' }
]

const InterestedParty_V = () => {
  const [interestedParties, setInterestedParties] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchInterestedParties = async () => {
      try {
        const response = await fetch('https://ismsp-backend.onrender.com/api/settings/interested-party')
        if (!response.ok) throw new Error('Failed to fetch data')

        const data = await response.json()
        setInterestedParties(
          data.map(party => ({
            id: party._id,
            organization: party.organization?.name || 'N/A',
            relationships: party.relationships?.map(r => r.name) || [],
            branches: party.branches || [],
            contactNumber: party.contactNumber || 'N/A'
          }))
        )
      } catch (error) {
        console.error('Error fetching interested parties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInterestedParties()
  }, [])

  return (
    <Box sx={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      <Typography variant='h4' align='center' gutterBottom>
        Interested Parties List
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
                <TableCell>Organization</TableCell>
                <TableCell>Relationships</TableCell>
                <TableCell>Branches</TableCell>
                <TableCell>Contact Number</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interestedParties.length > 0 ? (
                interestedParties.map((party, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{party.organization?.name || party.organization || 'N/A'}</TableCell>
                    <TableCell>
                      {party.relationships.length > 0 ? party.relationships.join(', ') : 'N/A'} {/* แสดง name */}
                    </TableCell>
                    <TableCell>
                      {party.branches.length > 0
                        ? party.branches.map(b => `${b.branchName} (${b.address})`).join(', ') // แสดงทั้ง branchName และ address
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{party.contactNumber || 'N/A'}</TableCell>
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

export default InterestedParty_V
