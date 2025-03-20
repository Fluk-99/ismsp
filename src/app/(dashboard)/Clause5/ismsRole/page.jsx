'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Select,
  MenuItem,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

// 📌 API Endpoints
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.119:3000/api'
const ENDPOINTS = {
  EMPLOYEE: `${API_URL}/settings/employee`,
  ISMS_ROLE: `${API_URL}/5LEAD/isms-roles`
}

const ISMSRoles = () => {
  const [state, setState] = useState({
    employees: [],
    roles: [],
    loading: true
  })

  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [role, setRole] = useState('')
  const [responsibilityScope, setResponsibilityScope] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [approvedBy, setApprovedBy] = useState('')
  const [referenceDocument, setReferenceDocument] = useState(null)

  // 📌 ดึงข้อมูล Employee และ Roles
  const fetchAllData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const [employeesRes, rolesRes] = await Promise.all([fetch(ENDPOINTS.EMPLOYEE), fetch(ENDPOINTS.ISMS_ROLE)])

      const employees = await employeesRes.json()
      const roles = await rolesRes.json()

      console.log('✅ Fetched Employees:', employees.data)
      console.log('✅ Fetched Roles (Raw):', roles)

      setState(prev => ({
        ...prev,
        employees: employees.data || [],
        roles: Array.isArray(roles) ? roles : roles.data || [],
        loading: false
      }))
    } catch (error) {
      console.error('❌ Error fetching data:', error)
      toast.error('Failed to load data')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  useEffect(() => {
    console.log('🔍 Debugging roles:', state.roles)
  }, [state.roles])

  // 📌 ฟังก์ชันสร้าง Role ใหม่
  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('responsiblePerson', selectedEmployee)
    formData.append('role', role)
    formData.append('responsibilityScope', responsibilityScope)
    formData.append('appointmentDate', appointmentDate)
    formData.append('approvedBy', approvedBy)
    if (referenceDocument) formData.append('referenceDocument', referenceDocument)

    // ✅ Debugging: ดูค่าที่ถูกส่งไป API
    console.log('🔍 Sending Data:', {
      responsiblePerson: selectedEmployee,
      role,
      responsibilityScope,
      appointmentDate,
      approvedBy,
      referenceDocument: referenceDocument ? referenceDocument.name : 'No file uploaded'
    })

    try {
      const response = await fetch(`${ENDPOINTS.ISMS_ROLE}/create`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      console.log('🔍 Server Response:', response.status, result) // ✅ Debugging API Response

      if (!response.ok) throw new Error(result.message || 'Failed to save role')

      toast.success('Role saved successfully!')
      fetchAllData()
    } catch (error) {
      console.error('❌ Error saving role:', error)
      toast.error('Failed to save role')
    }
  }

  // 📌 ฟังก์ชันลบ Role
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this role?')) return
    try {
      const response = await fetch(`${ENDPOINTS.ISMS_ROLE}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete role')

      setState(prev => ({
        ...prev,
        roles: prev.roles.filter(role => role._id !== id)
      }))

      toast.success('Role deleted successfully!')
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Failed to delete role')
    }
  }

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div className='p-6 shadow-lg rounded-lg mx-auto'>
      <h2 className='text-xl font-bold text-center'>Clause 5: Leadership</h2>
      <p className='text-center text-gray-600 mb-4'>5.3 ISMS Roles & Responsibilities</p>
      <Box sx={{ p: 4, maxWidth: '800px', margin: '0 auto' }}>
        <ToastContainer />
        <FormControl fullWidth className='mb-4'>
          <InputLabel>Responsible Person</InputLabel>
          <Select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
            {state.employees && state.employees.length > 0 ? (
              state.employees.map(employee => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.name} ({employee.position})
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No employees found</MenuItem>
            )}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label='Role in ISMS'
          value={role}
          onChange={e => setRole(e.target.value)}
          className='mb-4'
        />

        <TextField
          fullWidth
          label='Responsibility Scope'
          value={responsibilityScope}
          onChange={e => setResponsibilityScope(e.target.value)}
          className='mb-4'
        />

        <TextField
          fullWidth
          label='Appointment Date'
          type='date'
          InputLabelProps={{ shrink: true }}
          value={appointmentDate}
          onChange={e => setAppointmentDate(e.target.value)}
          className='mb-4'
        />

        <FormControl fullWidth className='mb-4'>
          <InputLabel>Approved By</InputLabel>
          <Select value={approvedBy} onChange={e => setApprovedBy(e.target.value)}>
            {state.employees && state.employees.length > 0 ? (
              state.employees.map(emp => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name} - {emp.position}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No employees found</MenuItem> // ✅ ป้องกันกรณีไม่มีข้อมูล
            )}
          </Select>
        </FormControl>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {' '}
          {/* ✅ ใช้ spacing ใน Grid */}
          <Grid item xs={6}>
            <Button
              variant='outlined'
              component='label'
              startIcon={<CloudUploadIcon />}
              fullWidth // ✅ ปรับปุ่มให้กว้างเต็มพื้นที่
            >
              Upload Reference Document
              <input type='file' hidden onChange={e => setReferenceDocument(e.target.files[0])} />
            </Button>
            {referenceDocument && (
              <Typography variant='body2' color='textSecondary' sx={{ mt: 1 }}>
                {referenceDocument.name}
              </Typography>
            )}
          </Grid>
          <Grid item xs={6}>
            <Button
              variant='contained'
              color='primary'
              sx={{ padding: '10px 16px', width: '100%' }} // ✅ ปรับขนาดปุ่มให้สมดุล
              onClick={handleSubmit}
            >
              Save Roles
            </Button>
          </Grid>
        </Grid>

        <div className='mt-6'>
          <h3 className='text-lg font-bold'>Recorded Roles</h3>
          {state.roles && state.roles.length > 0 ? (
            state.roles.map(role => (
              <Box key={role._id} className='p-4 border rounded mt-2 relative'>
                <IconButton
                  onClick={() => handleDelete(role._id)}
                  sx={{ position: 'absolute', top: 5, right: 5, color: 'secondary' }}
                >
                  <DeleteIcon />
                </IconButton>
                <p>
                  <strong>Responsible Person:</strong>{' '}
                  {role.responsiblePerson
                    ? `${role.responsiblePerson.name} (${role.responsiblePerson.position})`
                    : 'N/A'}
                </p>
                <p>
                  <strong>Role in ISMS:</strong> {role.role}
                </p>
                <p>
                  <strong>Responsibility Scope:</strong> {role.responsibilityScope}
                </p>
                <p>
                  <strong>Appointment Date:</strong>{' '}
                  {role.appointmentDate ? new Date(role.appointmentDate).toLocaleDateString() : 'N/A'}
                </p>
                <p>
                  <strong>Approved By:</strong>{' '}
                  {role.approvedBy ? `${role.approvedBy.name} - ${role.approvedBy.position}` : 'N/A'}
                </p>
              </Box>
            ))
          ) : (
            <p>No roles recorded yet.</p>
          )}
        </div>
      </Box>
    </div>
  )
}

export default ISMSRoles
