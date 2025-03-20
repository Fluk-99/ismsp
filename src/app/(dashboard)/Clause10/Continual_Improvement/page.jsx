'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Card,
  CardContent
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SaveIcon from '@mui/icons-material/Save'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import DescriptionIcon from '@mui/icons-material/Description'
import BusinessIcon from '@mui/icons-material/Business'
import PersonIcon from '@mui/icons-material/Person'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.119:3000/api'

const ContinualImprovement = () => {
  const [improvements, setImprovements] = useState([])
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // State สำหรับฟอร์ม
  const [formData, setFormData] = useState({
    title: '',
    responsibleType: 'Employee',
    responsiblePerson: '',
    responsibleReference: '',
    problemSource: '',
    severityLevel: 'ต่ำ (Low)',
    rootCause: '',
    improvementApproach: '',
    futurePreventionMeasures: '',
    implementationDate: '',
    followUpResponsibleType: 'Employee',
    followUpResponsible: '',
    followUpReference: '',
    followUpDate: '',
    implementationResults: '',
    problemsDuringImplementation: '',
    reportFile: null,
    planFile: null,
    evidenceFile: null,
    auditFile: null,
    id: null
  })

  // State สำหรับปัญหาและคำอธิบาย
  const [problemEntries, setProblemEntries] = useState([{ id: Date.now(), source: '', description: '' }])

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchImprovements()
    fetchEmployees()
    fetchDepartments()
  }, [])

  // ดึงข้อมูลการปรับปรุงทั้งหมด
  const fetchImprovements = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/10IMPROV/continual-improvement`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setImprovements(data.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching improvements:', error)
      showSnackbar('ไม่สามารถโหลดข้อมูลการปรับปรุงอย่างต่อเนื่องได้', 'error')
      setLoading(false)
    }
  }

  // ดึงข้อมูลพนักงาน
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/employee`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()

      // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
      const formattedEmployees = data.data.map(emp => ({
        id: emp._id,
        name: emp.name,
        position: emp.position,
        employeeId: emp.employeeId,
        department: emp.department || 'Not Assigned'
      }))

      setEmployees(formattedEmployees)
    } catch (error) {
      console.error('Error fetching employees:', error)
      showSnackbar('ไม่สามารถโหลดข้อมูลพนักงานได้', 'error')
    }
  }

  // ดึงข้อมูลแผนก
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/department`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()

      // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
      const formattedDepartments = data.data.map(dept => ({
        id: dept._id,
        name: dept.name,
        deptId: dept.deptId,
        description: dept.description || ''
      }))

      setDepartments(formattedDepartments)
    } catch (error) {
      console.error('Error fetching departments:', error)
      showSnackbar('ไม่สามารถโหลดข้อมูลแผนกได้', 'error')
    }
  }

  // จัดการการเปลี่ยนแปลงค่าในฟอร์ม
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // จัดการการเลือกประเภทผู้รับผิดชอบ
  const handleResponsibleTypeChange = e => {
    const type = e.target.value
    setFormData(prev => ({
      ...prev,
      responsibleType: type,
      responsiblePerson: '',
      responsibleReference: ''
    }))
  }

  // จัดการการเลือกประเภทผู้รับผิดชอบติดตามผล
  const handleFollowUpTypeChange = e => {
    const type = e.target.value
    setFormData(prev => ({
      ...prev,
      followUpResponsibleType: type,
      followUpResponsible: '',
      followUpReference: ''
    }))
  }

  // จัดการการเลือกผู้รับผิดชอบ
  const handleResponsibleChange = (event, newValue) => {
    if (newValue) {
      const displayText =
        formData.responsibleType === 'Employee'
          ? `${newValue.name} (${newValue.employeeId})`
          : `${newValue.name} (${newValue.deptId})`

      setFormData(prev => ({
        ...prev,
        responsiblePerson: displayText,
        responsibleReference: newValue.id
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        responsiblePerson: '',
        responsibleReference: ''
      }))
    }
  }

  // จัดการการเลือกผู้รับผิดชอบติดตามผล
  const handleFollowUpResponsibleChange = (event, newValue) => {
    if (newValue) {
      const displayText =
        formData.followUpResponsibleType === 'Employee'
          ? `${newValue.name} (${newValue.employeeId})`
          : `${newValue.name} (${newValue.deptId})`

      setFormData(prev => ({
        ...prev,
        followUpResponsible: displayText,
        followUpReference: newValue.id
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        followUpResponsible: '',
        followUpReference: ''
      }))
    }
  }

  // เพิ่มรายการปัญหาใหม่
  const addProblemEntry = () => {
    setProblemEntries([...problemEntries, { id: Date.now(), source: '', description: '' }])
  }

  // อัปเดตรายการปัญหา
  const updateProblemEntry = (id, field, value) => {
    setProblemEntries(prev => prev.map(entry => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  // ลบรายการปัญหา
  const removeProblemEntry = id => {
    setProblemEntries(prev => prev.filter(entry => entry.id !== id))
  }

  // จัดการการอัปโหลดไฟล์
  const handleFileChange = (e, fieldName) => {
    if (e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: e.target.files[0]
      }))
    }
  }

  // ตั้งค่าข้อมูลเพื่อแก้ไข
  const editImprovement = improvement => {
    // ตั้งค่า formData
    setFormData({
      id: improvement._id,
      title: improvement.title || '',
      responsibleType: improvement.responsibleType || 'Employee',
      responsiblePerson: improvement.responsiblePerson || '',
      responsibleReference: improvement.responsibleReference?._id || improvement.responsibleReference || '',
      problemSource: improvement.problemSource || '',
      severityLevel: improvement.severityLevel || 'ต่ำ (Low)',
      rootCause: improvement.rootCause || '',
      improvementApproach: improvement.improvementApproach || '',
      futurePreventionMeasures: improvement.futurePreventionMeasures || '',
      implementationDate: improvement.implementationDate
        ? new Date(improvement.implementationDate).toISOString().split('T')[0]
        : '',
      followUpResponsibleType: improvement.followUpResponsibleType || 'Employee',
      followUpResponsible: improvement.followUpResponsible || '',
      followUpReference: improvement.followUpReference?._id || improvement.followUpReference || '',
      followUpDate: improvement.followUpDate ? new Date(improvement.followUpDate).toISOString().split('T')[0] : '',
      implementationResults: improvement.implementationResults || '',
      problemsDuringImplementation: improvement.problemsDuringImplementation || '',
      reportFile: null,
      planFile: null,
      evidenceFile: null,
      auditFile: null
    })

    // ตั้งค่า problemEntries
    if (improvement.problemDetails && improvement.problemDetails.length > 0) {
      const entries = improvement.problemDetails.map((detail, index) => ({
        id: Date.now() + index,
        source: detail.source || improvement.problemSource || '',
        description: detail.description || ''
      }))
      setProblemEntries(entries)
    } else {
      setProblemEntries([{ id: Date.now(), source: improvement.problemSource || '', description: '' }])
    }
  }

  // บันทึกข้อมูล
  const handleSave = async () => {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!formData.title || !formData.responsiblePerson) {
      showSnackbar('กรุณากรอกวันที่รายงานและผู้รับผิดชอบ', 'error')
      return
    }

    setLoading(true)
    try {
      const formDataObj = new FormData()

      // เพิ่มข้อมูลทั่วไป
      formDataObj.append('title', formData.title)
      formDataObj.append('responsibleType', formData.responsibleType)
      formDataObj.append('responsiblePerson', formData.responsiblePerson)
      formDataObj.append('responsibleReference', formData.responsibleReference)

      // รวมข้อมูลปัญหาจาก problemEntries
      // เก็บ source จากรายการแรก
      formDataObj.append('problemSource', problemEntries[0]?.source || '')

      // แปลง problemEntries เป็น problemDetails เพื่อส่งไป API
      const problemDetails = problemEntries.map(entry => ({
        description: entry.description
      }))
      formDataObj.append('problemDetails', JSON.stringify(problemDetails))

      formDataObj.append('severityLevel', formData.severityLevel)
      formDataObj.append('rootCause', formData.rootCause)
      formDataObj.append('improvementApproach', formData.improvementApproach)
      formDataObj.append('futurePreventionMeasures', formData.futurePreventionMeasures)
      formDataObj.append('implementationDate', formData.implementationDate)
      formDataObj.append('followUpResponsibleType', formData.followUpResponsibleType)
      formDataObj.append('followUpResponsible', formData.followUpResponsible)
      formDataObj.append('followUpReference', formData.followUpReference)
      formDataObj.append('followUpDate', formData.followUpDate)
      formDataObj.append('implementationResults', formData.implementationResults)
      formDataObj.append('problemsDuringImplementation', formData.problemsDuringImplementation)

      // เพิ่มไฟล์
      if (formData.reportFile) formDataObj.append('reportFile', formData.reportFile)
      if (formData.planFile) formDataObj.append('planFile', formData.planFile)
      if (formData.evidenceFile) formDataObj.append('evidenceFile', formData.evidenceFile)
      if (formData.auditFile) formDataObj.append('auditFile', formData.auditFile)

      let response
      if (formData.id) {
        // อัปเดตข้อมูลที่มีอยู่
        response = await fetch(`${API_BASE_URL}/10IMPROV/continual-improvement/${formData.id}`, {
          method: 'PUT',
          body: formDataObj
        })
      } else {
        // สร้างข้อมูลใหม่
        response = await fetch(`${API_BASE_URL}/10IMPROV/continual-improvement/create`, {
          method: 'POST',
          body: formDataObj
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Success:', data)

      // รีเฟรชข้อมูล
      await fetchImprovements()
      resetForm()
      showSnackbar('บันทึกข้อมูลเรียบร้อย', 'success')
    } catch (error) {
      console.error('Error saving data:', error)
      showSnackbar('ไม่สามารถบันทึกข้อมูลได้: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // รีเซ็ตฟอร์ม
  const resetForm = () => {
    setFormData({
      title: '',
      responsibleType: 'Employee',
      responsiblePerson: '',
      responsibleReference: '',
      problemSource: '',
      severityLevel: 'ต่ำ (Low)',
      rootCause: '',
      improvementApproach: '',
      futurePreventionMeasures: '',
      implementationDate: '',
      followUpResponsibleType: 'Employee',
      followUpResponsible: '',
      followUpReference: '',
      followUpDate: '',
      implementationResults: '',
      problemsDuringImplementation: '',
      reportFile: null,
      planFile: null,
      evidenceFile: null,
      auditFile: null,
      id: null
    })
    setProblemEntries([{ id: Date.now(), source: '', description: '' }])
  }

  // แสดง snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    })
  }

  // ปิด snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // ลบรายการ
  const handleDelete = async id => {
    if (!id) return

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/10IMPROV/continual-improvement/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      // รีเฟรชข้อมูล
      await fetchImprovements()
      showSnackbar('ลบข้อมูลเรียบร้อย', 'success')
    } catch (error) {
      console.error('Error deleting data:', error)
      showSnackbar('ไม่สามารถลบข้อมูลได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Component สำหรับอัปโหลดไฟล์
  const FileUploadField = ({ label, file, onChange, existingFile }) => {
    const hasExistingFile = existingFile && existingFile.fileName

    return (
      <TextField
        fullWidth
        variant='outlined'
        placeholder={label}
        value={file ? file.name : hasExistingFile ? existingFile.fileName : ''}
        InputProps={{
          readOnly: true,
          startAdornment: hasExistingFile && (
            <InputAdornment position='start'>
              <IconButton size='small' color='primary'>
                <DescriptionIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton component='label'>
                <CloudUploadIcon />
                <input type='file' hidden onChange={onChange} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    )
  }
  return (
    <div className='p-6 shadow-lg rounded-lg  mx-auto'>
      <h2 className='text-xl font-bold text-center'>Clause 10: Improvement</h2>
      <p className='text-center text-gray-600 mb-4'>10.2 Continuous Improvement</p>
      <Box sx={{ mb: 4 }}>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='continual-improvement-content'
            id='continual-improvement-header'
          ></AccordionSummary>
          <AccordionDetails>
            <Paper variant='outlined' sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
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

              <Grid container spacing={2}>
                {/* วันที่รายงาน */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    วันที่รายงาน
                  </Typography>
                  <TextField
                    fullWidth
                    type='date'
                    name='title'
                    value={formData.title}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: <InputAdornment position='end'></InputAdornment>
                    }}
                  />
                </Grid>

                {/* ผู้รับผิดชอบ */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    ผู้รับผิดชอบ
                  </Typography>
                  <FormControl fullWidth>
                    <Select value={formData.responsibleType} onChange={handleResponsibleTypeChange}>
                      <MenuItem value='Employee'>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>Employee</Box>
                      </MenuItem>
                      <MenuItem value='Department'>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>Department</Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {formData.responsibleType === 'Employee' ? (
                    <Autocomplete
                      options={employees}
                      getOptionLabel={option => `${option.name} (${option.employeeId}) - ${option.position}`}
                      renderInput={params => (
                        <TextField {...params} fullWidth margin='normal' placeholder='Select an employee' />
                      )}
                      onChange={handleResponsibleChange}
                      value={employees.find(emp => formData.responsibleReference === emp.id) || null}
                    />
                  ) : (
                    <Autocomplete
                      options={departments}
                      getOptionLabel={option => `${option.name} (${option.deptId})`}
                      renderInput={params => (
                        <TextField {...params} fullWidth margin='normal' placeholder='Select a department' />
                      )}
                      onChange={handleResponsibleChange}
                      value={departments.find(dept => formData.responsibleReference === dept.id) || null}
                    />
                  )}
                </Grid>

                {/* แหล่งที่มาของปัญหาและคำอธิบายปัญหา */}
                <Grid item xs={12}>
                  <Typography variant='subtitle2' gutterBottom>
                    ปัญหาที่พบ
                  </Typography>
                  {problemEntries.map((entry, index) => (
                    <Box key={entry.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant='body2' gutterBottom>
                            แหล่งที่มาของปัญหา
                          </Typography>
                          <TextField
                            fullWidth
                            value={entry.source}
                            onChange={e => updateProblemEntry(entry.id, 'source', e.target.value)}
                            placeholder='ระบุแหล่งที่มาของปัญหา'
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box display='flex' justifyContent='space-between'>
                            <Typography variant='body2' gutterBottom>
                              คำอธิบายปัญหา
                            </Typography>
                            {problemEntries.length > 1 && (
                              <IconButton size='small' color='error' onClick={() => removeProblemEntry(entry.id)}>
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            )}
                          </Box>
                          <TextField
                            fullWidth
                            value={entry.description}
                            onChange={e => updateProblemEntry(entry.id, 'description', e.target.value)}
                            placeholder='ระบุรายละเอียดของปัญหาที่พบ'
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button
                    variant='outlined'
                    color='primary'
                    startIcon={<AddIcon />}
                    onClick={addProblemEntry}
                    sx={{ mt: 1 }}
                  >
                    Add
                  </Button>
                </Grid>

                {/* ระดับความรุนแรงของปัญหา */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    ระดับความรุนแรงของปัญหา
                  </Typography>
                  <FormControl fullWidth>
                    <Select value={formData.severityLevel} onChange={handleInputChange} name='severityLevel'>
                      <MenuItem value='ต่ำ (Low)'>ต่ำ (Low)</MenuItem>
                      <MenuItem value='ปานกลาง (Medium)'>ปานกลาง (Medium)</MenuItem>
                      <MenuItem value='สูง (High)'>สูง (High)</MenuItem>
                      <MenuItem value='วิกฤต (Critical)'>วิกฤต (Critical)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* สาเหตุของปัญหา */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    สาเหตุของปัญหา
                  </Typography>
                  <TextField
                    fullWidth
                    name='rootCause'
                    value={formData.rootCause}
                    onChange={handleInputChange}
                    placeholder='ระบุผลการวิเคราะห์สาเหตุของปัญหาที่พบ'
                  />
                </Grid>

                {/* แนวทางแก้ไขปัญหา */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    แนวทางแก้ไขปัญหา
                  </Typography>
                  <TextField
                    fullWidth
                    name='improvementApproach'
                    value={formData.improvementApproach}
                    onChange={handleInputChange}
                  />
                </Grid>

                {/* แนวทางป้องกันปัญหาในอนาคต */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    แนวทางป้องกันปัญหาในอนาคต
                  </Typography>
                  <TextField
                    fullWidth
                    name='futurePreventionMeasures'
                    value={formData.futurePreventionMeasures}
                    onChange={handleInputChange}
                    placeholder='User/Department'
                  />
                </Grid>

                {/* กำหนดการดำเนินการ */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    กำหนดการดำเนินการ
                  </Typography>
                  <TextField
                    fullWidth
                    type='date'
                    name='implementationDate'
                    value={formData.implementationDate}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: <InputAdornment position='end'></InputAdornment>
                    }}
                  />
                </Grid>

                {/* ผู้รับผิดชอบในการติดตามผล */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    ผู้รับผิดชอบในการติดตามผล
                  </Typography>
                  <FormControl fullWidth>
                    <Select value={formData.followUpResponsibleType} onChange={handleFollowUpTypeChange}>
                      <MenuItem value='Employee'>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>Employee</Box>
                      </MenuItem>
                      <MenuItem value='Department'>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>Department</Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {formData.followUpResponsibleType === 'Employee' ? (
                    <Autocomplete
                      options={employees}
                      getOptionLabel={option => `${option.name} (${option.employeeId}) - ${option.position}`}
                      renderInput={params => (
                        <TextField {...params} fullWidth margin='normal' placeholder='Select an employee' />
                      )}
                      onChange={handleFollowUpResponsibleChange}
                      value={employees.find(emp => formData.followUpReference === emp.id) || null}
                    />
                  ) : (
                    <Autocomplete
                      options={departments}
                      getOptionLabel={option => `${option.name} (${option.deptId})`}
                      renderInput={params => (
                        <TextField {...params} fullWidth margin='normal' placeholder='Select a department' />
                      )}
                      onChange={handleFollowUpResponsibleChange}
                      value={departments.find(dept => formData.followUpReference === dept.id) || null}
                    />
                  )}
                </Grid>

                {/* ระยะเวลาการติดตามผล */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    ระยะเวลาการติดตามผล
                  </Typography>
                  <TextField
                    fullWidth
                    type='date'
                    name='followUpDate'
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: <InputAdornment position='end'></InputAdornment>
                    }}
                  />
                </Grid>

                {/* ผลการดำเนินการ */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    ผลการดำเนินการ
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name='implementationResults'
                    value={formData.implementationResults}
                    onChange={handleInputChange}
                    placeholder='ระบุผลการดำเนินการตามแผนการปรับปรุง'
                  />
                </Grid>

                {/* ปัญหาที่พบระหว่างการดำเนินการ */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    ปัญหาที่พบระหว่างการดำเนินการ
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name='problemsDuringImplementation'
                    value={formData.problemsDuringImplementation}
                    onChange={handleInputChange}
                    placeholder='ระบุปัญหาหรืออุปสรรคที่พบระหว่างการดำเนินการ (ถ้ามี)'
                  />
                </Grid>

                {/* ไฟล์แนบ */}
                <Grid item xs={12}>
                  <Typography variant='subtitle2' gutterBottom>
                    ไฟล์แนบ
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' gutterBottom>
                        รายงานปัญหา
                      </Typography>
                      <FileUploadField
                        label='อัปโหลดรายงานปัญหา'
                        file={formData.reportFile}
                        onChange={e => handleFileChange(e, 'reportFile')}
                        existingFile={formData.id ? { fileName: 'Existing Report File' } : null}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' gutterBottom>
                        แผนการดำเนินการ
                      </Typography>
                      <FileUploadField
                        label='อัปโหลดแผนการดำเนินการ'
                        file={formData.planFile}
                        onChange={e => handleFileChange(e, 'planFile')}
                        existingFile={formData.id ? { fileName: 'Existing Plan File' } : null}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' gutterBottom>
                        หลักฐานการดำเนินการ
                      </Typography>
                      <FileUploadField
                        label='อัปโหลดหลักฐานการดำเนินการ'
                        file={formData.evidenceFile}
                        onChange={e => handleFileChange(e, 'evidenceFile')}
                        existingFile={formData.id ? { fileName: 'Existing Evidence File' } : null}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' gutterBottom>
                        ผลการตรวจสอบ
                      </Typography>
                      <FileUploadField
                        label='อัปโหลดผลการตรวจสอบ'
                        file={formData.auditFile}
                        onChange={e => handleFileChange(e, 'auditFile')}
                        existingFile={formData.id ? { fileName: 'Existing Audit File' } : null}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* ปุ่มบันทึกและยกเลิก */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button variant='contained' color='inherit' onClick={resetForm}>
                      ยกเลิก
                    </Button>
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      บันทึก
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* รายการปรับปรุงที่มีอยู่ */}
            <Paper variant='outlined' sx={{ p: 3, borderRadius: 2, mt: 3 }}>
              <Typography variant='h6' gutterBottom>
                รายการการปรับปรุงอย่างต่อเนื่อง
              </Typography>

              {improvements.length === 0 ? (
                <Typography variant='body1' color='text.secondary' textAlign='center' py={3}>
                  ไม่พบข้อมูลการปรับปรุงอย่างต่อเนื่อง
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {improvements.map(improvement => (
                    <Grid item xs={12} md={6} key={improvement._id}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                              {new Date(improvement.title).toLocaleDateString('th-TH')}
                            </Typography>
                            <Box>
                              <IconButton size='small' color='primary' onClick={() => editImprovement(improvement)}>
                                <EditIcon fontSize='small' />
                              </IconButton>
                              <IconButton size='small' color='error' onClick={() => handleDelete(improvement._id)}>
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Box>
                          </Box>

                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            <strong>ผู้รับผิดชอบ:</strong> {improvement.responsiblePerson}
                          </Typography>

                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            <strong>แหล่งที่มาของปัญหา:</strong> {improvement.problemSource}
                          </Typography>

                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            <strong>ระดับความรุนแรง:</strong> {improvement.severityLevel}
                          </Typography>

                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            <strong>กำหนดการดำเนินการ:</strong>{' '}
                            {improvement.implementationDate
                              ? new Date(improvement.implementationDate).toLocaleDateString('th-TH')
                              : 'ไม่ระบุ'}
                          </Typography>
                          {improvement.reportFile?.filePath && (
                            <p>
                              <strong>reportFile:</strong>{' '}
                              <a
                                href={`http://192.168.0.119:3000${improvement.reportFile.filePath.replace(/\\/g, '/')}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                style={{ color: 'blue', fontWeight: 'bold' }}
                              >
                                {improvement.reportFile.fileName || 'Download'}
                              </a>
                            </p>
                          )}
                          {improvement.planFile?.filePath && (
                            <p>
                              <strong>planFile:</strong>{' '}
                              <a
                                href={`http://192.168.0.119:3000${improvement.planFile.filePath.replace(/\\/g, '/')}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                style={{ color: 'blue', fontWeight: 'bold' }}
                              >
                                {improvement.planFile.fileName || 'Download'}
                              </a>
                            </p>
                          )}
                          {improvement.evidenceFile?.filePath && (
                            <p>
                              <strong>evidenceFile:</strong>{' '}
                              <a
                                href={`http://192.168.0.119:3000${improvement.evidenceFile.filePath.replace(/\\/g, '/')}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                style={{ color: 'blue', fontWeight: 'bold' }}
                              >
                                {improvement.evidenceFile.fileName || 'Download'}
                              </a>
                            </p>
                          )}

                          {improvement.auditFile?.filePath && (
                            <p>
                              <strong>auditFile:</strong>{' '}
                              <a
                                href={`http://192.168.0.119:3000${improvement.auditFile.filePath.replace(/\\/g, '/')}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                style={{ color: 'blue', fontWeight: 'bold' }}
                              >
                                {improvement.auditFile.fileName || 'Download'}
                              </a>
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* Snackbar แสดงข้อความแจ้งเตือน */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </div>
  )
}

export default ContinualImprovement
