'use client'
import { useState, useEffect } from 'react'
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Checkbox,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Box
} from '@mui/material'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CancelIcon from '@mui/icons-material/Cancel'

export default function PerformanceEvaluation() {
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const [forms, setForms] = useState([
    {
      meetingTopic: '',
      meetingParticipants: [],
      meetingDate: '',
      reviewPlan: '',
      additionalConcerns: [],
      responsiblePerson: '',
      responsibleType: '',
      dueDate: '',
      meetingReportFile: null,
      kpiReportFile: null,
      ismsImprovementFile: null,
      findingsFile: null,
      meetingReportFileName: '',
      kpiReportFileName: '',
      ismsImprovementFileName: '',
      findingsFileName: ''
    }
  ])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/9PE/managementReview/')
      const result = await response.json()

      if (result.data) {
        const formattedData = result.data.map(record => ({
          _id: record._id,
          meetingTopic: record.meetingTopic || '',
          meetingParticipants: record.meetingParticipants || [],
          meetingDate: record.meetingDate ? record.meetingDate.split('T')[0] : '',
          reviewPlan: record.reviewPlan || '',
          additionalConcerns: record.additionalConcerns || [],
          responsiblePerson: record.responsiblePerson ? record.responsiblePerson._id : '',
          responsibleType: record.responsibleType || '',
          dueDate: record.dueDate ? record.dueDate.split('T')[0] : '',
          meetingReportFileName: record.meetingReportFile || '',
          kpiReportFileName: record.kpiReportFile || '',
          ismsImprovementFileName: record.ismsImprovementFile || '',
          findingsFileName: record.findingsFile || ''
        }))

        setForms(formattedData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleChange = (index, field, value) => {
    setForms(prevForms =>
      prevForms.map((form, i) => {
        if (i === index) {
          return { ...form, [field]: value === undefined ? '' : value }
        }
        return form
      })
    )
  }

  const handleFileChange = (index, field, event) => {
    const file = event.target.files[0]

    if (file) {
      setForms(prevForms =>
        prevForms.map((form, i) =>
          i === index
            ? {
                ...form,
                [field]: file,
                [`${field}Name`]: file.name
              }
            : form
        )
      )
      console.log(`📂 [handleFileChange] ${field} updated:`, file.name)
    } else {
      console.log(`❌ [handleFileChange] No file selected for ${field}`)
    }
  }

  const handleAddForm = () => {
    setForms(prevForms => [
      ...prevForms,
      {
        _id: undefined,
        meetingTopic: '',
        meetingParticipants: [],
        meetingDate: '',
        reviewPlan: '',
        additionalConcerns: [],
        responsiblePerson: '',
        responsibleType: '',
        dueDate: '',
        meetingReportFile: null,
        kpiReportFile: null,
        ismsImprovementFile: null,
        findingsFile: null,
        meetingReportFileName: '',
        kpiReportFileName: '',
        ismsImprovementFileName: '',
        findingsFileName: ''
      }
    ])
  }

  const handleRemoveForm = index => {
    if (forms.length > 1) {
      setForms(forms.filter((_, i) => i !== index))
    }
  }

  const handleSave = async index => {
    console.log('Saving data...')

    const form = forms[index]
    const isEditing = form._id !== undefined

    const formData = new FormData()

    // Prepare data for sending
    const concernsStr = JSON.stringify(
      Array.isArray(form.additionalConcerns) ? form.additionalConcerns : [form.additionalConcerns]
    )
    const participantsStr = JSON.stringify(
      Array.isArray(form.meetingParticipants) ? form.meetingParticipants : [form.meetingParticipants]
    )

    formData.append('meetingTopic', form.meetingTopic || '')
    formData.append('meetingParticipants', participantsStr)
    formData.append('meetingDate', form.meetingDate || '')
    formData.append('reviewPlan', form.reviewPlan || '')
    formData.append('additionalConcerns', concernsStr)
    formData.append('responsiblePerson', form.responsiblePerson || '')
    formData.append('responsibleType', form.responsibleType || '')
    formData.append('dueDate', form.dueDate || '')

    // Handle file uploads
    if (form.meetingReportFile instanceof File) {
      formData.append('meetingReportFile', form.meetingReportFile)
    }
    if (form.kpiReportFile instanceof File) {
      formData.append('kpiReportFile', form.kpiReportFile)
    }
    if (form.ismsImprovementFile instanceof File) {
      formData.append('ismsImprovementFile', form.ismsImprovementFile)
    }
    if (form.findingsFile instanceof File) {
      formData.append('findingsFile', form.findingsFile)
    }

    try {
      const url = isEditing
        ? `https://ismsp-backend.onrender.com/api/9PE/managementReview/${form._id}`
        : 'https://ismsp-backend.onrender.com/api/9PE/managementReview/create'

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      const result = await response.json()
      console.log('Server response:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save data')
      }

      setOpenSnackbar(true)
      await fetchAllData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async id => {
    if (!id) {
      console.error('❌ ไม่มี ID สำหรับลบข้อมูล')
      return
    }

    const confirmDelete = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/9PE/managementReview/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      console.log('🗑 ผลลัพธ์จากเซิร์ฟเวอร์:', result)

      if (!response.ok) {
        throw new Error(result.message || 'ลบข้อมูลไม่สำเร็จ')
      }

      setForms(prevForms => prevForms.filter(form => form._id !== id))
      setOpenSnackbar(true)
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการลบ:', error)
    }
  }

  return (
    <div className='p-10 max-w-4x5 mx-auto  rounded-lg shadow-lg'>
      <h2 className='text-xl font-bold text-center'>Clause 9: Performance Evaluation</h2>
      <p className='text-center text-gray-600 mb-5'>การทบทวนโดยฝ่ายบริหาร (Management Review)</p>

      {forms.map((form, index) => {
        return (
          <Box
            key={index}
            sx={{
              border: '2px solid #888',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '100px',
              position: 'relative',
              width: '100%'
            }}
          >
            {forms.length > 1 && (
              <IconButton
                onClick={() => handleDelete(form._id)}
                sx={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-15px',
                  fontSize: '1.5rem',
                  color: 'red',
                  backgroundColor: '#ddd',
                  padding: '5px',
                  '&:hover': { backgroundColor: 'error', color: 'error' }
                }}
                color='error'
              >
                <CancelIcon />
              </IconButton>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='หัวข้อที่ประชุม'
                  fullWidth
                  value={form.meetingTopic || ''}
                  onChange={e => handleChange(index, 'meetingTopic', e.target.value)}
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ผู้เข้าร่วมการประชุม
                  </InputLabel>
                  <Select
                    multiple
                    value={form.meetingParticipants || []}
                    onChange={e => handleChange(index, 'meetingParticipants', e.target.value)}
                    renderValue={selected => (Array.isArray(selected) ? selected.join(', ') : selected)}
                  >
                    {['CEO', 'CIO', 'CISO', 'Compliance Team', 'IT Security', 'HR', 'Finance'].map(option => (
                      <MenuItem key={option} value={option}>
                        <Checkbox
                          checked={Array.isArray(form.meetingParticipants) && form.meetingParticipants.includes(option)}
                        />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='วันที่ประชุม'
                  type='date'
                  value={form.meetingDate || ''}
                  onChange={e => handleChange(index, 'meetingDate', e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ประเภทผู้รับผิดชอบ
                  </InputLabel>
                  <Select
                    value={form.responsibleType || ''}
                    onChange={e => handleChange(index, 'responsibleType', e.target.value)}
                  >
                    <MenuItem value='Employee'>พนักงาน</MenuItem>
                    <MenuItem value='Department'>แผนก</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ผู้รับผิดชอบ
                  </InputLabel>
                  <Select
                    value={form.responsiblePerson || ''}
                    onChange={e => handleChange(index, 'responsiblePerson', e.target.value)}
                  >
                    <MenuItem value='60a5d5d5f1e3a81f3c9b35b1'>IT Security</MenuItem>
                    <MenuItem value='60a5d5d5f1e3a81f3c9b35b2'>Compliance</MenuItem>
                    <MenuItem value='60a5d5d5f1e3a81f3c9b35b3'>HR</MenuItem>
                    <MenuItem value='60a5d5d5f1e3a81f3c9b35b4'>Finance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='แผนดำเนินการและข้อเสนอแนะ'
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={10}
                  inputProps={{ style: { resize: 'vertical' } }}
                  value={form.reviewPlan || ''}
                  onChange={e => handleChange(index, 'reviewPlan', e.target.value)}
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ประเด็นที่ต้องดำเนินการเพิ่มเติม
                  </InputLabel>
                  <Select
                    multiple
                    value={form.additionalConcerns || []}
                    onChange={e => handleChange(index, 'additionalConcerns', e.target.value)}
                    renderValue={selected => (Array.isArray(selected) ? selected.join(', ') : selected)}
                  >
                    {['ปรับปรุงนโยบาย', 'เพิ่มการฝึกอบรม', 'ปรับปรุงกระบวนการ', 'เพิ่มมาตรการความปลอดภัย'].map(
                      option => (
                        <MenuItem key={option} value={option}>
                          <Checkbox
                            checked={Array.isArray(form.additionalConcerns) && form.additionalConcerns.includes(option)}
                          />
                          <ListItemText primary={option} />
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='กำหนดระยะเวลาดำเนินการ'
                  type='date'
                  value={form.dueDate || ''}
                  onChange={e => handleChange(index, 'dueDate', e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} className='mt-4'>
              <Grid item xs={6} className='mt-5'>
                <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                  รายงานการประชุม
                  <input type='file' hidden onChange={e => handleFileChange(index, 'meetingReportFile', e)} />
                </Button>
                <TextField
                  fullWidth
                  margin='dense'
                  value={form.meetingReportFileName || ''}
                  placeholder='ชื่อไฟล์'
                  disabled
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                  รายงาน KPI
                  <input type='file' hidden onChange={e => handleFileChange(index, 'kpiReportFile', e)} />
                </Button>
                <TextField
                  fullWidth
                  margin='dense'
                  value={form.kpiReportFileName || ''}
                  placeholder='ชื่อไฟล์'
                  disabled
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                  แนวทางปรับปรุง ISMS
                  <input type='file' hidden onChange={e => handleFileChange(index, 'ismsImprovementFile', e)} />
                </Button>
                <TextField
                  fullWidth
                  margin='dense'
                  value={form.ismsImprovementFileName || ''}
                  placeholder='ชื่อไฟล์'
                  disabled
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                  บันทึกข้อผิดพลาดที่พบ
                  <input type='file' hidden onChange={e => handleFileChange(index, 'findingsFile', e)} />
                </Button>
                <TextField
                  fullWidth
                  margin='dense'
                  value={form.findingsFileName || ''}
                  placeholder='ชื่อไฟล์'
                  disabled
                />
              </Grid>
            </Grid>

            <div className='flex justify-between mt-6'>
              <Button onClick={() => handleSave(index)} variant='contained' color='primary'>
                {form._id ? 'อัปเดต' : 'บันทึก'}
              </Button>
            </div>
          </Box>
        )
      })}

      <Button startIcon={<AddCircleOutline />} onClick={handleAddForm} variant='contained' className='mt-2'>
        เพิ่มฟอร์ม
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity='success'
          sx={{
            width: '100%',
            opacity: 0.9,
            backgroundColor: 'rgba(0, 226, 68, 0.9)',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          บันทึกข้อมูลสำเร็จ!
        </Alert>
      </Snackbar>
    </div>
  )
}
