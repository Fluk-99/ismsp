'use client'

import { useState, useEffect } from 'react'
import {
  Button,
  TextField,
  Grid,
  IconButton,
  Box,
  Typography,
  Paper,
  CardActions,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SaveIcon from '@mui/icons-material/Save'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/Description'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ismsp-backend.onrender.com/api'

const Competence = () => {
  const [employees, setEmployees] = useState([])
  const [allEmployees, setAllEmployees] = useState([]) // เก็บรายชื่อพนักงานทั้งหมดจาก API
  const [isEditingGlobal, setIsEditingGlobal] = useState(true)
  const [competences, setCompetences] = useState([]) // เก็บข้อมูล competence จาก API
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchEmployees()
    fetchCompetences()
  }, [])

  useEffect(() => {
    if (employees.length === 0 && allEmployees.length > 0) {
      addEmployee()
    }
  }, [employees, allEmployees])
  // ดึงข้อมูลพนักงาน
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/settings/employee`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setAllEmployees(data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setLoading(false)
      showSnackbar('ไม่สามารถโหลดข้อมูลพนักงานได้', 'error')
    }
  }

  // ดึงข้อมูล competence
  const fetchCompetences = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/7SUPP/competence`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setCompetences(data.data)

      // ถ้ามีข้อมูล competence แล้ว ให้นำมาแสดง
      if (data.data.length > 0) {
        const competenceData = data.data.map(comp => ({
          id: comp._id,
          employeeId: comp.employeeId._id,
          name: comp.employeeId.name,
          position: comp.employeeId.position,
          workSkills: comp.skillsFiles && comp.skillsFiles.length > 0 ? comp.skillsFiles[0] : null,
          trainingRecords: comp.trainingFiles && comp.trainingFiles.length > 0 ? comp.trainingFiles[0] : null,
          trainingPrinciplesAndCertificates:
            comp.certificationFiles && comp.certificationFiles.length > 0
              ? comp.certificationFiles.map(cert => ({
                  principle: comp.trainingReceived || '',
                  certificate: cert
                }))
              : [{ principle: comp.trainingReceived || '', certificate: '' }],
          isEditing: false
        }))
        setEmployees(competenceData)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching competences:', error)
      setLoading(false)
      showSnackbar('ไม่สามารถโหลดข้อมูลความสามารถได้', 'error')
    }
  }

  const addEmployee = () => {
    setEmployees(prev => [
      ...prev,
      {
        id: Date.now(),
        employeeId: '',
        name: '',
        position: '',
        workSkills: null,
        trainingRecords: null,
        trainingPrinciplesAndCertificates: [{ principle: '', certificate: '' }],
        isEditing: true
      }
    ])
  }

  const updateEmployee = (id, key, value) => {
    setEmployees(prev =>
      prev.map(emp => {
        if (emp.id === id) {
          // ถ้าเป็นการเลือกพนักงาน ให้อัปเดตชื่อและตำแหน่งด้วย
          if (key === 'employeeId') {
            const selectedEmployee = allEmployees.find(e => e._id === value)
            return {
              ...emp,
              [key]: value,
              name: selectedEmployee?.name || '',
              position: selectedEmployee?.position || ''
            }
          }
          return { ...emp, [key]: value }
        }
        return emp
      })
    )
  }

  const handleFileChange = (id, key, file) => {
    if (!file) return

    setEmployees(prev =>
      prev.map(emp => {
        if (emp.id === id) {
          // สร้างข้อมูลไฟล์ที่อัปโหลด
          const fileObj = {
            file, // เก็บไฟล์จริงไว้สำหรับส่งให้ API
            fileName: file.name // เก็บชื่อไฟล์เพื่อแสดงในหน้าเว็บ
          }
          return { ...emp, [key]: fileObj }
        }
        return emp
      })
    )
  }

  const addTrainingPrincipleAndCertificate = id => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id
          ? {
              ...emp,
              trainingPrinciplesAndCertificates: [
                ...emp.trainingPrinciplesAndCertificates,
                { principle: '', certificate: '' }
              ]
            }
          : emp
      )
    )
  }

  const updateTrainingPrincipleAndCertificate = (id, index, key, value) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id
          ? {
              ...emp,
              trainingPrinciplesAndCertificates: emp.trainingPrinciplesAndCertificates.map((item, i) => {
                if (i === index) {
                  if (key === 'certificate' && value instanceof File) {
                    // สำหรับไฟล์ใบรับรอง
                    return {
                      ...item,
                      [key]: {
                        file: value,
                        fileName: value.name
                      }
                    }
                  }
                  return { ...item, [key]: value }
                }
                return item
              })
            }
          : emp
      )
    )
  }

  const removeTrainingPrincipleAndCertificate = (id, index) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id
          ? {
              ...emp,
              trainingPrinciplesAndCertificates: emp.trainingPrinciplesAndCertificates.filter((_, i) => i !== index)
            }
          : emp
      )
    )
  }

  const toggleEdit = async id => {
    const employee = employees.find(emp => emp.id === id)
    if (employee.isEditing) {
      try {
        await saveCompetence(employee)
        setEmployees(prev => prev.map(emp => (emp.id === id ? { ...emp, isEditing: false } : emp)))
      } catch (error) {
        showSnackbar('ไม่สามารถบันทึกข้อมูลได้', 'error')
      }
    } else {
      setEmployees(prev => prev.map(emp => (emp.id === id ? { ...emp, isEditing: true } : emp)))
    }
  }

  const toggleEditAll = async () => {
    if (isEditingGlobal) {
      // ถ้ากำลังแก้ไขอยู่และกดบันทึกทั้งหมด
      for (const employee of employees) {
        if (employee.isEditing) {
          await saveCompetence(employee)
        }
      }
    }

    // เปลี่ยนสถานะการแก้ไขทั้งหมด
    setIsEditingGlobal(!isEditingGlobal)
    setEmployees(prev => prev.map(emp => ({ ...emp, isEditing: !isEditingGlobal })))
  }

  const saveCompetence = async employee => {
    try {
      setLoading(true)

      // ตรวจสอบว่าได้เลือกพนักงานหรือยัง
      if (!employee.employeeId) {
        showSnackbar('กรุณาเลือกพนักงาน', 'error')
        setLoading(false)
        return
      }

      // สร้าง FormData สำหรับอัปโหลดไฟล์
      const formData = new FormData()
      formData.append('employeeId', employee.employeeId)

      // รวมข้อมูลหลักการฝึกอบรม
      const trainingPrinciples = employee.trainingPrinciplesAndCertificates.map(item => item.principle).join(', ')
      formData.append('trainingReceived', trainingPrinciples)

      // อัปโหลดไฟล์ทักษะการทำงาน
      if (employee.workSkills && employee.workSkills.file) {
        formData.append('skillsFiles', employee.workSkills.file)
      }

      // อัปโหลดไฟล์การฝึกอบรม
      if (employee.trainingRecords && employee.trainingRecords.file) {
        formData.append('trainingFiles', employee.trainingRecords.file)
      }

      // อัปโหลดไฟล์ใบรับรอง
      employee.trainingPrinciplesAndCertificates.forEach((item, index) => {
        if (item.certificate && item.certificate.file) {
          formData.append(`certificationFiles_${index}`, item.certificate.file)
          formData.append(`certificationPrinciples_${index}`, item.principle)
        }
      })

      let response
      if (employee.id && typeof employee.id === 'string' && employee.id.length === 24) {
        // ถ้ามี ID ที่เป็น ObjectID (24 หลัก) ให้อัปเดต
        response = await fetch(`${API_BASE_URL}/7SUPP/competence/${employee.id}`, {
          method: 'PUT',
          body: formData
        })
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        showSnackbar('อัปเดตข้อมูลความสามารถสำเร็จ', 'success')
      } else {
        // ถ้าไม่มี ID หรือเป็น ID ชั่วคราว ให้สร้างใหม่
        response = await fetch(`${API_BASE_URL}/7SUPP/competence/create`, {
          method: 'POST',
          body: formData
        })
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        showSnackbar('เพิ่มข้อมูลความสามารถสำเร็จ', 'success')
      }

      const data = await response.json()
      console.log('API Response:', data)

      // โหลดข้อมูลใหม่
      await fetchCompetences()
      setLoading(false)
    } catch (error) {
      console.error('Error saving competence:', error)
      setLoading(false)
      showSnackbar(`ไม่สามารถบันทึกข้อมูลได้: ${error.message}`, 'error')
    }
  }

  const removeEmployee = async id => {
    try {
      setLoading(true)
      // ถ้ามี ID ที่เป็น ObjectID (24 หลัก) ให้ลบจาก API
      if (typeof id === 'string' && id.length === 24) {
        const response = await fetch(`${API_BASE_URL}/7SUPP/competence/${id}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        showSnackbar('ลบข้อมูลความสามารถสำเร็จ', 'success')
      }

      // ลบออกจาก state
      setEmployees(prev => prev.filter(emp => emp.id !== id))
      setLoading(false)
    } catch (error) {
      console.error('Error deleting competence:', error)
      setLoading(false)
      showSnackbar('ไม่สามารถลบข้อมูลได้', 'error')
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // สร้างลิงก์สำหรับดาวน์โหลดไฟล์
  const getFileDownloadLink = filePath => {
    if (!filePath) return null
    return `${API_BASE_URL}${filePath}`
  }

  return (
    <Box p={4} boxShadow={3} borderRadius={2} position='relative'>
      {loading && (
        <Box
          position='absolute'
          top={0}
          left={0}
          right={0}
          bottom={0}
          display='flex'
          justifyContent='center'
          alignItems='center'
          bgcolor='rgba(255, 255, 255, 0.7)'
          zIndex={10}
        >
          <CircularProgress />
        </Box>
      )}

      <Box display='flex' justifyContent='flex-end' mb={2}>
        <Button
          variant='contained'
          color={isEditingGlobal ? 'primary' : 'secondary'}
          startIcon={isEditingGlobal ? <SaveIcon /> : <EditIcon />}
          onClick={toggleEditAll}
          sx={{ borderRadius: '8px' }}
        >
          {isEditingGlobal ? 'Save All' : 'Edit All'}
        </Button>
      </Box>

      <Typography variant='h4' align='center' gutterBottom fontWeight='bold'>
        Clause 7: Support
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        {employees.map(emp => (
          <Grid item xs={12} key={emp.id}>
            <Paper variant='outlined' sx={{ borderRadius: '12px', p: 3 }}>
              <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h6' fontWeight='bold'>
                  ความสามารถ (Competence)
                </Typography>
                <IconButton color='error' onClick={() => removeEmployee(emp.id)}>
                  <DeleteIcon fontSize='large' />
                </IconButton>
              </Box>

              {/* Employee Selection */}
              <FormControl fullWidth variant='outlined' sx={{ mb: 2 }}>
                <InputLabel id={`employee-select-label-${emp.id}`}>เลือกพนักงาน</InputLabel>
                <Select
                  labelId={`employee-select-label-${emp.id}`}
                  value={emp.employeeId}
                  onChange={e => updateEmployee(emp.id, 'employeeId', e.target.value)}
                  label='เลือกพนักงาน'
                  disabled={!emp.isEditing}
                >
                  <MenuItem value=''>-- เลือกพนักงาน --</MenuItem>
                  {allEmployees.map(employee => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.name} - {employee.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    label='ชื่อพนักงาน'
                    value={emp.name}
                    disabled={true} // ชื่อจะได้จากการเลือกพนักงาน
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    label='ตำแหน่งงาน'
                    value={emp.position}
                    disabled={true} // ตำแหน่งจะได้จากการเลือกพนักงาน
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    ทักษะการทำงาน
                  </Typography>
                  <FileUploadField
                    disabled={!emp.isEditing}
                    onChange={e => handleFileChange(emp.id, 'workSkills', e.target.files[0])}
                    fileName={emp.workSkills?.fileName}
                    filePath={emp.workSkills?.filePath}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    บันทึกการฝึกอบรมของพนักงาน
                  </Typography>
                  <FileUploadField
                    disabled={!emp.isEditing}
                    onChange={e => handleFileChange(emp.id, 'trainingRecords', e.target.files[0])}
                    fileName={emp.trainingRecords?.fileName}
                    filePath={emp.trainingRecords?.filePath}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {emp.trainingPrinciplesAndCertificates.map((item, index) => (
                <Grid container spacing={2} key={index} alignItems='center' sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      label='หลักการฝึกอบรมที่ได้รับ'
                      value={item.principle}
                      disabled={!emp.isEditing}
                      onChange={e => updateTrainingPrincipleAndCertificate(emp.id, index, 'principle', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <FileUploadField
                      disabled={!emp.isEditing}
                      onChange={e =>
                        updateTrainingPrincipleAndCertificate(emp.id, index, 'certificate', e.target.files[0])
                      }
                      fileName={item.certificate?.fileName}
                      filePath={item.certificate?.filePath}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      color='error'
                      onClick={() => removeTrainingPrincipleAndCertificate(emp.id, index)}
                      disabled={!emp.isEditing}
                    >
                      <RemoveCircleOutline />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              <Button
                variant='outlined'
                startIcon={<AddCircleOutline />}
                onClick={() => addTrainingPrincipleAndCertificate(emp.id)}
                disabled={!emp.isEditing}
                sx={{ mt: 2 }}
              >
                Add Training Principle & Certificate
              </Button>

              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button
                  variant='contained'
                  color={emp.isEditing ? 'primary' : 'secondary'}
                  startIcon={emp.isEditing ? <SaveIcon /> : <EditIcon />}
                  onClick={() => toggleEdit(emp.id)}
                  sx={{ borderRadius: '8px' }}
                >
                  {emp.isEditing ? 'Save' : 'Edit'}
                </Button>
              </CardActions>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box display='flex' justifyContent='center' mt={4}>
        <Button
          variant='contained'
          color='success'
          startIcon={<AddCircleOutline />}
          onClick={addEmployee}
          sx={{ px: 4, py: 1.5 }}
        >
          Add Employee Competence
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

function FileUploadField({ onChange, disabled, fileName, filePath }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ismsp-backend.onrender.com/api'

  // สร้างลิงค์ดาวน์โหลด
  const downloadLink = filePath ? `${API_BASE_URL}${filePath}` : null

  const handleDownload = e => {
    if (!downloadLink) {
      e.preventDefault()
      return
    }
  }

  return (
    <TextField
      fullWidth
      variant='outlined'
      placeholder='Upload Files'
      value={fileName || ''}
      InputProps={{
        readOnly: true,
        startAdornment: fileName ? (
          <InputAdornment position='start'>
            {downloadLink ? (
              <a href={downloadLink} target='_blank' rel='noopener noreferrer' onClick={handleDownload}>
                <DescriptionIcon color='primary' sx={{ cursor: 'pointer' }} />
              </a>
            ) : (
              <DescriptionIcon color='primary' />
            )}
          </InputAdornment>
        ) : null,
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton component='label' disabled={disabled}>
              <CloudUploadIcon />
              <input type='file' hidden onChange={onChange} />
            </IconButton>
          </InputAdornment>
        )
      }}
      disabled={disabled}
    />
  )
}

export default Competence
