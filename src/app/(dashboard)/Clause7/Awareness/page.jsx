'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'

const API_BASE_URL = 'http://192.168.0.119:3000/api'

const Awareness = () => {
  const [employees, setEmployees] = useState([])
  const [allEmployees, setAllEmployees] = useState([])
  const [awarenessRecords, setAwarenessRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [newTrainingRecord, setNewTrainingRecord] = useState({
    employeeId: '',
    trainingTitle: '',
    ismsTraining: '',
    trainingDate: ''
  })

  useEffect(() => {
    fetchEmployees()
    fetchTrainings()
    fetchAwarenessRecords()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/employee`)
      const data = await res.json()
      setAllEmployees(data.data || [])
    } catch (err) {
      console.error('Error fetching employee list:', err)
      showSnackbar('ไม่สามารถดึงข้อมูลพนักงานได้', 'error')
    }
  }

  const fetchTrainings = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/7SUPP/awareness/training`)
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const data = await res.json()

      if (data.data && Array.isArray(data.data)) {
        console.log('Training data:', data.data) // Debug line

        // Map through the training data to check for populated employee info
        const trainingData = data.data.map(training => {
          // If training.employeeId is an object with just _id and no name,
          // convert it to a string ID for easier handling
          if (
            typeof training.employeeId === 'object' &&
            training.employeeId !== null &&
            training.employeeId._id &&
            !training.employeeId.name
          ) {
            return {
              ...training,
              employeeId: training.employeeId._id
            }
          }
          return training
        })

        setEmployees(trainingData)
      } else {
        setEmployees([])
      }
    } catch (err) {
      console.error('Error fetching trainings:', err)
      showSnackbar('ไม่สามารถดึงข้อมูลการฝึกอบรมได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchAwarenessRecords = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/7SUPP/awareness/records`)
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const data = await res.json()
      setAwarenessRecords(data.data || [])
    } catch (err) {
      console.error('Error fetching awareness records:', err)
      showSnackbar('ไม่สามารถดึงข้อมูลบันทึกการตระหนักรู้ได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setNewTrainingRecord(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addEmployeeTraining = async () => {
    try {
      setLoading(true)

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!newTrainingRecord.employeeId || !newTrainingRecord.trainingTitle || !newTrainingRecord.trainingDate) {
        showSnackbar('กรุณากรอกข้อมูลให้ครบ', 'error')
        return
      }

      const res = await fetch(`${API_BASE_URL}/7SUPP/awareness/training/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrainingRecord)
      })

      if (!res.ok) throw new Error(`Save failed: ${res.status}`)

      showSnackbar('บันทึกข้อมูลการฝึกอบรมสำเร็จ', 'success')

      // รีเซ็ตฟอร์ม
      setNewTrainingRecord({
        employeeId: '',
        trainingTitle: '',
        ismsTraining: '',
        trainingDate: ''
      })

      // โหลดข้อมูลใหม่
      fetchTrainings()
    } catch (err) {
      console.error('Error adding training:', err)
      showSnackbar('ไม่สามารถบันทึกข้อมูลการฝึกอบรมได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteTraining = async id => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/7SUPP/awareness/training/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)

      showSnackbar('ลบข้อมูลการฝึกอบรมสำเร็จ', 'success')
      fetchTrainings()
    } catch (err) {
      console.error('Error deleting training:', err)
      showSnackbar('ไม่สามารถลบข้อมูลการฝึกอบรมได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (type, files) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('topicName', `${type.charAt(0).toUpperCase() + type.slice(1)} Topic`)

      // ตรวจสอบประเภทไฟล์ และแนบไฟล์ตามชนิด
      switch (type) {
        case 'exam':
          if (files.length !== 1) {
            showSnackbar('กรุณาเลือกไฟล์เพียง 1 ไฟล์', 'error')
            return
          }
          formData.append('scoreFile', files[0])
          break
        case 'training':
          Array.from(files).forEach(file => {
            formData.append('trainingPlanFiles', file)
          })
          break
        case 'incident':
          Array.from(files).forEach(file => {
            formData.append('incidentResponseFiles', file)
          })
          break
        case 'threat':
          Array.from(files).forEach(file => {
            formData.append('threatNotificationFiles', file)
          })
          break
        default:
          showSnackbar('ประเภทไฟล์ไม่ถูกต้อง', 'error')
          return
      }

      const res = await fetch(`${API_BASE_URL}/7SUPP/awareness/${type}`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)

      showSnackbar('อัปโหลดไฟล์สำเร็จ', 'success')
      fetchAwarenessRecords()
    } catch (err) {
      console.error(`Error uploading ${type} file:`, err)
      showSnackbar(`ไม่สามารถอัปโหลดไฟล์ ${type} ได้`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (recordId, type, filePath) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/7SUPP/awareness/file`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: recordId,
          type,
          filePath
        })
      })

      if (!res.ok) throw new Error(`Delete file failed: ${res.status}`)

      showSnackbar('ลบไฟล์สำเร็จ', 'success')
      fetchAwarenessRecords()
    } catch (err) {
      console.error('Error deleting file:', err)
      showSnackbar('ไม่สามารถลบไฟล์ได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // ฟังก์ชันสำหรับแสดงชื่อพนักงานในรูปแบบ "ชื่อ - แผนก"
  const formatEmployeeDisplay = employee => {
    if (!employee) return 'ไม่พบข้อมูลพนักงาน'

    let departmentText = 'ไม่ระบุแผนก'

    if (employee.department) {
      if (typeof employee.department === 'object' && employee.department.name) {
        departmentText = employee.department.name
      } else if (typeof employee.department === 'string') {
        departmentText = employee.department
      }
    } else if (employee.position) {
      departmentText = employee.position
    }

    return `${employee.name} - ${departmentText}`
  }

  // ฟังก์ชันสำหรับค้นหาและแสดงชื่อพนักงานจาก ID
  const getEmployeeName = employeeId => {
    // ถ้า employeeId เป็น object ที่มีข้อมูลแล้ว (populated from backend)
    if (typeof employeeId === 'object' && employeeId !== null && employeeId.name) {
      return formatEmployeeDisplay(employeeId)
    }

    // ถ้าเป็น ID ต้องค้นหาจากรายชื่อพนักงานทั้งหมด
    const employee = allEmployees.find(emp => emp._id === employeeId)
    if (employee) {
      return formatEmployeeDisplay(employee)
    }

    return 'ไม่พบข้อมูลพนักงาน'
  }

  // กรองข้อมูล AwarenessRecords ตามประเภท
  const getRecordsByType = type => {
    return awarenessRecords.filter(record => {
      switch (type) {
        case 'exam':
          return record.scoreFile
        case 'training':
          return record.trainingPlanFiles && record.trainingPlanFiles.length > 0
        case 'incident':
          return record.incidentResponseFiles && record.incidentResponseFiles.length > 0
        case 'threat':
          return record.threatNotificationFiles && record.threatNotificationFiles.length > 0
        default:
          return false
      }
    })
  }

  const formatDate = dateString => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <Box p={4} position='relative'>
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
          bgcolor='rgba(255,255,255,0.7)'
          zIndex={10}
        >
          <CircularProgress />
        </Box>
      )}

      <Typography variant='h4' fontWeight='bold' align='center'>
        Clause 7: Awareness
      </Typography>
      <Divider sx={{ my: 3 }} />

      {/* หัวข้อการสอบ + คะแนนสอบ */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          หัวข้อการสอบ + คะแนนสอบ
        </Typography>
        <Button variant='contained' component='label' startIcon={<CloudUploadIcon />} sx={{ mt: 1, mb: 2 }}>
          อัปโหลดไฟล์
          <input type='file' hidden onChange={e => uploadFile('exam', e.target.files)} />
        </Button>

        <List>
          {getRecordsByType('exam').map(record => (
            <ListItem key={record._id} divider>
              <ListItemText primary={record.topicName} secondary={`อัปโหลดเมื่อ: ${formatDate(record.createdAt)}`} />
              <Typography variant='body2' color='text.secondary' sx={{ mx: 2 }}>
                {record.scoreFile}
              </Typography>
              <ListItemSecondaryAction>
                <IconButton
                  edge='end'
                  color='error'
                  onClick={() => deleteFile(record._id, 'scoreFile', record.scoreFile)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* แผนการฝึกอบรม */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          แผนการฝึกอบรม
        </Typography>
        <Button variant='contained' component='label' startIcon={<CloudUploadIcon />} sx={{ mt: 1, mb: 2 }}>
          อัปโหลดไฟล์
          <input type='file' hidden multiple onChange={e => uploadFile('training', e.target.files)} />
        </Button>

        <List>
          {getRecordsByType('training').map(record => (
            <ListItem key={record._id} divider>
              <ListItemText primary={record.topicName} secondary={`อัปโหลดเมื่อ: ${formatDate(record.createdAt)}`} />
              <Box ml={2}>
                {record.trainingPlanFiles.map((file, index) => (
                  <Box key={index} display='flex' alignItems='center' my={1}>
                    <Typography variant='body2' color='text.secondary'>
                      {file}
                    </Typography>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => deleteFile(record._id, 'trainingPlanFiles', file)}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* แนวทางปฏิบัติเมื่อเกิดเหตุการณ์ผิดปกติ */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          แนวทางปฏิบัติเมื่อเกิดเหตุการณ์ผิดปกติ
        </Typography>
        <Button variant='contained' component='label' startIcon={<CloudUploadIcon />} sx={{ mt: 1, mb: 2 }}>
          อัปโหลดไฟล์
          <input type='file' hidden multiple onChange={e => uploadFile('incident', e.target.files)} />
        </Button>

        <List>
          {getRecordsByType('incident').map(record => (
            <ListItem key={record._id} divider>
              <ListItemText primary={record.topicName} secondary={`อัปโหลดเมื่อ: ${formatDate(record.createdAt)}`} />
              <Box ml={2}>
                {record.incidentResponseFiles.map((file, index) => (
                  <Box key={index} display='flex' alignItems='center' my={1}>
                    <Typography variant='body2' color='text.secondary'>
                      {file}
                    </Typography>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => deleteFile(record._id, 'incidentResponseFiles', file)}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* เอกสารแจ้งเตือนภัยคุกคาม */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          เอกสารแจ้งเตือนภัยคุกคาม
        </Typography>
        <Button variant='contained' component='label' startIcon={<CloudUploadIcon />} sx={{ mt: 1, mb: 2 }}>
          อัปโหลดไฟล์
          <input type='file' hidden multiple onChange={e => uploadFile('threat', e.target.files)} />
        </Button>

        <List>
          {getRecordsByType('threat').map(record => (
            <ListItem key={record._id} divider>
              <ListItemText primary={record.topicName} secondary={`อัปโหลดเมื่อ: ${formatDate(record.createdAt)}`} />
              <Box ml={2}>
                {record.threatNotificationFiles.map((file, index) => (
                  <Box key={index} display='flex' alignItems='center' my={1}>
                    <Typography variant='body2' color='text.secondary'>
                      {file}
                    </Typography>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => deleteFile(record._id, 'threatNotificationFiles', file)}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* บันทึกการฝึกอบรมพนักงาน */}
      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          บันทึกการฝึกอบรมพนักงาน
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* ฟอร์มเพิ่มข้อมูลการฝึกอบรม */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id='employee-select-label'>พนักงาน</InputLabel>
              <Select
                labelId='employee-select-label'
                value={newTrainingRecord.employeeId}
                name='employeeId'
                label='พนักงาน'
                onChange={handleInputChange}
              >
                {allEmployees.map(employee => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {formatEmployeeDisplay(employee)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label='หัวข้อการฝึกอบรม'
              name='trainingTitle'
              value={newTrainingRecord.trainingTitle}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label='ISMS Training'
              name='ismsTraining'
              value={newTrainingRecord.ismsTraining}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type='date'
              label='วันที่อบรม'
              name='trainingDate'
              InputLabelProps={{ shrink: true }}
              value={newTrainingRecord.trainingDate}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={2} display='flex' alignItems='center'>
            <Button
              fullWidth
              variant='contained'
              color='primary'
              startIcon={<AddCircleOutline />}
              onClick={addEmployeeTraining}
            >
              เพิ่มข้อมูล
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* รายการข้อมูลการฝึกอบรม */}
        <Typography variant='subtitle1' fontWeight='medium' gutterBottom>
          รายการข้อมูลการฝึกอบรมทั้งหมด
        </Typography>

        <List>
          {employees.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ py: 2 }}>
              ไม่พบข้อมูลการฝึกอบรม
            </Typography>
          ) : (
            employees.map(training => (
              <ListItem key={training._id} divider>
                <ListItemText
                  primary={`${training.trainingTitle} ${training.ismsTraining ? `(${training.ismsTraining})` : ''}`}
                  secondary={
                    <>
                      <Typography component='span' variant='body2'>
                        พนักงาน: {getEmployeeName(training.employeeId)}
                      </Typography>
                      <br />
                      <Typography component='span' variant='body2'>
                        วันที่อบรม: {formatDate(training.trainingDate)}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge='end' color='error' onClick={() => deleteTraining(training._id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

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
  )
}

export default Awareness
