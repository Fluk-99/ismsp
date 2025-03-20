'use client'

import { useState, useEffect } from 'react'
import { Box, Button, Grid, Paper, TextField, Typography, IconButton, Divider } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'

const API_BASE_URL = 'http://192.168.0.119:3000/api/7SUPP/awareness'

const Awareness = () => {
  const [employees, setEmployees] = useState([])
  const [files, setFiles] = useState({
    exam: [],
    incident: [],
    threat: []
  })

  useEffect(() => {
    fetchEmployees()
    fetchFiles()
  }, [])

  // 🚀 ดึงข้อมูลพนักงานจาก API
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/training`)
      if (!response.ok) throw new Error(`Failed to fetch employee training data: ${response.status}`)
      const data = await response.json()
      setEmployees(Array.isArray(data.data) ? data.data : [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }

  // ดึงไฟล์ที่อัปโหลดจาก API
  const fetchFiles = async () => {
    try {
      const fileTypes = ['exam', 'incident', 'threat']
      let newFiles = {}

      for (let type of fileTypes) {
        const response = await fetch(`${API_BASE_URL}/${type}`)
        if (response.ok) {
          const data = await response.json()
          newFiles[type] = data.files || []
        }
      }

      setFiles(newFiles)
    } catch (error) {
      console.error('Failed to fetch files:', error)
    }
  }

  // เพิ่มพนักงานใหม่
  const addEmployee = () => {
    setEmployees([...employees, { id: Date.now(), name: '', trainingTitle: '', ismsTraining: '', trainingDate: '' }])
  }

  // ลบพนักงานผ่าน API
  const removeEmployee = async id => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setEmployees(employees.filter(emp => emp.id !== id))
      } else {
        console.error(`Failed to delete employee: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to delete employee', error)
    }
  }

  // บันทึกข้อมูลพนักงานใหม่ไปยัง API
  const saveEmployee = async employee => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee)
      })
      if (response.ok) {
        fetchEmployees()
      } else {
        console.error('Failed to save employee')
      }
    } catch (error) {
      console.error('Error saving employee:', error)
    }
  }

  // อัปโหลดไฟล์ไปยัง API
  const uploadFile = async (category, file) => {
    const formData = new FormData()
    formData.append('type', category)
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/file`, { method: 'POST', body: formData })
      if (response.ok) {
        fetchFiles()
      } else {
        console.error('File upload failed:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to upload file', error)
    }
  }

  return (
    <Box p={4} bgcolor='white' boxShadow={3} borderRadius={2}>
      <Typography variant='h4' align='center' gutterBottom fontWeight='bold'>
        Clause 7: Support
      </Typography>
      <Typography variant='h6' fontWeight='bold' gutterBottom>
        ความตระหนักรู้ (Awareness)
      </Typography>

      {/* File Upload Sections */}
      {['exam', 'incident', 'threat'].map(category => (
        <FileUploadSection
          key={category}
          category={category}
          label={category}
          uploadFile={uploadFile}
          files={files[category]}
        />
      ))}

      {/* Employee Section */}
      <EmployeeSection
        employees={employees}
        addEmployee={addEmployee}
        saveEmployee={saveEmployee}
        removeEmployee={removeEmployee}
      />
    </Box>
  )
}

const FileUploadSection = ({ category, label, uploadFile, files }) => (
  <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 2 }}>
    <Typography variant='h6' fontWeight='bold'>
      {label}
    </Typography>
    <Box display='flex' alignItems='center' gap={2} mt={1}>
      <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
        Upload Files
        <input type='file' hidden onChange={e => uploadFile(category, e.target.files[0])} />
      </Button>
    </Box>
    {files &&
      files.length > 0 &&
      files.map((file, index) => (
        <Typography key={index} sx={{ mt: 1, color: 'gray' }}>
          {file.filePath}
        </Typography>
      ))}
  </Paper>
)

const EmployeeSection = ({ employees, addEmployee, saveEmployee, removeEmployee }) => (
  <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
    <Typography variant='h6' fontWeight='bold' gutterBottom>
      พนักงานที่เข้าร่วมการอบรม
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {employees.map(emp => (
      <Grid key={emp.id} container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <TextField fullWidth label='ชื่อพนักงาน' value={emp.name} onChange={e => (emp.name = e.target.value)} />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            label='การอบรมที่องค์กรจัดให้'
            value={emp.trainingTitle}
            onChange={e => (emp.trainingTitle = e.target.value)}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            label='การอบรมด้าน ISMS'
            value={emp.ismsTraining}
            onChange={e => (emp.ismsTraining = e.target.value)}
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            fullWidth
            type='date'
            label='วันที่อบรม'
            value={emp.trainingDate}
            onChange={e => (emp.trainingDate = e.target.value)}
          />
        </Grid>
        <Grid item xs={1} display='flex' alignItems='center' justifyContent='center'>
          <IconButton color='error' onClick={() => removeEmployee(emp.id)}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    ))}
    <Button variant='contained' color='primary' startIcon={<AddCircleOutline />} onClick={addEmployee}>
      Add Employee
    </Button>
    <Button
      variant='contained'
      color='secondary'
      startIcon={<AddCircleOutline />}
      onClick={() => saveEmployee(employees[employees.length - 1])}
      sx={{ ml: 2 }}
    >
      Save Employee
    </Button>
  </Paper>
)

export default Awareness
