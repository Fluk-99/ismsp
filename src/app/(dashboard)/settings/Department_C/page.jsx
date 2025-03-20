'use client'

import { useEffect, useState } from 'react'
import { TextField, Button, Typography, Box, CircularProgress, IconButton } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import 'react-toastify/dist/ReactToastify.css'

const BASE_URL = 'http://192.168.0.119:3000/api/settings/department'

const Department_C = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch(BASE_URL)
      if (!response.ok) throw new Error('Failed to fetch departments')

      const data = await response.json()
      setDepartments(
        data.data.map(dept => ({
          deptId: dept.deptId,
          departmentName: dept.name,
          isEditable: false,
          subDepartments: dept.subDepartments || []
        }))
      )
    } catch (error) {
      toast.error('Failed to fetch departments.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = deptId => {
    setEditingId(deptId)
    setDepartments(prev =>
      prev.map(dept => (dept.deptId === deptId ? { ...dept, isEditable: !dept.isEditable } : dept))
    )
  }

  const handleSaveToAPI = async deptId => {
    const dept = departments.find(dept => dept.deptId === deptId)
    if (!dept || !dept.departmentName.trim()) {
      toast.error('Department name cannot be empty!')
      return
    }

    try {
      let url = `${BASE_URL}/${deptId}`
      let method = 'PUT'

      // ถ้าเป็น Department ใหม่ ให้ใช้ POST /create
      if (deptId.startsWith('DEPT-')) {
        url = `${BASE_URL}/create`
        method = 'POST'
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dept.departmentName.trim(),
          subDepartments: dept.subDepartments
        })
      })

      if (!response.ok) throw new Error('Failed to save department.')

      toast.success('✅ Department saved successfully!')
      setEditingId(null)
      fetchDepartments()
    } catch (error) {
      toast.error(error.message || 'Failed to save department.')
    }
  }

  // ✅ ฟังก์ชันเพิ่ม Department
  const handleAddDepartment = () => {
    const newDept = {
      deptId: `DEPT-${Date.now()}`,
      departmentName: '',
      isEditable: true,
      subDepartments: []
    }

    setDepartments(prev => [...prev, newDept])
    setEditingId(newDept.deptId)
  }

  // ✅ ฟังก์ชันลบ Department
  const handleDeleteDepartment = async deptId => {
    try {
      const response = await fetch(`${BASE_URL}/${deptId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete department.')

      toast.success('✅ Department deleted successfully!')
      setDepartments(prev => prev.filter(dept => dept.deptId !== deptId))
    } catch (error) {
      toast.error(error.message || 'Failed to delete department.')
    }
  }

  const handleAddSubDepartment = deptId => {
    setDepartments(prev =>
      prev.map(dept =>
        dept.deptId === deptId
          ? {
              ...dept,
              subDepartments: [...dept.subDepartments, { name: '', subDeptId: `SUB-${Date.now()}` }],
              isEditable: true
            }
          : dept
      )
    )

    setEditingId(deptId)
  }

  const handleDeleteSubDepartment = async (deptId, subDeptId) => {
    try {
      const response = await fetch(`${BASE_URL}/${deptId}/sub-department/${subDeptId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete sub-department.')

      toast.success('✅ Sub-department deleted successfully!')
      setDepartments(prev =>
        prev.map(dept =>
          dept.deptId === deptId
            ? { ...dept, subDepartments: dept.subDepartments.filter(sub => sub.subDeptId !== subDeptId) }
            : dept
        )
      )
    } catch (error) {
      toast.error(error.message || 'Failed to delete sub-department.')
    }
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <ToastContainer />
      <Typography variant='h4' align='center' gutterBottom>
        Department Management
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        departments.map(dept => (
          <Box key={dept.deptId} sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
            <TextField
              fullWidth
              label='Department Name'
              value={dept.departmentName}
              disabled={!dept.isEditable}
              onChange={e =>
                setDepartments(prev =>
                  prev.map(d => (d.deptId === dept.deptId ? { ...d, departmentName: e.target.value } : d))
                )
              }
            />

            {dept.subDepartments.map(sub => (
              <Box key={sub.subDeptId} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TextField
                  fullWidth
                  label='Sub-Department Name'
                  value={sub.name}
                  onChange={e =>
                    setDepartments(prev =>
                      prev.map(d =>
                        d.deptId === dept.deptId
                          ? {
                              ...d,
                              subDepartments: d.subDepartments.map(s =>
                                s.subDeptId === sub.subDeptId ? { ...s, name: e.target.value } : s
                              )
                            }
                          : d
                      )
                    )
                  }
                />
                <IconButton color='error' onClick={() => handleDeleteSubDepartment(dept.deptId, sub.subDeptId)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button startIcon={<AddIcon />} onClick={() => handleAddSubDepartment(dept.deptId)}>
              Add Sub-Department
            </Button>

            {(dept.isEditable || editingId === dept.deptId) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ mt: 2, ml: 1 }}
                onClick={() => handleSaveToAPI(dept.deptId)}
              >
                Save
              </Button>
            )}

            {!dept.isEditable && (
              <Button
                variant='contained'
                color='secondary'
                sx={{ mt: 2, ml: 1 }}
                onClick={() => handleEditToggle(dept.deptId)}
              >
                Edit
              </Button>
            )}

            <Button
              variant='contained'
              color='error'
              sx={{ mt: 2, ml: 1 }}
              onClick={() => handleDeleteDepartment(dept.deptId)}
            >
              Delete
            </Button>
          </Box>
        ))
      )}

      <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
        <Button variant='contained' color='success' onClick={handleAddDepartment}>
          Add Department
        </Button>
      </Box>
    </Box>
  )
}

export default Department_C
