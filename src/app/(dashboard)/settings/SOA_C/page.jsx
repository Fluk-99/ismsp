'use client'

import { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, Select, MenuItem } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const API_URL = 'https://ismsp-backend.onrender.com/api/settings/soa'

const SOA_C = () => {
  const [soas, setSoas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSOAs()
  }, [])

  const fetchSOAs = async () => {
    try {
      const response = await fetch(API_URL)
      const data = await response.json()
      setSoas(data.data)
    } catch (error) {
      toast.error('Failed to fetch SOAs.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/updateStatus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ implementationStatus: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update')

      setSoas(prev => prev.map(soa => (soa.soaId === id ? { ...soa, implementationStatus: newStatus } : soa)))

      toast.success('Implementation Status updated!')
    } catch (error) {
      toast.error('Failed to update status.')
    }
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <ToastContainer />
      <Typography variant='h4' align='center'>
        SOA Management
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        soas.map(soa => (
          <Box key={soa._id} sx={{ margin: '10px 0' }}>
            <Typography>
              {soa.controlId} - {soa.controlName}
            </Typography>
            <Select value={soa.implementationStatus} onChange={e => handleStatusChange(soa.soaId, e.target.value)}>
              <MenuItem value='Not Implemented'>Not Implemented</MenuItem>
              <MenuItem value='Partially Implemented'>Partially Implemented</MenuItem>
              <MenuItem value='Fully Implemented'>Fully Implemented</MenuItem>
            </Select>
          </Box>
        ))
      )}
    </Box>
  )
}

export default SOA_C
