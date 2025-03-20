'use client'
import { useState, useEffect } from 'react'
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
  Chip,
  Alert,
  Box,
  CircularProgress
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function InterestedPartiesManagement() {
  const [interestedParties, setInterestedParties] = useState([])
  const [fullInterestedParties, setFullInterestedParties] = useState([])
  const [selectedParty, setSelectedParty] = useState(null)
  const [selectedFullParty, setSelectedFullParty] = useState(null)
  const [needsExpectations, setNeedsExpectations] = useState([])
  const [form, setForm] = useState({
    type: '',
    description: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Base API URL
  const API_BASE_URL = 'http://192.168.0.119:3000/api'

  useEffect(() => {
    fetchInterestedParties()
  }, [])

  const fetchInterestedParties = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/settings/interested-party`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const result = await response.json()
      console.log('API Interested Parties Response:', result)

      if (result && Array.isArray(result)) {
        setInterestedParties(result)
      } else if (result && Array.isArray(result.data)) {
        setInterestedParties(result.data)
      } else {
        setInterestedParties([])
        console.warn('No valid data format received from API')
      }
    } catch (error) {
      console.error('Error fetching interested parties:', error)
      setError('Failed to load interested parties. Please try again.')
      setInterestedParties([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllFullInterestedParties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/4COTO/fullInterested-parties`)

      if (!response.ok) {
        throw new Error(`Error fetching FullInterestedParties: ${response.status}`)
      }

      const result = await response.json()
      console.log('All FullInterestedParties:', result)
      setFullInterestedParties(result)
      return result
    } catch (error) {
      console.error('Error fetching all FullInterestedParties:', error)
      return []
    }
  }

  // Special debug function to identify the correct FullInterestedParty
  const debugFullInterestedParties = async () => {
    try {
      console.log('Debugging FullInterestedParties...')

      // Fetch all InterestedParties
      const ipResponse = await fetch(`${API_BASE_URL}/settings/interested-party`)
      const interestedPartiesData = await ipResponse.json()
      const ipData = Array.isArray(interestedPartiesData.data) ? interestedPartiesData.data : interestedPartiesData
      console.log('All InterestedParties:', ipData)

      // Fetch all FullInterestedParties
      const fipResponse = await fetch(`${API_BASE_URL}/4COTO/fullInterested-parties`)
      const fullInterestedPartiesData = await fipResponse.json()
      console.log('All FullInterestedParties:', fullInterestedPartiesData)

      // Fetch all NeedsExpectations
      const neResponse = await fetch(`${API_BASE_URL}/4COTO/needsExpectations`)
      const needsExpectationsData = await neResponse.json()
      const neData = Array.isArray(needsExpectationsData.data) ? needsExpectationsData.data : needsExpectationsData
      console.log('All NeedsExpectations:', neData)

      // For each FullInterestedParty, list its NeedsExpectations
      fullInterestedPartiesData.forEach(fip => {
        const matchingNEs = neData.filter(ne => {
          const neFullPartyId =
            typeof ne.fullInterestedParty === 'string' ? ne.fullInterestedParty : ne.fullInterestedParty?._id
          return neFullPartyId === fip._id
        })

        console.log(
          `FullInterestedParty ${fip._id} (InterestedParty: ${fip.interestedParty?._id || fip.interestedParty}) has ${matchingNEs.length} NeedsExpectations:`,
          matchingNEs
        )
      })
    } catch (error) {
      console.error('Debug error:', error)
    }
  }

  const findOrCreateFullInterestedParty = async interestedPartyId => {
    // First fetch all existing FullInterestedParties
    try {
      console.log('Finding FullInterestedParty for InterestedParty:', interestedPartyId)

      // Debug information to help diagnose issues
      await debugFullInterestedParties()

      // Get all FullInterestedParties
      const response = await fetch(`${API_BASE_URL}/4COTO/fullInterested-parties`)

      if (!response.ok) {
        throw new Error(`Error fetching FullInterestedParties: ${response.status}`)
      }

      const allFullParties = await response.json()
      console.log('Response from FullInterestedParties endpoint:', allFullParties)

      // Try to find the one matching our InterestedParty
      const matchingFullParty = allFullParties.find(fp => {
        if (!fp.interestedParty) return false

        const fpInterestedPartyId = typeof fp.interestedParty === 'string' ? fp.interestedParty : fp.interestedParty._id

        return fpInterestedPartyId === interestedPartyId
      })

      if (matchingFullParty) {
        console.log('Found existing FullInterestedParty:', matchingFullParty)
        setSelectedFullParty(matchingFullParty)
        setFullInterestedParties(allFullParties)
        return matchingFullParty
      }

      // If no matching FullInterestedParty exists, create one
      console.log('No matching FullInterestedParty found, creating one...')
      const newFullParty = await createFullInterestedParty(interestedPartyId)

      // Update our local fullInterestedParties state
      if (newFullParty) {
        setFullInterestedParties([...allFullParties, newFullParty])
      }

      return newFullParty
    } catch (error) {
      console.error('Error in findOrCreateFullInterestedParty:', error)
      setError('Failed to find or create FullInterestedParty. Please try again.')
      return null
    }
  }

  const createFullInterestedParty = async interestedPartyId => {
    try {
      console.log('Creating new FullInterestedParty for:', interestedPartyId)
      const response = await fetch(`${API_BASE_URL}/4COTO/fullInterested-parties/create-with-needs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interestedPartyId,
          needsExpectations: [] // Start with empty array
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create full interested party: ${response.status}`)
      }

      const result = await response.json()
      console.log('Created new Full Interested Party:', result)

      // Update our local state with the new FullInterestedParty
      const newFullParty = result.fullInterestedParty || result.data || result
      setSelectedFullParty(newFullParty)

      // Add to our local list of FullInterestedParties
      setFullInterestedParties(prev => [...prev, newFullParty])

      return newFullParty
    } catch (error) {
      console.error('Error creating full interested party:', error)
      setError('Failed to create association for Interested Party. Please try again.')
      return null
    }
  }

  const fetchNeedsExpectations = async fullPartyId => {
    if (!fullPartyId) return

    setLoading(true)
    setError(null)
    setNeedsExpectations([]) // Clear previous data

    try {
      console.log('Fetching Needs/Expectations for FullInterestedParty:', fullPartyId)

      // First try the direct approach - get the needsExpectations from the fullInterestedParty document
      const fullPartyResponse = await fetch(`${API_BASE_URL}/4COTO/fullInterested-parties/${fullPartyId}`)

      if (fullPartyResponse.ok) {
        const fullPartyData = await fullPartyResponse.json()
        console.log('FullInterestedParty details:', fullPartyData)

        // Check if needsExpectations is populated in the response
        if (
          fullPartyData &&
          fullPartyData.needsExpectations &&
          Array.isArray(fullPartyData.needsExpectations) &&
          fullPartyData.needsExpectations.length > 0 &&
          typeof fullPartyData.needsExpectations[0] === 'object'
        ) {
          console.log('Using populated needsExpectations from response')
          setNeedsExpectations(fullPartyData.needsExpectations)
          return
        }
      }

      // If we can't get the data from the FullInterestedParty directly, try the NeedsExpectations endpoints
      console.log('Trying to query NeedsExpectations directly')

      // Try both endpoint formats
      try {
        // Try camelCase endpoint
        const response = await fetch(`${API_BASE_URL}/4COTO/needs-expectations`)

        if (!response.ok) {
          throw new Error('camelCase endpoint failed')
        }

        const result = await response.json()
        console.log('All needsExpectations (camelCase):', result)

        // Filter only the ones for this specific fullInterestedParty
        let filteredData = []
        if (result && Array.isArray(result.data)) {
          filteredData = result.data.filter(item => {
            const itemFullPartyId =
              typeof item.fullInterestedParty === 'string' ? item.fullInterestedParty : item.fullInterestedParty?._id
            return itemFullPartyId === fullPartyId
          })
        } else if (Array.isArray(result)) {
          filteredData = result.filter(item => {
            const itemFullPartyId =
              typeof item.fullInterestedParty === 'string' ? item.fullInterestedParty : item.fullInterestedParty?._id
            return itemFullPartyId === fullPartyId
          })
        }

        console.log('Filtered needsExpectations for this FullInterestedParty:', filteredData)
        setNeedsExpectations(filteredData)
      } catch (error) {
        // If camelCase endpoint fails, try hyphen endpoint
        console.log('camelCase endpoint failed, trying hyphen endpoint')

        const response = await fetch(`${API_BASE_URL}/4COTO/needs-expectations`)

        if (!response.ok) {
          throw new Error(`Error fetching Needs/Expectations: ${response.status}`)
        }

        const result = await response.json()
        console.log('All needsExpectations (hyphen):', result)

        // Filter only the ones for this specific fullInterestedParty
        let filteredData = []
        if (result && Array.isArray(result.data)) {
          filteredData = result.data.filter(item => {
            const itemFullPartyId =
              typeof item.fullInterestedParty === 'string' ? item.fullInterestedParty : item.fullInterestedParty?._id
            return itemFullPartyId === fullPartyId
          })
        } else if (Array.isArray(result)) {
          filteredData = result.filter(item => {
            const itemFullPartyId =
              typeof item.fullInterestedParty === 'string' ? item.fullInterestedParty : item.fullInterestedParty?._id
            return itemFullPartyId === fullPartyId
          })
        }

        console.log('Filtered needsExpectations for this FullInterestedParty:', filteredData)
        setNeedsExpectations(filteredData)
      }
    } catch (error) {
      console.error('Error fetching needs/expectations:', error)
      setError('Failed to load needs/expectations. Please try again.')
      setNeedsExpectations([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectParty = async event => {
    const partyId = event.target.value
    const selected = interestedParties.find(p => p._id === partyId)

    if (selected) {
      setSelectedParty(selected)
      // Reset other selections
      setNeedsExpectations([])
      setForm({
        type: '',
        description: ''
      })
      setIsEditing(false)
      setSelectedFullParty(null)

      console.log('Selected InterestedParty:', selected)

      // Find or create the corresponding FullInterestedParty
      setLoading(true)
      const fullParty = await findOrCreateFullInterestedParty(selected._id)
      setLoading(false)

      if (fullParty) {
        // Fetch Needs/Expectations for this FullInterestedParty
        await fetchNeedsExpectations(fullParty._id)
      }
    }
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    // Validate form
    if (!form.type || !form.description) {
      setError('Please fill in all fields')
      return
    }

    if (!selectedParty || !selectedFullParty) {
      setError('Please select an Interested Party first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        // Update existing needs/expectation - try both API endpoints
        try {
          // First try with needsExpectations (camelCase) format
          const response = await fetch(`${API_BASE_URL}/4COTO/needs-expectations/${form._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: form.type,
              description: form.description
            })
          })

          if (!response.ok) {
            throw new Error('First endpoint failed')
          }
        } catch (error) {
          console.log('First endpoint failed, trying alternative format...')

          // If first format fails, try needs-expectations (hyphen) format
          const response = await fetch(`${API_BASE_URL}/4COTO/needs-expectations/${form._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: form.type,
              description: form.description
            })
          })

          if (!response.ok) {
            throw new Error(`Failed to update data: ${response.status}`)
          }
        }
      } else {
        // Add new needs/expectation - try both API endpoint formats
        try {
          // First try with needsExpectations (camelCase) format
          const response = await fetch(`${API_BASE_URL}/4COTO/needs-expectations/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: form.type,
              description: form.description,
              fullInterestedPartyId: selectedFullParty._id
            })
          })

          if (!response.ok) {
            throw new Error('First endpoint failed')
          }
        } catch (error) {
          console.log('First endpoint failed, trying alternative format...')

          // If first format fails, try needs-expectations (hyphen) format
          const response = await fetch(`${API_BASE_URL}/4COTO/needs-expectations/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: form.type,
              description: form.description,
              fullInterestedPartyId: selectedFullParty._id
            })
          })

          if (!response.ok) {
            throw new Error(`Failed to save data: ${response.status}`)
          }
        }
      }

      // Reset form and fetch updated data
      await fetchNeedsExpectations(selectedFullParty._id)

      setForm({
        type: '',
        description: ''
      })

      setIsEditing(false)
    } catch (error) {
      console.error('Error saving needs/expectations:', error)
      setError('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = ne => {
    setForm({
      _id: ne._id,
      type: ne.type,
      description: ne.description
    })
    setIsEditing(true)
  }

  const handleDelete = async id => {
    if (!id || !selectedFullParty) return

    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try both endpoint formats
      try {
        // First try with needsExpectations (camelCase) format
        const response = await fetch(`${API_BASE_URL}/4COTO/needs-expectations/${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('First endpoint failed')
        }
      } catch (error) {
        console.log('First endpoint failed, trying alternative format...')

        // If first format fails, try needs-expectations (hyphen) format
        const response = await fetch(`${API_BASE_URL}/4COTO/needs-expectations/${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error(`Failed to delete data: ${response.status}`)
        }
      }

      // Fetch updated data after successful deletion
      await fetchNeedsExpectations(selectedFullParty._id)
    } catch (error) {
      console.error('Error deleting needs/expectations:', error)
      setError('Failed to delete. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Cancel edit mode
  const handleCancel = () => {
    setIsEditing(false)
    setForm({
      type: '',
      description: ''
    })
  }

  return (
    <div className='p-10 max-w-4xl mx-auto rounded-lg shadow-lg'>
      <h2 className='text-xl font-bold text-center mb-6'>Interested Parties & Needs/Expectations</h2>

      {error && <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-md'>{error}</div>}

      {/* Interested Party Selection */}
      <div className='mb-4'>
        <label className='block mb-2'>เลือก Interested Party</label>
        <FormControl fullWidth variant='outlined'>
          <Select
            value={selectedParty ? selectedParty._id : ''}
            onChange={handleSelectParty}
            disabled={loading}
            displayEmpty
          >
            <MenuItem value='' disabled>
              เลือก Interested Party
            </MenuItem>
            {interestedParties.length > 0 ? (
              interestedParties.map(party => (
                <MenuItem key={party._id} value={party._id}>
                  {party.organization?.name || 'Unknown'}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>ไม่มีข้อมูล</MenuItem>
            )}
          </Select>
        </FormControl>
      </div>

      {/* Display relationships of selected party */}
      {selectedParty && selectedParty.relationships && selectedParty.relationships.length > 0 && (
        <div className='mb-4'>
          <div className='mb-2'>ความสัมพันธ์:</div>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedParty.relationships.map((rel, index) => (
              <Chip key={index} label={typeof rel === 'object' ? rel.name : rel} color='primary' variant='outlined' />
            ))}
          </Box>
        </div>
      )}

      {/* Loading indicator when fetching data */}
      {loading && (
        <div className='flex justify-center my-4'>
          <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
        </div>
      )}

      {/* Needs/Expectations Form */}
      {selectedParty && selectedFullParty && (
        <div className='mt-6 p-4 border rounded-lg'>
          <h3 className='text-lg font-semibold mb-4'>{isEditing ? 'แก้ไข' : 'เพิ่ม'} Needs/Expectations</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block mb-2'>ประเภท</label>
              <FormControl fullWidth variant='outlined'>
                <Select
                  value={form.type}
                  onChange={e => handleChange('type', e.target.value)}
                  disabled={loading}
                  displayEmpty
                >
                  <MenuItem value='' disabled>
                    เลือกประเภท
                  </MenuItem>
                  <MenuItem value='Need'>Need</MenuItem>
                  <MenuItem value='Expectation'>Expectation</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div>
              <label className='block mb-2'>รายละเอียด</label>
              <TextField
                fullWidth
                variant='outlined'
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                disabled={loading}
                placeholder='รายละเอียด'
              />
            </div>
          </div>
          <Box className='mt-4 flex gap-2'>
            {/* ปุ่มบันทึก/อัปเดต */}
            <Button
              variant='contained'
              color='primary'
              onClick={handleSave}
              disabled={loading || !form.type || !form.description}
            >
              {isEditing ? 'อัปเดต' : 'บันทึก'}
            </Button>

            {/* ปุ่มยกเลิก (แสดงเฉพาะเมื่ออยู่ในโหมดแก้ไข) */}
            {isEditing && (
              <Button variant='outlined' color='secondary' onClick={handleCancel} disabled={loading}>
                ยกเลิก
              </Button>
            )}
          </Box>
        </div>
      )}

      {/* Needs/Expectations Table */}
      {selectedParty && selectedFullParty && (
        <div className='mt-6'>
          <h3 className='text-lg font-semibold mb-2'>รายการ Needs/Expectations</h3>

          {loading ? (
            <div className='flex justify-center my-4'>
              <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
            </div>
          ) : needsExpectations.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full  border'>
                <thead className=''>
                  <tr>
                    <th className='py-2 px-4 border-b text-left'>รหัส</th>
                    <th className='py-2 px-4 border-b text-left'>ประเภท</th>
                    <th className='py-2 px-4 border-b text-left'>รายละเอียด</th>
                    <th className='py-2 px-4 border-b text-center'>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {needsExpectations.map(ne => (
                    <tr key={ne._id} className=''>
                      <td className='py-2 px-4 border-b'>{ne.uniqueId || '-'}</td>
                      <td className='py-2 px-4 border-b'>{ne.type}</td>
                      <td className='py-2 px-4 border-b'>{ne.description}</td>
                      <td className='py-2 px-4 border-b text-center'>
                        <button color='primary' onClick={() => handleEdit(ne)}>
                          <EditIcon fontSize='small' />
                        </button>
                        <button color='secondary' onClick={() => handleDelete(ne._id)}>
                          <DeleteIcon fontSize='small' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center p-4 border rounded-lg '>ไม่พบข้อมูล Needs/Expectations</div>
          )}
        </div>
      )}
    </div>
  )
}
