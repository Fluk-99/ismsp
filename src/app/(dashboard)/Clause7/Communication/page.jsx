'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Divider
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

const API_BASE_URL = 'https://ismsp-backend.onrender.com/api/7SUPP/communication'

const Communication = () => {
  const [communications, setCommunications] = useState([])
  const [isEditingGlobal, setIsEditingGlobal] = useState(true)
  const [files, setFiles] = useState({ ismsPlan: [], externalPolicy: [] })
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [showHistory, setShowHistory] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    fetchCommunications()
    fetchHistoryData()
  }, [])

  const fetchCommunications = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_BASE_URL)
      const data = await res.json()
      setCommunications(
        data.data.map(item => ({
          ...item,
          id: item._id,
          title: item.topic,
          communicationType: item.type.toLowerCase(),
          isEditing: false
        }))
      )
    } catch (error) {
      showSnackbar('โหลดข้อมูลไม่สำเร็จ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoryData = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch(API_BASE_URL)
      const data = await res.json()
      setHistoryData(data.data)
    } catch (error) {
      showSnackbar('โหลดข้อมูลประวัติไม่สำเร็จ', 'error')
    } finally {
      setHistoryLoading(false)
    }
  }

  const addCommunication = () => {
    setCommunications(prev => [
      ...prev,
      {
        id: Date.now(),
        title: '',
        date: '',
        communicationType: 'internal',
        channel: '',
        isEditing: true
      }
    ])
  }

  const updateCommunication = (id, key, value) => {
    setCommunications(prev => prev.map(comm => (comm.id === id ? { ...comm, [key]: value } : comm)))
  }

  const removeCommunication = async id => {
    try {
      if (typeof id === 'string' && id.length === 24) {
        const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error()
      }
      setCommunications(prev => prev.filter(comm => comm.id !== id))
      showSnackbar('ลบเรียบร้อยแล้ว')
      fetchHistoryData() // Refresh history after delete
    } catch {
      showSnackbar('ไม่สามารถลบข้อมูลได้', 'error')
    }
  }

  const toggleEditCommunication = async id => {
    const comm = communications.find(c => c.id === id)
    if (comm.isEditing) await saveCommunication(comm)
    setCommunications(prev => prev.map(comm => (comm.id === id ? { ...comm, isEditing: !comm.isEditing } : comm)))
  }

  const saveCommunication = async comm => {
    try {
      const payload = {
        topic: comm.title,
        date: comm.date,
        type: comm.communicationType === 'internal' ? 'Internal' : 'External',
        channel: comm.channel
      }

      let res
      if (typeof comm.id === 'string' && comm.id.length === 24) {
        res = await fetch(`${API_BASE_URL}/${comm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`${API_BASE_URL}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (!res.ok) throw new Error()
      showSnackbar('บันทึกสำเร็จ')
      fetchCommunications()
      fetchHistoryData() // Refresh history after save
    } catch {
      showSnackbar('ไม่สามารถบันทึกข้อมูลได้', 'error')
    }
  }

  const addFile = async (category, fileList) => {
    try {
      const file = fileList[0]
      const formData = new FormData()
      formData.append('file', file)

      const endpoint = category === 'ismsPlan' ? `${API_BASE_URL}/internal-plan` : `${API_BASE_URL}/external-policy`

      const res = await fetch(endpoint, { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        setFiles(prev => ({
          ...prev,
          [category]: [...prev[category], { name: file.name, path: data.filePath }]
        }))
        showSnackbar('อัปโหลดไฟล์สำเร็จ')
      } else {
        showSnackbar('อัปโหลดไม่สำเร็จ', 'error')
      }
    } catch {
      showSnackbar('เกิดข้อผิดพลาดระหว่างอัปโหลด', 'error')
    }
  }

  const removeFile = (category, index) => {
    setFiles(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }))
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  // Format date for display
  const formatDate = dateString => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch (error) {
      return dateString
    }
  }

  return (
    <Box p={4} borderRadius={2} boxShadow={3} position='relative'>
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
          bgcolor='rgba(255,255,255,0.5)'
          zIndex={10}
        >
          <CircularProgress />
        </Box>
      )}

      <Box display='flex' justifyContent='flex-end' mb={2}>
        <Button
          variant='contained'
          color={isEditingGlobal ? 'secondary' : 'warning'}
          onClick={() => setIsEditingGlobal(!isEditingGlobal)}
        >
          {isEditingGlobal ? 'Save All' : 'Edit All'}
        </Button>
      </Box>

      <Typography variant='h4' align='center' fontWeight='bold' gutterBottom>
        Clause 7: Communication
      </Typography>

      <Grid container spacing={3}>
        {communications.map(comm => (
          <Grid item xs={12} key={comm.id}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box display='flex' justifyContent='flex-end'>
                <IconButton
                  onClick={() => toggleEditCommunication(comm.id)}
                  color={comm.isEditing ? 'primary' : 'warning'}
                >
                  {comm.isEditing ? <SaveIcon /> : <EditIcon />}
                </IconButton>
                <IconButton onClick={() => removeCommunication(comm.id)} color='error'>
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='หัวข้อการสื่อสาร'
                    value={comm.title}
                    disabled={!comm.isEditing}
                    onChange={e => updateCommunication(comm.id, 'title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type='date'
                    label='วันที่สื่อสาร'
                    value={comm.date?.substring?.(0, 10)}
                    disabled={!comm.isEditing}
                    onChange={e => updateCommunication(comm.id, 'date', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    value={comm.communicationType}
                    disabled={!comm.isEditing}
                    onChange={e => updateCommunication(comm.id, 'communicationType', e.target.value)}
                  >
                    <MenuItem value='internal'>การสื่อสารภายใน</MenuItem>
                    <MenuItem value='external'>การสื่อสารภายนอก</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='ช่องทางที่ใช้สื่อสาร'
                    value={comm.channel}
                    disabled={!comm.isEditing}
                    onChange={e => updateCommunication(comm.id, 'channel', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button
            variant='contained'
            color='primary'
            onClick={addCommunication}
            startIcon={<AddCircleOutline />}
            sx={{ mt: 2 }}
          >
            Add Communication
          </Button>
        </Grid>

        {['ismsPlan', 'externalPolicy'].map((category, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant='h6' fontWeight='bold' gutterBottom>
                {category === 'ismsPlan' ? 'แผนการสื่อสาร ISMS' : 'นโยบายการสื่อสารภายนอก'}
              </Typography>

              {files[category]?.map((file, idx) => (
                <Box key={idx} display='flex' alignItems='center' justifyContent='space-between' mb={1}>
                  <Typography>{file.name}</Typography>
                  <IconButton color='error' onClick={() => removeFile(category, idx)}>
                    <RemoveCircleOutline />
                  </IconButton>
                </Box>
              ))}

              <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />} disabled={!isEditingGlobal}>
                Upload File
                <input type='file' hidden onChange={e => addFile(category, e.target.files)} />
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Communication History Section */}
      <Box mt={5}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            onClick={() => setShowHistory(!showHistory)}
            sx={{ cursor: 'pointer' }}
          >
            <Typography variant='h5' fontWeight='bold'>
              Communication History
            </Typography>
            <IconButton>{showHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
          </Box>

          <Collapse in={showHistory}>
            <Divider sx={{ my: 2 }} />

            {historyLoading ? (
              <Box display='flex' justifyContent='center' p={3}>
                <CircularProgress />
              </Box>
            ) : historyData.length === 0 ? (
              <Typography align='center' color='text.secondary' p={3}>
                ไม่พบข้อมูลการสื่อสาร
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>หัวข้อการสื่อสาร</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>วันที่สื่อสาร</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ประเภท</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ช่องทาง</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>วันที่บันทึก</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyData.map(item => (
                      <TableRow key={item._id} hover>
                        <TableCell>{item.topic}</TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.channel}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box display='flex' justifyContent='center' mt={2}>
              <Button
                variant='outlined'
                color='primary'
                onClick={fetchHistoryData}
                startIcon={historyLoading ? <CircularProgress size={20} /> : null}
                disabled={historyLoading}
              >
                Refresh Data
              </Button>
            </Box>
          </Collapse>
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Communication
