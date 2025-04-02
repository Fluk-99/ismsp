'use client'
import { useState, useEffect } from 'react'
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Box,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material'

// Icons
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoIcon from '@mui/icons-material/Info'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'

export default function AuditChecklist() {
  // State variables
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentChecklist, setCurrentChecklist] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogMode, setDialogMode] = useState('create') // 'create', 'edit'
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    checklistName: '',
    auditStandards: '',
    auditTools: '',
    questions: [{ topic: '', description: '', expectedOutcome: '' }]
  })

  // Load checklists on component mount
  useEffect(() => {
    fetchChecklists()
  }, [])

  // Fetch all checklists from API
  const fetchChecklists = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://192.168.0.119:3000/api/9PE/audit-checklist/')

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()

      if (result.data) {
        setChecklists(result.data)
      }
    } catch (error) {
      console.error('Error loading checklists:', error)
      setSnackbarMessage(`เกิดข้อผิดพลาดในการโหลดชุดคำถาม: ${error.message}`)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  // Filter checklists based on search term
  const filteredChecklists = checklists.filter(checklist =>
    checklist.checklistName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle opening create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      checklistName: '',
      auditStandards: '',
      auditTools: '',
      questions: [{ topic: '', description: '', expectedOutcome: '' }]
    })
    setDialogMode('create')
    setOpenDialog(true)
  }

  // Handle opening edit dialog
  const handleOpenEditDialog = checklist => {
    setCurrentChecklist(checklist)
    setFormData({
      checklistName: checklist.checklistName,
      auditStandards: (checklist.auditStandards || []).join(', '),
      auditTools: (checklist.auditTools || []).join(', '),
      questions: checklist.questions || [{ topic: '', description: '', expectedOutcome: '' }]
    })
    setDialogMode('edit')
    setOpenDialog(true)
  }

  // Handle opening detail view dialog
  const handleOpenDetailDialog = checklist => {
    setCurrentChecklist(checklist)
    setOpenDetailDialog(true)
  }

  // Handle opening delete confirmation dialog
  const handleOpenDeleteDialog = checklist => {
    setCurrentChecklist(checklist)
    setOpenDeleteDialog(true)
  }

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Add a new question to the form
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { topic: '', description: '', expectedOutcome: '' }]
    }))
  }

  // Remove a question from the form
  const removeQuestion = index => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  // Handle changes to question fields
  const handleQuestionChange = (index, field, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
      return { ...prev, questions: updatedQuestions }
    })
  }

  // Handle form submission (create or edit)
  const handleSubmit = async () => {
    if (!formData.checklistName) {
      setSnackbarMessage('กรุณาระบุชื่อชุดคำถาม')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    if (formData.questions.length === 0 || !formData.questions[0].topic) {
      setSnackbarMessage('กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    // Check if all questions have a topic
    const invalidQuestions = formData.questions.filter(q => !q.topic.trim())
    if (invalidQuestions.length > 0) {
      setSnackbarMessage('กรุณาระบุหัวข้อคำถามให้ครบทุกข้อ')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    try {
      // Prepare data for API
      const auditStandards = formData.auditStandards
        ? formData.auditStandards
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
        : []

      const auditTools = formData.auditTools
        ? formData.auditTools
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
        : []

      const payload = {
        checklistName: formData.checklistName,
        auditStandards: JSON.stringify(auditStandards),
        auditTools: JSON.stringify(auditTools),
        questions: JSON.stringify(formData.questions)
      }

      let url, method
      if (dialogMode === 'create') {
        url = 'http://192.168.0.119:3000/api/9PE/audit-checklist/create'
        method = 'POST'
      } else {
        url = `http://192.168.0.119:3000/api/9PE/audit-checklist/${currentChecklist._id}`
        method = 'PUT'
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()
      console.log('API Response:', result)

      setSnackbarMessage(dialogMode === 'create' ? 'สร้างชุดคำถามสำเร็จ' : 'อัปเดตชุดคำถามสำเร็จ')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
      setOpenDialog(false)
      fetchChecklists()
    } catch (error) {
      console.error('Error saving checklist:', error)
      setSnackbarMessage(`เกิดข้อผิดพลาด: ${error.message}`)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!currentChecklist || !currentChecklist._id) {
      setSnackbarMessage('ไม่พบ ID ของชุดคำถาม')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    try {
      const response = await fetch(`http://192.168.0.119:3000/api/9PE/audit-checklist/${currentChecklist._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete checklist')
      }

      setSnackbarMessage('ลบชุดคำถามสำเร็จ')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
      setOpenDeleteDialog(false)
      fetchChecklists()
    } catch (error) {
      console.error('Error deleting checklist:', error)
      setSnackbarMessage(`เกิดข้อผิดพลาดในการลบชุดคำถาม: ${error.message}`)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  return (
    <div className='p-10 max-w-4x5 mx-auto rounded-lg shadow-lg'>
      <h2 className='text-xl font-bold text-center'>Clause 9: Performance Evaluation</h2>
      <p className='text-center text-gray-600 mb-5'>การจัดการชุดคำถามตรวจสอบ (Audit Checklist)</p>

      {/* Search and Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 1, px: 2, width: '50%' }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <TextField
            placeholder='ค้นหาชุดคำถาม...'
            variant='standard'
            fullWidth
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ disableUnderline: true }}
          />
        </Box>
        <Button variant='contained' color='primary' startIcon={<AddCircleOutline />} onClick={handleOpenCreateDialog}>
          สร้างชุดคำถามใหม่
        </Button>
      </Box>

      {/* Checklists Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3, mb: 4 }}>
        <Table>
          <TableHead sx={{}}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ชื่อชุดคำถาม</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>มาตรฐานที่ใช้</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>จำนวนคำถาม</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>วันที่สร้าง</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : filteredChecklists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                  {searchTerm ? 'ไม่พบชุดคำถามที่ค้นหา' : 'ยังไม่มีชุดคำถาม'}
                </TableCell>
              </TableRow>
            ) : (
              filteredChecklists.map(checklist => (
                <TableRow key={checklist._id} hover>
                  <TableCell>{checklist.checklistName}</TableCell>
                  <TableCell>
                    {checklist.auditStandards && checklist.auditStandards.length > 0 ? (
                      checklist.auditStandards.map((standard, i) => (
                        <Chip key={i} label={standard} size='small' sx={{ mr: 0.5, mb: 0.5 }} />
                      ))
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{checklist.questions ? checklist.questions.length : 0}</TableCell>
                  <TableCell>{new Date(checklist.createdAt).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>
                    <Tooltip title='ดูรายละเอียด'>
                      <IconButton size='small' color='primary' onClick={() => handleOpenDetailDialog(checklist)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='แก้ไข'>
                      <IconButton size='small' color='primary' onClick={() => handleOpenEditDialog(checklist)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='ลบ'>
                      <IconButton size='small' color='error' onClick={() => handleOpenDeleteDialog(checklist)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth='md'>
        <DialogTitle>{dialogMode === 'create' ? 'สร้างชุดคำถามใหม่' : 'แก้ไขชุดคำถาม'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label='ชื่อชุดคำถาม'
                name='checklistName'
                value={formData.checklistName}
                onChange={handleInputChange}
                fullWidth
                required
                margin='normal'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='มาตรฐานที่ใช้ตรวจสอบ (คั่นด้วยเครื่องหมายคอมม่า)'
                name='auditStandards'
                value={formData.auditStandards}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                helperText='เช่น ISO 27001, NIST, PCI DSS'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='เครื่องมือที่ใช้ตรวจสอบ (คั่นด้วยเครื่องหมายคอมม่า)'
                name='auditTools'
                value={formData.auditTools}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                helperText='เช่น Nessus, Metasploit, OWASP ZAP'
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant='h6'>รายการคำถาม</Typography>
                <Button variant='outlined' startIcon={<AddCircleOutline />} onClick={addQuestion} size='small'>
                  เพิ่มคำถาม
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {formData.questions.map((question, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderLeft: '4px solid #FFD700',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    {formData.questions.length > 1 && (
                      <IconButton color='error' size='small' onClick={() => removeQuestion(index)}>
                        <RemoveCircleOutline />
                      </IconButton>
                    )}
                  </Box>

                  <Typography variant='subtitle1' sx={{ mb: 2 }}>
                    คำถามที่ {index + 1}
                  </Typography>

                  <TextField
                    label='หัวข้อคำถาม'
                    value={question.topic}
                    onChange={e => handleQuestionChange(index, 'topic', e.target.value)}
                    fullWidth
                    required
                    margin='normal'
                  />

                  <TextField
                    label='รายละเอียดของคำถาม'
                    value={question.description || ''}
                    onChange={e => handleQuestionChange(index, 'description', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    margin='normal'
                  />

                  <TextField
                    label='ผลลัพธ์ที่คาดหวัง'
                    value={question.expectedOutcome || ''}
                    onChange={e => handleQuestionChange(index, 'expectedOutcome', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    margin='normal'
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color='inherit'>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} color='primary' variant='contained' startIcon={<SaveIcon />}>
            {dialogMode === 'create' ? 'สร้าง' : 'บันทึกการแก้ไข'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือไม่ว่าต้องการลบชุดคำถาม &quot;{currentChecklist?.checklistName}&quot; นี้?
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color='inherit'>
            ยกเลิก
          </Button>
          <Button onClick={handleDelete} color='error' variant='contained' startIcon={<DeleteIcon />}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} fullWidth maxWidth='md'>
        {currentChecklist && (
          <>
            <DialogTitle>รายละเอียดชุดคำถาม: {currentChecklist.checklistName}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    มาตรฐานที่ใช้:
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    {currentChecklist.auditStandards && currentChecklist.auditStandards.length > 0 ? (
                      currentChecklist.auditStandards.map((standard, i) => (
                        <Chip key={i} label={standard} size='small' sx={{ mr: 0.5, mb: 0.5 }} />
                      ))
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        -
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    เครื่องมือที่ใช้:
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    {currentChecklist.auditTools && currentChecklist.auditTools.length > 0 ? (
                      currentChecklist.auditTools.map((tool, i) => (
                        <Chip
                          key={i}
                          label={tool}
                          size='small'
                          color='primary'
                          variant='outlined'
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        -
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant='h6' sx={{ mb: 2 }}>
                    รายการคำถาม
                  </Typography>

                  {currentChecklist.questions && currentChecklist.questions.length > 0 ? (
                    currentChecklist.questions.map((question, index) => (
                      <Paper key={index} elevation={1} sx={{ p: 2, mb: 2, borderLeft: '4px solid #FFD700' }}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                          {index + 1}. {question.topic}
                        </Typography>

                        {question.description && (
                          <>
                            <Typography variant='subtitle2' color='text.secondary' sx={{ mt: 2 }}>
                              รายละเอียด:
                            </Typography>
                            <Typography variant='body2' paragraph>
                              {question.description}
                            </Typography>
                          </>
                        )}

                        {question.expectedOutcome && (
                          <>
                            <Typography variant='subtitle2' color='text.secondary'>
                              ผลลัพธ์ที่คาดหวัง:
                            </Typography>
                            <Typography variant='body2'>{question.expectedOutcome}</Typography>
                          </>
                        )}
                      </Paper>
                    ))
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      ไม่มีรายการคำถาม
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetailDialog(false)} color='primary'>
                ปิด
              </Button>
              <Button
                onClick={() => {
                  setOpenDetailDialog(false)
                  handleOpenEditDialog(currentChecklist)
                }}
                color='primary'
                startIcon={<EditIcon />}
              >
                แก้ไข
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            opacity: 0.9,
            backgroundColor: snackbarSeverity === 'success' ? 'rgba(0, 226, 68, 0.9)' : 'rgba(255, 82, 82, 0.9)',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}
