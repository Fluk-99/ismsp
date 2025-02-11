'use client'

import { useEffect, useState } from 'react'
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// API
const API_URL = 'http://192.168.0.119:3000/api/settings/department'
const CREATE_API_URL = 'http://192.168.0.119:3000/api/settings/department/create'
const DELETE_API_URL = 'http://192.168.0.119:3000/api/settings/department'

const Department_C = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [canAdd, setCanAdd] = useState(true)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()
        const formattedData = data.data.map(dept => ({
          id: dept.deptId,
          departmentName: dept.name,
          isEditable: false,
          isSaved: true
        }))
        setDepartments(formattedData)
      } catch (error) {
        console.error('Error fetching departments:', error)
        toast.error('Failed to fetch departments.')
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  const handleEditToggle = id => {
    setDepartments(prev =>
      prev.map(dept => (dept.id === id ? { ...dept, isEditable: !dept.isEditable, isSaved: false } : dept))
    )
    setCanAdd(true)
  }

  const handleSaveToAPI = async id => {
    const dept = departments.find(dept => dept.id === id)

    if (!dept || dept.departmentName.trim() === '') {
      toast.error('Please fill in all fields before saving!', { position: 'top-right', autoClose: 3000 })
      return
    }

    try {
      const response = await fetch(CREATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: dept.departmentName
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      toast.success('Department saved successfully!', { position: 'top-right', autoClose: 3000 })

      setDepartments(prev => prev.map(dept => (dept.id === id ? { ...dept, isEditable: false, isSaved: true } : dept)))
      setCanAdd(false)
    } catch (error) {
      console.error('Error saving department:', error)
      toast.error('Failed to save department. Please try again.')
    }
  }

  const handleAddDepartment = () => {
    const newDept = {
      id: Date.now().toString(),
      departmentName: '',
      isEditable: true,
      isSaved: false
    }
    setDepartments(prev => [...prev, newDept])
    setCanAdd(false)
  }

  const handleDeleteDepartment = async (deptId) => {
    try {
      if (!deptId) {
        throw new Error("Invalid department ID.");
      }

      console.log(`Deleting department with ID: ${deptId}`); // ✅ Debugging Log

      const response = await fetch(`${DELETE_API_URL}/${deptId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`Response status: ${response.status}`); // ✅ Debugging Log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to delete department. Status: ${response.status}, Error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Delete Success:", result);

      setDepartments((prev) => prev.filter((dept) => dept.id !== deptId));
      toast.success(result.message || "Department deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error(error.message || "Failed to delete department. Please try again.");
    }
  };

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
          <Box
            key={dept.id}
            sx={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              marginTop: '30px',
              alignItems: 'center'
            }}
          >
            <TextField
              fullWidth
              label='Department Name'
              value={dept.departmentName}
              disabled={!dept.isEditable}
              onChange={e => setDepartments(prev =>
                prev.map(d => d.id === dept.id ? { ...d, departmentName: e.target.value } : d)
              )}
            />

            <Button
              variant='contained'
              color='secondary'
              onClick={() => handleEditToggle(dept.id)}
              sx={{ marginRight: '10px' }}
            >
              {dept.isEditable ? 'Cancel' : 'Edit'}
            </Button>

            <Button
              variant='contained'
              color='primary'
              onClick={() => handleSaveToAPI(dept.id)}
              disabled={!dept.isEditable || dept.departmentName.trim() === ''}
              sx={{ marginRight: '10px' }}
            >
              Save
            </Button>

            <Button
              variant='contained'
              color='error'
              onClick={() => handleDeleteDepartment(dept.id)}
            >
              Delete
            </Button>
          </Box>
        ))
      )}

      {canAdd && (
        <Box sx={{ textAlign: "center", marginTop: "20px" }}>
          <Button variant="contained" color="success" onClick={handleAddDepartment}>
            Add Department
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Department_C
