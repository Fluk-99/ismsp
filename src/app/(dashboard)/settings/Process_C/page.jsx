'use client'

import { useEffect, useState } from 'react'
import { Select, MenuItem, TextField, Button, Typography, Box, CircularProgress } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const API_URL = 'https://ismsp-backend.onrender.com/api/settings/process'
const DEPARTMENT_API_URL = 'https://ismsp-backend.onrender.com/api/settings/department'

const Process_C = () => {
  const [processes, setProcesses] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [canAdd, setCanAdd] = useState(true)

  useEffect(() => {
    fetchProcesses()
    fetchDepartments()
  }, [])

  const fetchProcesses = async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch data')

      const data = await response.json()
      console.log('Fetched Processes from API:', data.data)

      setProcesses(
        data.data.map(proc => ({
          id: proc.processId,
          name: proc.name,
          details: proc.details || '',
          department: proc.department?._id || '',
          subDepartment: proc.subDepartment?._id || '',
          isEditable: false
        }))
      )
    } catch (error) {
      console.error('Error fetching processes:', error)
      toast.error('Failed to fetch processes.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch(DEPARTMENT_API_URL)
      if (!response.ok) throw new Error('Failed to fetch departments')

      const data = await response.json()
      setDepartments(data.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast.error('Failed to fetch departments.')
    }
  }

  const handleEditToggle = id => {
    setProcesses(prev =>
      prev.map(process =>
        process.id === id ? { ...process, isEditable: !process.isEditable, isSaved: false } : process
      )
    )
    setCanAdd(true)
  }

  const handleSaveToAPI = async id => {
    const process = processes.find(process => process.id === id)

    if (!process || !process.name.trim() || !process.department.trim()) {
      toast.error('Please fill in all fields before saving!', { position: 'top-right', autoClose: 3000 })
      return
    }

    try {
      let url = `${API_URL}/create`
      let method = 'POST'

      if (!id.startsWith('temp-')) {
        url = `${API_URL}/${id}`
        method = 'PUT'
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: process.name,
          details: process.details,
          departmentId: process.department,
          subDepartmentId: process.subDepartment
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const updatedProcess = await response.json()
      console.log('Updated Process:', updatedProcess)

      toast.success('Process saved successfully!', { position: 'top-right', autoClose: 3000 })
      fetchProcesses()
      setCanAdd(true)
    } catch (error) {
      console.error('Error saving process:', error)
      toast.error('Failed to save process. Please try again.')
    }
  }

  const handleAddProcess = () => {
    setProcesses(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: '',
        details: '',
        department: '',
        subDepartment: '',
        isEditable: true,
        isSaved: false
      }
    ])
    setCanAdd(false)
  }

  const handleDeleteProcess = async processId => {
    try {
      const response = await fetch(`${API_URL}/${processId}`, { method: 'DELETE' })

      if (!response.ok) {
        throw new Error(`Failed to delete process. Status: ${response.status}`)
      }

      setProcesses(prev => prev.filter(process => process.id !== processId))
      toast.success('Process deleted successfully!', { position: 'top-right', autoClose: 3000 })
    } catch (error) {
      console.error('Error deleting process:', error)
      toast.error('Failed to delete process. Please try again.')
    }
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <ToastContainer />

      <Typography variant='h4' align='center' gutterBottom>
        Process Management
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        processes.map(process => (
          <Box key={process.id} sx={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <TextField
              fullWidth
              label='Process Name'
              value={process.name}
              disabled={!process.isEditable}
              onChange={e =>
                setProcesses(prev => prev.map(d => (d.id === process.id ? { ...d, name: e.target.value } : d)))
              }
            />

            <TextField
              fullWidth
              label='Details'
              value={process.details}
              disabled={!process.isEditable}
              onChange={e =>
                setProcesses(prev => prev.map(d => (d.id === process.id ? { ...d, details: e.target.value } : d)))
              }
            />

            <Select
              fullWidth
              disabled={!process.isEditable}
              value={process.department} // ✅ ใช้ `_id` ที่ถูกต้อง
              onChange={e =>
                setProcesses(prev =>
                  prev.map(d => (d.id === process.id ? { ...d, department: e.target.value, subDepartment: '' } : d))
                )
              }
            >
              {departments.map(dept => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              fullWidth
              disabled={!process.isEditable || !process.department}
              value={process.subDepartment || ''}
              onChange={e =>
                setProcesses(prev => prev.map(d => (d.id === process.id ? { ...d, subDepartment: e.target.value } : d)))
              }
            >
              {departments
                .find(dep => dep._id === process.department)
                ?.subDepartments?.map(sub => (
                  <MenuItem key={sub._id} value={sub._id}>
                    {sub.name}
                  </MenuItem>
                )) || <MenuItem value=''>No Sub-Department</MenuItem>}
            </Select>

            <Button variant='contained' color='secondary' onClick={() => handleEditToggle(process.id)}>
              {process.isEditable ? 'Cancel' : 'Edit'}
            </Button>
            <Button variant='contained' color='primary' onClick={() => handleSaveToAPI(process.id)}>
              Save
            </Button>
            <Button variant='contained' color='error' onClick={() => handleDeleteProcess(process.id)}>
              Delete
            </Button>
          </Box>
        ))
      )}

      {canAdd && (
        <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
          <Button variant='contained' color='success' onClick={handleAddProcess}>
            Add Process
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Process_C
