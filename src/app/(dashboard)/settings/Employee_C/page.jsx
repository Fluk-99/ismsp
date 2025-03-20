'use client'

import { useEffect, useState } from 'react'
import { TextField, Select, MenuItem, Button, Typography, Box, CircularProgress } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// API Endpoints
const API_URL = 'http://192.168.0.119:3000/api/settings/employee'
const DEPARTMENT_API_URL = 'http://192.168.0.119:3000/api/settings/department'

const Employee_C = () => {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([]) // 🔹 เก็บข้อมูลแผนก
  const [loading, setLoading] = useState(true)
  const [canAdd, setCanAdd] = useState(true) // ป้องกันการเพิ่มหลายรายการพร้อมกัน

  useEffect(() => {
    fetchEmployees()
    fetchDepartments() // 🔹 ดึงข้อมูลแผนก
  }, [])

  // ดึงข้อมูลพนักงาน
  const fetchEmployees = async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch employees')
      const data = await response.json()

      console.log('Fetched Employees:', data.data) // Debugging

      setEmployees(
        data.data.map(emp => ({
          id: emp.employeeId,
          employeeName: emp.name,
          employeePosition: emp.position,
          department: emp.department?.deptId || 'N/A', // ✅ ใช้ `deptId` ที่ถูก populate แล้ว
          subDepartment: emp.subDepartment?.subDeptId ? emp.subDepartment.subDeptId : 'N/A',
          isEditable: false
        }))
      )
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Failed to fetch employees.')
    } finally {
      setLoading(false)
    }
  }

  // ดึงข้อมูลแผนก
  const fetchDepartments = async () => {
    try {
      const response = await fetch(DEPARTMENT_API_URL)
      if (!response.ok) throw new Error('Failed to fetch departments')
      const data = await response.json()

      console.log('Departments Data:', data.data) // Debugging

      setDepartments(data.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast.error('Failed to fetch departments.')
    }
  }

  // สลับโหมดแก้ไข
  const handleEditToggle = id => {
    setEmployees(prev => prev.map(emp => (emp.id === id ? { ...emp, isEditable: !emp.isEditable } : emp)))
    setCanAdd(true)
  }

  // บันทึกพนักงานไปยัง API
  const handleSaveToAPI = async employeeId => {
    const emp = employees.find(emp => emp.id === employeeId)
    console.log(`Saving Employee ID: ${employeeId}`)
    console.log('Payload:', {
      name: emp.employeeName.trim(),
      position: emp.employeePosition.trim(),
      department: emp.department || null,
      subDepartment: emp.subDepartment || null
    })

    if (!emp || !emp.employeeName.trim() || !emp.employeePosition.trim()) {
      toast.error('Employee name and position cannot be empty!')
      return
    }

    try {
      let url = `${API_URL}/${employeeId}`
      let method = 'PUT'

      if (!emp.id || emp.id.startsWith('EMP-')) {
        url = `${API_URL}/create`
        method = 'POST'
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: emp.employeeName.trim(),
          position: emp.employeePosition.trim(),
          department: emp.department || null,
          subDepartment: emp.subDepartment || null
        })
      })

      if (!response.ok) throw new Error('Failed to save employee.')

      const data = await response.json()
      console.log('Employee Saved:', data)

      toast.success('Employee saved successfully!')
      fetchEmployees() // รีโหลดข้อมูลหลังจากบันทึก

      setCanAdd(true)
    } catch (error) {
      console.error('Error saving employee:', error)
      toast.error(error.message || 'Failed to save employee.')
    }
  }

  // เพิ่มพนักงานใหม่
  const handleAddEmployee = () => {
    setEmployees(prev => [
      ...prev,
      {
        id: `EMP-${Date.now()}`,
        employeeName: '',
        employeePosition: '',
        department: '',
        subDepartment: '',
        isEditable: true,
        isSaved: false
      }
    ])
    setCanAdd(false)
  }

  // ยกเลิกการเพิ่มพนักงานใหม่
  const handleCancelAdd = () => {
    setEmployees(prev => prev.slice(0, -1)) // ลบพนักงานล่าสุดออก
    setCanAdd(true)
  }

  // ลบพนักงาน
  const handleDeleteEmployee = async employeeId => {
    if (!employeeId) {
      toast.error('Invalid employee ID!')
      return
    }
    try {
      console.log('Deleting employee:', employeeId)

      const response = await fetch(`${API_URL}/${employeeId}`, { method: 'DELETE' })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete employee (${response.status}): ${errorText}`)
      }

      toast.success('Employee deleted successfully!')
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId))
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error(error.message || 'Failed to delete employee.')
    }
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <ToastContainer />

      <Typography variant='h4' align='center' gutterBottom>
        Employee
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        employees.map((emp, index) => (
          <Box key={emp.id} sx={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
            <TextField
              fullWidth
              label={`Employee ${index + 1} Name`}
              value={emp.employeeName}
              disabled={!emp.isEditable}
              onChange={e =>
                setEmployees(prev => prev.map(d => (d.id === emp.id ? { ...d, employeeName: e.target.value } : d)))
              }
            />

            <TextField
              fullWidth
              label={`Employee ${index + 1} Position`}
              value={emp.employeePosition}
              disabled={!emp.isEditable}
              onChange={e =>
                setEmployees(prev => prev.map(d => (d.id === emp.id ? { ...d, employeePosition: e.target.value } : d)))
              }
            />

            <Select
              fullWidth
              disabled={!emp.isEditable}
              value={emp.department || ''}
              onChange={e =>
                setEmployees(prev =>
                  prev.map(d => (d.id === emp.id ? { ...d, department: e.target.value, subDepartment: '' } : d))
                )
              }
            >
              {departments.map(dept => (
                <MenuItem key={dept.deptId} value={dept.deptId}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              fullWidth
              disabled={!emp.isEditable || !emp.department}
              value={emp.subDepartment || ''}
              onChange={e =>
                setEmployees(prev => prev.map(d => (d.id === emp.id ? { ...d, subDepartment: e.target.value } : d)))
              }
            >
              {departments
                .find(dep => dep.deptId === emp.department)
                ?.subDepartments?.map(sub => (
                  <MenuItem key={sub.subDeptId} value={sub.subDeptId}>
                    {sub.name}
                  </MenuItem>
                )) || <MenuItem value=''>No Sub-Department</MenuItem>}
            </Select>

            <Button variant='contained' color='secondary' onClick={() => handleEditToggle(emp.id)}>
              {emp.isEditable ? 'Cancel' : 'Edit'}
            </Button>

            <Button
              variant='contained'
              color='primary'
              onClick={() => handleSaveToAPI(emp.id)}
              disabled={!emp.isEditable || emp.isSaved}
            >
              Save
            </Button>

            <Button variant='contained' color='error' onClick={() => handleDeleteEmployee(emp.id)}>
              Remove
            </Button>
          </Box>
        ))
      )}

      {canAdd && (
        <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
          <Button variant='contained' color='success' onClick={handleAddEmployee}>
            Add Employee
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Employee_C
