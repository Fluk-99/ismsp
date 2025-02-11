'use client'

import { useEffect, useState } from 'react'
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// API
const API_URL = 'http://192.168.0.119:3000/api/settings/employee'
const CREATE_API_URL = 'http://192.168.0.119:3000/api/settings/employee/create'
const DELETE_API_URL = 'http://192.168.0.119:3000/api/settings/employee'

const Employee_C = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [canAdd, setCanAdd] = useState(true)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()
        const formattedData = data.data.map(emp => ({
          id: emp.employeeId,
          employeeName: emp.name,
          employeePosition: emp.position,
          isEditable: false,
          isSaved: true
        }))
        setEmployees(formattedData)
      } catch (error) {
        console.error('Error fetching employees:', error)
        toast.error('Failed to fetch employees.')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const handleEditToggle = id => {
    setEmployees(prev =>
      prev.map(emp => (emp.id === id ? { ...emp, isEditable: !emp.isEditable, isSaved: false } : emp))
    )
    setCanAdd(true)
  }

  const handleSaveToAPI = async id => {
    const emp = employees.find(emp => emp.id === id)

    if (!emp || emp.employeeName.trim() === '' || emp.employeePosition.trim() === '') {
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
          name: emp.employeeName,
          position: emp.employeePosition
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      toast.success('Employee saved successfully!', { position: 'top-right', autoClose: 3000 })

      setEmployees(prev => prev.map(emp => (emp.id === id ? { ...emp, isEditable: false, isSaved: true } : emp)))
      setCanAdd(false)
    } catch (error) {
      console.error('Error saving employee:', error)
      toast.error('Failed to save employee. Please try again.')
    }
  }

  const handleAddEmployee = () => {
    const newEmp = {
      id: Date.now().toString(),
      employeeName: '',
      employeePosition: '',
      isEditable: true,
      isSaved: false
    }
    setEmployees(prev => [...prev, newEmp])
    setCanAdd(false)
  }

  const handleDeleteEmployee = async (empId) => {
    try {
      if (!empId) {
        throw new Error("Invalid employee ID.");
      }

      console.log(`Deleting employee with ID: ${empId}`);

      const response = await fetch(`${DELETE_API_URL}/${empId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to delete employee. Status: ${response.status}, Error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Delete Success:", result);

      setEmployees((prev) => prev.filter((emp) => emp.id !== empId));
      toast.success(result.message || "Employee deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(error.message || "Failed to delete employee. Please try again.");
    }
  };

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
          <Box
            key={emp.id}
            sx={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              marginTop: '30px',
              alignItems: 'center'
            }}
          >
            <TextField
              label='ID'
              value={emp.id}
              disabled
              sx={{ width: '100px' }}
            />

            <TextField
              fullWidth
              label={`Employee ${index + 1} Name`}
              value={emp.employeeName}
              disabled={!emp.isEditable}
              onChange={e => setEmployees(prev =>
                prev.map(d => d.id === emp.id ? { ...d, employeeName: e.target.value } : d)
              )}
            />

            <TextField
              fullWidth
              label={`Employee ${index + 1} Position`}
              value={emp.employeePosition}
              disabled={!emp.isEditable}
              onChange={e => setEmployees(prev =>
                prev.map(d => d.id === emp.id ? { ...d, employeePosition: e.target.value } : d)
              )}
            />

            <Button
              variant='contained'
              color='secondary'
              onClick={() => handleEditToggle(emp.id)}
              sx={{ marginRight: '10px' }}
            >
              {emp.isEditable ? 'Cancel' : 'Edit'}
            </Button>

            <Button
              variant='contained'
              color='primary'
              onClick={() => handleSaveToAPI(emp.id)}
              disabled={!emp.isEditable || emp.employeeName.trim() === '' || emp.employeePosition.trim() === ''}
              sx={{ marginRight: '10px' }}
            >
              Save
            </Button>

            <Button
              variant='contained'
              color='error'
              onClick={() => handleDeleteEmployee(emp.id)}
            >
              Remove
            </Button>
          </Box>
        ))
      )}

      {canAdd && (
        <Box sx={{ textAlign: "center", marginTop: "20px" }}>
          <Button variant="contained" color="success" onClick={handleAddEmployee}>
            Add Employee
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Employee_C

