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
  IconButton,
  Snackbar,
  Alert,
  Box,
  Typography,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Card,
  CardContent,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  DialogContentText,
  Autocomplete
} from '@mui/material'

// Icons
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CancelIcon from '@mui/icons-material/Cancel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AssignmentIcon from '@mui/icons-material/Assignment'
import FindInPageIcon from '@mui/icons-material/FindInPage'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import BusinessIcon from '@mui/icons-material/Business'
import PersonIcon from '@mui/icons-material/Person'

export default function InternalAudit() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])

  // State for audit list and loading
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [checklists, setChecklists] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [currentAudit, setCurrentAudit] = useState(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [auditToDelete, setAuditToDelete] = useState(null)

  // Notification state
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [snackbarMessage, setSnackbarMessage] = useState('Data Saved Successfully!')

  // State for current active form
  const [activeForm, setActiveForm] = useState({
    _id: undefined,
    auditor: '',
    auditDate: '',
    auditScope: '',
    auditType: '',
    checklist: '', // Reference to AuditChecklist
    findings: [
      {
        topic: '',
        issueDetails: '',
        severityLevel: '',
        correctiveActions: '',
        responsiblePerson: '',
        responsibleType: 'Employee',
        dueDate: '',
        status: 'Pending'
      }
    ],
    auditReportFile: null,
    findingsFile: null,
    correctiveActionEvidence: null,
    followUpAuditor: '',
    followUpDate: '',
    followUpReportFile: null,
    auditReportFileName: '',
    findingsFileName: '',
    correctiveActionEvidenceFileName: '',
    followUpReportFileName: ''
  })

  // Fetch data on component mount
  useEffect(() => {
    fetchAudits()
    fetchChecklists()
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/settings/employee`)
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
      const response = await fetch(`https://ismsp-backend.onrender.com/api/settings/department`)
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

  // Fetch all audits
  const fetchAudits = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/9PE/internal-audit/')

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()

      if (result.data) {
        const formattedData = result.data.map(record => ({
          _id: record._id,
          auditor: record.auditor || '',
          auditDate: record.auditDate ? record.auditDate.split('T')[0] : '',
          auditScope: record.auditScope || '',
          auditType: record.auditType || '',
          checklist: record.checklist?._id || '',
          checklistData: record.checklist,
          findings: record.findings?.length
            ? record.findings
            : [
                {
                  topic: '',
                  issueDetails: '',
                  severityLevel: '',
                  correctiveActions: '',
                  responsiblePerson: '',
                  responsibleType: 'Employee',
                  dueDate: '',
                  status: 'Pending'
                }
              ],
          auditReportFile: null,
          findingsFile: null,
          correctiveActionEvidence: null,
          followUpAuditor: record.followUpAuditor || '',
          followUpDate: record.followUpDate ? record.followUpDate.split('T')[0] : '',
          followUpReportFile: null,
          auditReportFileName: record.auditReportFile || '',
          findingsFileName: record.findingsFile || '',
          correctiveActionEvidenceFileName: record.correctiveActionEvidence || '',
          followUpReportFileName: record.followUpReportFile || '',
          createdAt: record.createdAt
        }))

        setAudits(formattedData)

        // If we have audits, set the active form to the first one
        if (formattedData.length > 0) {
          setActiveForm(formattedData[0])
        }
      }
    } catch (error) {
      console.error('Error loading audits:', error)
      setSnackbarMessage(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}`)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all checklists
  const fetchChecklists = async () => {
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/9PE/audit-checklist/')

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
    }
  }

  // Handle form field changes
  const handleChange = (field, value) => {
    setActiveForm(prev => ({
      ...prev,
      [field]: value === undefined ? '' : value
    }))
  }

  // Handle finding changes
  const handleFindingChange = (findingIndex, field, value) => {
    setActiveForm(prev => {
      const updatedFindings = [...prev.findings]
      updatedFindings[findingIndex] = {
        ...updatedFindings[findingIndex],
        [field]: value === undefined ? '' : value
      }
      return { ...prev, findings: updatedFindings }
    })
  }

  // Handle responsible type change
  const handleResponsibleTypeChange = (findingIndex, value) => {
    setActiveForm(prev => {
      const updatedFindings = [...prev.findings]
      updatedFindings[findingIndex] = {
        ...updatedFindings[findingIndex],
        responsibleType: value,
        responsiblePerson: '' // Reset person when type changes
      }
      return { ...prev, findings: updatedFindings }
    })
  }

  // Find selected entity for display
  const findSelectedEntity = findingIndex => {
    const finding = activeForm.findings[findingIndex]
    if (!finding) return null

    if (finding.responsibleType === 'Employee' && finding.responsiblePerson) {
      return employees.find(emp => emp._id === finding.responsiblePerson) || null
    } else if (finding.responsibleType === 'Department' && finding.responsiblePerson) {
      return departments.find(dept => dept._id === finding.responsiblePerson) || null
    }
    return null
  }

  // Handle file uploads
  const handleFileChange = (field, event) => {
    const file = event.target.files[0]

    if (file) {
      const fileFieldMap = {
        auditReportFile: 'auditReportFileName',
        findingsFile: 'findingsFileName',
        correctiveActionEvidence: 'correctiveActionEvidenceFileName',
        followUpReportFile: 'followUpReportFileName'
      }

      setActiveForm(prev => ({
        ...prev,
        [field]: file,
        [fileFieldMap[field]]: file.name
      }))
    }
  }

  // Add a new finding
  const handleAddFinding = () => {
    setActiveForm(prev => ({
      ...prev,
      findings: [
        ...prev.findings,
        {
          topic: '',
          issueDetails: '',
          severityLevel: '',
          correctiveActions: '',
          responsiblePerson: '',
          responsibleType: 'Employee',
          dueDate: '',
          status: 'Pending'
        }
      ]
    }))
  }

  // Remove a finding
  const handleRemoveFinding = findingIndex => {
    setActiveForm(prev => {
      if (prev.findings.length <= 1) return prev

      return {
        ...prev,
        findings: prev.findings.filter((_, index) => index !== findingIndex)
      }
    })
  }

  // Create a new form
  const handleNewForm = () => {
    setActiveForm({
      _id: undefined,
      auditor: '',
      auditDate: '',
      auditScope: '',
      auditType: '',
      checklist: '',
      findings: [
        {
          topic: '',
          issueDetails: '',
          severityLevel: '',
          correctiveActions: '',
          responsiblePerson: '',
          responsibleType: 'Employee',
          dueDate: '',
          status: 'Pending'
        }
      ],
      auditReportFile: null,
      findingsFile: null,
      correctiveActionEvidence: null,
      followUpAuditor: '',
      followUpDate: '',
      followUpReportFile: null,
      auditReportFileName: '',
      findingsFileName: '',
      correctiveActionEvidenceFileName: '',
      followUpReportFileName: ''
    })
    setTabValue(1) // Switch to form tab
  }

  // Load an existing audit for editing
  const handleEditAudit = audit => {
    setActiveForm({
      ...audit,
      // Ensure files are null since we can't load actual file objects from the server
      auditReportFile: null,
      findingsFile: null,
      correctiveActionEvidence: null,
      followUpReportFile: null
    })
    setTabValue(1) // Switch to form tab
  }

  // Open detail view dialog
  const handleViewDetails = audit => {
    setCurrentAudit(audit)
    setOpenDetailDialog(true)
  }

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = audit => {
    setAuditToDelete(audit)
    setOpenDeleteDialog(true)
  }

  // Delete an audit
  const handleConfirmDelete = async () => {
    if (!auditToDelete || !auditToDelete._id) {
      setOpenDeleteDialog(false)
      return
    }

    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/9PE/internal-audit/${auditToDelete._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete audit')
      }

      setSnackbarMessage('ลบการตรวจสอบสำเร็จ')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)

      // If the deleted audit is the active form, reset the form
      if (activeForm._id === auditToDelete._id) {
        handleNewForm()
      }

      // Refresh the audit list
      fetchAudits()
    } catch (error) {
      console.error('Error deleting audit:', error)
      setSnackbarMessage(`เกิดข้อผิดพลาดในการลบการตรวจสอบ: ${error.message}`)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setOpenDeleteDialog(false)
      setAuditToDelete(null)
    }
  }

  // Save the current form
  const handleSave = async () => {
    try {
      // Validate required fields
      if (!activeForm.auditor) {
        setSnackbarMessage('กรุณาระบุผู้ตรวจสอบ')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
        return
      }

      if (!activeForm.auditDate) {
        setSnackbarMessage('กรุณาระบุวันที่ตรวจสอบ')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
        return
      }

      if (!activeForm.auditType) {
        setSnackbarMessage('กรุณาระบุประเภทการตรวจสอบ')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
        return
      }

      // Check if any findings have empty topics
      const emptyTopics = activeForm.findings.some(finding => !finding.topic.trim())
      if (emptyTopics) {
        setSnackbarMessage('กรุณาระบุหัวข้อสำหรับทุกข้อค้นพบ')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
        return
      }

      const isEditing = activeForm._id !== undefined

      // Set URL and method based on whether we're creating or updating
      let url, method
      if (isEditing) {
        url = `https://ismsp-backend.onrender.com/api/9PE/internal-audit/${activeForm._id}`
        method = 'PUT'
      } else {
        url = 'https://ismsp-backend.onrender.com/api/9PE/internal-audit/create'
        method = 'POST'
      }

      // Create FormData for the request
      const formData = new FormData()

      // Add basic fields
      formData.append('auditor', activeForm.auditor)
      formData.append('auditDate', activeForm.auditDate)
      formData.append('auditScope', activeForm.auditScope || '')
      formData.append('auditType', activeForm.auditType)

      if (activeForm.checklist) {
        formData.append('checklist', activeForm.checklist)
      }

      // Add findings as JSON string
      formData.append('findings', JSON.stringify(activeForm.findings))

      // Add follow-up fields if available
      if (activeForm.followUpAuditor) {
        formData.append('followUpAuditor', activeForm.followUpAuditor)
      }

      if (activeForm.followUpDate) {
        formData.append('followUpDate', activeForm.followUpDate)
      }

      // Add files if available
      if (activeForm.auditReportFile instanceof File) {
        formData.append('auditReportFile', activeForm.auditReportFile)
      }

      if (activeForm.findingsFile instanceof File) {
        formData.append('findingsFile', activeForm.findingsFile)
      }

      if (activeForm.correctiveActionEvidence instanceof File) {
        formData.append('correctiveActionEvidence', activeForm.correctiveActionEvidence)
      }

      if (activeForm.followUpReportFile instanceof File) {
        formData.append('followUpReportFile', activeForm.followUpReportFile)
      }

      // Send the request
      const response = await fetch(url, {
        method: method,
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save audit')
      }

      // Update success notification
      setSnackbarMessage(isEditing ? 'อัปเดตการตรวจสอบสำเร็จ' : 'บันทึกการตรวจสอบสำเร็จ')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)

      // Refresh the audit list
      fetchAudits()

      // Switch back to the audit list tab after saving
      setTabValue(0)
    } catch (error) {
      console.error('Error saving audit:', error)
      setSnackbarMessage(`เกิดข้อผิดพลาด: ${error.message}`)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Get severity level icon and color
  const getSeverityInfo = level => {
    switch (level) {
      case 'Minor':
        return { icon: <WarningIcon fontSize='small' sx={{ color: '#FFD700' }} />, color: '#FFD700', bg: '#FFFDE7' }
      case 'Major':
        return { icon: <WarningIcon fontSize='small' sx={{ color: '#FF9800' }} />, color: '#FF9800', bg: '#FFF3E0' }
      case 'Critical':
        return { icon: <WarningIcon fontSize='small' sx={{ color: '#F44336' }} />, color: '#F44336', bg: '#FFEBEE' }
      default:
        return { icon: <WarningIcon fontSize='small' sx={{ color: '#9E9E9E' }} />, color: '#9E9E9E', bg: '#F5F5F5' }
    }
  }

  // Get status icon and color
  const getStatusInfo = status => {
    switch (status) {
      case 'Completed':
        return { icon: <CheckCircleIcon fontSize='small' />, color: 'success', bg: '#E8F5E9' }
      case 'In Progress':
        return { icon: <HourglassEmptyIcon fontSize='small' />, color: 'info', bg: '#E3F2FD' }
      case 'Pending':
        return { icon: <WarningIcon fontSize='small' />, color: 'warning', bg: '#FFF8E1' }
      default:
        return { icon: <HourglassEmptyIcon fontSize='small' />, color: 'secondary', bg: '#F5F5F5' }
    }
  }

  // Get checklist name by ID
  const getChecklistName = id => {
    const checklist = checklists.find(c => c._id === id)
    return checklist ? checklist.checklistName : '-'
  }

  // Get responsible person display name
  const getResponsibleName = (id, type) => {
    if (!id) return '-'

    if (type === 'Employee') {
      const employee = employees.find(emp => emp._id === id)
      return employee ? `${employee.firstName} ${employee.lastName}` : '-'
    } else {
      const department = departments.find(dept => dept._id === id)
      return department ? department.departmentName : '-'
    }
  }

  return (
    <div className='p-10 max-w-4x5 mx-auto rounded-lg shadow-lg'>
      <h2 className='text-xl font-bold text-center'>Clause 9: Performance Evaluation</h2>
      <p className='text-center text-gray-600 mb-5'>การตรวจสอบภายใน (Internal Audit)</p>

      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label='รายการตรวจสอบทั้งหมด' />
            <Tab label='แบบฟอร์มบันทึกการตรวจสอบ' />
          </Tabs>
        </Box>

        {/* Audit List Tab */}
        <Box sx={{ display: tabValue === 0 ? 'block' : 'none', pt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant='contained' startIcon={<AddCircleOutline />} onClick={handleNewForm}>
              สร้างการตรวจสอบใหม่
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead sx={{}}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ผู้ตรวจสอบ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>วันที่ตรวจ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ประเภท</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ข้อค้นพบ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ชุดคำถาม</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 3 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      กำลังโหลดข้อมูล...
                    </TableCell>
                  </TableRow>
                ) : audits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 3 }}>
                      ยังไม่มีรายการตรวจสอบ
                    </TableCell>
                  </TableRow>
                ) : (
                  audits.map(audit => (
                    <TableRow key={audit._id} hover>
                      <TableCell>{audit.auditor}</TableCell>
                      <TableCell>
                        {audit.auditDate ? new Date(audit.auditDate).toLocaleDateString('th-TH') : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip label={audit.auditType} size='small' color='primary' variant='outlined' />
                      </TableCell>
                      <TableCell>
                        {audit.findings.length > 0 ? (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {['Critical', 'Major', 'Minor'].map(severity => {
                              const count = audit.findings.filter(f => f.severityLevel === severity).length
                              if (count === 0) return null

                              const { color, bg } = getSeverityInfo(severity)
                              return (
                                <Chip
                                  key={severity}
                                  label={`${severity}: ${count}`}
                                  size='small'
                                  sx={{
                                    color: color,
                                    bgcolor: bg,
                                    borderColor: color,
                                    mr: 0.5
                                  }}
                                />
                              )
                            })}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{audit.checklist ? getChecklistName(audit.checklist) : '-'}</TableCell>
                      <TableCell>
                        <Tooltip title='ดูรายละเอียด'>
                          <IconButton size='small' color='info' onClick={() => handleViewDetails(audit)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='แก้ไข'>
                          <IconButton size='small' color='primary' onClick={() => handleEditAudit(audit)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='ลบ'>
                          <IconButton size='small' color='error' onClick={() => handleOpenDeleteDialog(audit)}>
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
        </Box>

        {/* Audit Form Tab */}
        <Box sx={{ display: tabValue === 1 ? 'block' : 'none', pt: 3 }}>
          <Box
            sx={{
              border: '2px solid #888',
              borderRadius: '8px',
              padding: '16px',
              position: 'relative',
              width: '100%'
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='h6'>ข้อมูลการตรวจสอบ</Typography>
                <Divider sx={{ mb: 2, mt: 1 }} />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ผู้ตรวจสอบ
                  </InputLabel>
                  <Select value={activeForm.auditor || ''} onChange={e => handleChange('auditor', e.target.value)}>
                    <MenuItem value='Internal Auditor'>Internal Auditor</MenuItem>
                    <MenuItem value='Compliance Team'>Compliance Team</MenuItem>
                    <MenuItem value='External Auditor'>External Auditor</MenuItem>
                    <MenuItem value='QMS Team'>QMS Team</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  <TextField
                    fullWidth
                    value={activeForm.auditor || ''}
                    onChange={e => handleChange('auditor', e.target.value)}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='เลือกวันที่ตรวจสอบ'
                  type='date'
                  value={activeForm.auditDate || ''}
                  onChange={e => handleChange('auditDate', e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='แผนกที่เกี่ยวข้อง'
                  fullWidth
                  value={activeForm.auditScope || ''}
                  onChange={e => handleChange('auditScope', e.target.value)}
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ประเภทการตรวจสอบ
                  </InputLabel>
                  <Select value={activeForm.auditType || ''} onChange={e => handleChange('auditType', e.target.value)}>
                    <MenuItem value='ตรวจสอบตามกำหนด'>ตรวจสอบตามกำหนด</MenuItem>
                    <MenuItem value='ตรวจสอบพิเศษ'>ตรวจสอบพิเศษ</MenuItem>
                    <MenuItem value='ตรวจสอบติดตาม'>ตรวจสอบติดตาม</MenuItem>
                    <MenuItem value='ตรวจสอบเฉพาะกิจ'>ตรวจสอบเฉพาะกิจ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ชุดคำถามที่ใช้ตรวจสอบ
                  </InputLabel>
                  <Select value={activeForm.checklist || ''} onChange={e => handleChange('checklist', e.target.value)}>
                    <MenuItem value=''>-- ไม่เลือกชุดคำถาม --</MenuItem>
                    {checklists.map(checklist => (
                      <MenuItem key={checklist._id} value={checklist._id}>
                        {checklist.checklistName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} className='mt-8'>
                <Typography variant='h6'>ข้อค้นพบและการแก้ไข</Typography>
                <Divider sx={{ mb: 2, mt: 1 }} />
              </Grid>

              {activeForm.findings.map((finding, findingIndex) => (
                <Grid
                  container
                  item
                  xs={12}
                  key={findingIndex}
                  spacing={2}
                  sx={{ mb: 3, mt: 2, p: 2, border: '1px dashed #aaa', borderRadius: '4px' }}
                >
                  <Grid
                    item
                    xs={12}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
                  >
                    <Typography variant='subtitle1'>ข้อค้นพบที่ {findingIndex + 1}</Typography>
                    {activeForm.findings.length > 1 && (
                      <IconButton onClick={() => handleRemoveFinding(findingIndex)} color='error' size='small'>
                        <RemoveCircleOutline />
                      </IconButton>
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label='หัวข้อที่ตรวจสอบ'
                      fullWidth
                      value={finding.topic || ''}
                      onChange={e => handleFindingChange(findingIndex, 'topic', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel shrink sx={{ marginTop: -2.5 }}>
                        ระดับความรุนแรง
                      </InputLabel>
                      <Select
                        value={finding.severityLevel || ''}
                        onChange={e => handleFindingChange(findingIndex, 'severityLevel', e.target.value)}
                      >
                        <MenuItem value='Minor'>Minor</MenuItem>
                        <MenuItem value='Major'>Major</MenuItem>
                        <MenuItem value='Critical'>Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label='รายละเอียดข้อค้นพบ'
                      fullWidth
                      multiline
                      rows={2}
                      value={finding.issueDetails || ''}
                      onChange={e => handleFindingChange(findingIndex, 'issueDetails', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label='คำแนะนำในการแก้ไข'
                      fullWidth
                      multiline
                      rows={2}
                      value={finding.correctiveActions || ''}
                      onChange={e => handleFindingChange(findingIndex, 'correctiveActions', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel shrink sx={{ marginTop: -2.5 }}>
                        ประเภทผู้รับผิดชอบ
                      </InputLabel>
                      <Select
                        value={finding.responsibleType || 'Employee'}
                        onChange={e => {
                          handleFindingChange(findingIndex, 'responsibleType', e.target.value)
                          handleFindingChange(findingIndex, 'responsiblePerson', '')
                        }}
                      >
                        <MenuItem value='Employee'>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>พนักงาน</Box>
                        </MenuItem>
                        <MenuItem value='Department'>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>แผนก</Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    {finding.responsibleType === 'Employee' ? (
                      <Autocomplete
                        options={employees}
                        getOptionLabel={option => `${option.name} - ${option.position}`}
                        renderInput={params => (
                          <TextField {...params} required label='ผู้รับผิดชอบ' variant='outlined' />
                        )}
                        onChange={(event, newValue) => {
                          handleFindingChange(
                            findingIndex,
                            'responsiblePerson',
                            newValue ? newValue._id || newValue.id : ''
                          )
                        }}
                        isOptionEqualToValue={(option, value) => (option._id || option.id) === (value._id || value.id)}
                        value={
                          employees.find(
                            emp => emp._id === finding.responsiblePerson || emp.id === finding.responsiblePerson
                          ) || null
                        }
                      />
                    ) : (
                      <Autocomplete
                        options={departments}
                        getOptionLabel={option =>
                          `${option.name || option.departmentName || ''} ${option.deptId ? `(${option.deptId})` : ''}`
                        }
                        renderInput={params => (
                          <TextField {...params} required label='ผู้รับผิดชอบ' variant='outlined' />
                        )}
                        onChange={(event, newValue) => {
                          handleFindingChange(
                            findingIndex,
                            'responsiblePerson',
                            newValue ? newValue._id || newValue.id : ''
                          )
                        }}
                        isOptionEqualToValue={(option, value) => (option._id || option.id) === (value._id || value.id)}
                        value={
                          departments.find(
                            dept => dept._id === finding.responsiblePerson || dept.id === finding.responsiblePerson
                          ) || null
                        }
                      />
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label='วันที่ต้องแก้ไขเสร็จ'
                      type='date'
                      value={finding.dueDate || ''}
                      onChange={e => handleFindingChange(findingIndex, 'dueDate', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel shrink sx={{ marginTop: -2.5 }}>
                        สถานะการแก้ไข
                      </InputLabel>
                      <Select
                        value={finding.status || 'Pending'}
                        onChange={e => handleFindingChange(findingIndex, 'status', e.target.value)}
                      >
                        <MenuItem value='Pending'>Pending</MenuItem>
                        <MenuItem value='In Progress'>In Progress</MenuItem>
                        <MenuItem value='Completed'>Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button startIcon={<AddCircleOutline />} onClick={handleAddFinding} variant='outlined' sx={{ mt: 1 }}>
                  เพิ่มข้อค้นพบ
                </Button>
              </Grid>

              <Grid item xs={12} className='mt-8'>
                <Typography variant='h6'>การติดตาม</Typography>
                <Divider sx={{ mb: 2, mt: 1 }} />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='ผู้ตรวจติดตาม'
                  fullWidth
                  value={activeForm.followUpAuditor || ''}
                  onChange={e => handleChange('followUpAuditor', e.target.value)}
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='วันที่ตรวจติดตาม'
                  type='date'
                  value={activeForm.followUpDate || ''}
                  onChange={e => handleChange('followUpDate', e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} className='mt-8'>
                <Typography variant='h6'>ไฟล์แนบ</Typography>
                <Divider sx={{ mb: 2, mt: 1 }} />
              </Grid>

              <Grid container item spacing={2} className='mt-4'>
                <Grid item xs={6} className='mt-5'>
                  <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                    รายงานการตรวจสอบ
                    <input type='file' hidden onChange={e => handleFileChange('auditReportFile', e)} />
                  </Button>
                  <TextField
                    fullWidth
                    margin='dense'
                    value={activeForm.auditReportFileName || ''}
                    placeholder='ชื่อไฟล์'
                    disabled
                  />
                </Grid>

                <Grid item xs={6} className='mt-5'>
                  <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                    บันทึกข้อค้นพบ
                    <input type='file' hidden onChange={e => handleFileChange('findingsFile', e)} />
                  </Button>
                  <TextField
                    fullWidth
                    margin='dense'
                    value={activeForm.findingsFileName || ''}
                    placeholder='ชื่อไฟล์'
                    disabled
                  />
                </Grid>

                <Grid item xs={6} className='mt-5'>
                  <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                    หลักฐานการดำเนินการแก้ไข
                    <input type='file' hidden onChange={e => handleFileChange('correctiveActionEvidence', e)} />
                  </Button>
                  <TextField
                    fullWidth
                    margin='dense'
                    value={activeForm.correctiveActionEvidenceFileName || ''}
                    placeholder='ชื่อไฟล์'
                    disabled
                  />
                </Grid>

                <Grid item xs={6} className='mt-5'>
                  <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                    รายงานการติดตาม
                    <input type='file' hidden onChange={e => handleFileChange('followUpReportFile', e)} />
                  </Button>
                  <TextField
                    fullWidth
                    margin='dense'
                    value={activeForm.followUpReportFileName || ''}
                    placeholder='ชื่อไฟล์'
                    disabled
                  />
                </Grid>
              </Grid>

              <Grid item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant='outlined' onClick={() => setTabValue(0)}>
                  กลับไปหน้ารายการ
                </Button>
                <Button variant='contained' color='primary' onClick={handleSave} startIcon={<SaveIcon />}>
                  {activeForm._id ? 'อัปเดต' : 'บันทึก'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Detail View Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} fullWidth maxWidth='md'>
        {currentAudit && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='h6'>รายละเอียดการตรวจสอบภายใน</Typography>
              <Chip label={currentAudit.auditType} color='primary' size='small' />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      ผู้ตรวจสอบ:
                    </Typography>
                    <Typography variant='body1'>{currentAudit.auditor}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      วันที่ตรวจสอบ:
                    </Typography>
                    <Typography variant='body1'>
                      {currentAudit.auditDate ? new Date(currentAudit.auditDate).toLocaleDateString('th-TH') : '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      แผนกที่เกี่ยวข้อง:
                    </Typography>
                    <Typography variant='body1'>{currentAudit.auditScope || '-'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      ชุดคำถามที่ใช้:
                    </Typography>
                    <Typography variant='body1'>
                      {currentAudit.checklist ? getChecklistName(currentAudit.checklist) : '-'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    ข้อค้นพบ
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {currentAudit.findings && currentAudit.findings.length > 0 ? (
                    currentAudit.findings.map((finding, index) => {
                      const severityInfo = getSeverityInfo(finding.severityLevel)
                      const statusInfo = getStatusInfo(finding.status)

                      return (
                        <Accordion key={index} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography sx={{ mr: 1 }}>
                                  {index + 1}. {finding.topic}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {finding.severityLevel && (
                                  <Chip
                                    icon={severityInfo.icon}
                                    label={finding.severityLevel}
                                    size='small'
                                    sx={{ bgcolor: severityInfo.bg, color: severityInfo.color }}
                                  />
                                )}
                                {finding.status && (
                                  <Chip
                                    icon={statusInfo.icon}
                                    label={finding.status}
                                    size='small'
                                    sx={{ bgcolor: statusInfo.bg, color: statusInfo.color }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              {finding.issueDetails && (
                                <Grid item xs={12}>
                                  <Typography variant='subtitle2' color='text.secondary'>
                                    รายละเอียดข้อค้นพบ:
                                  </Typography>
                                  <Typography variant='body2' paragraph>
                                    {finding.issueDetails}
                                  </Typography>
                                </Grid>
                              )}

                              {finding.correctiveActions && (
                                <Grid item xs={12}>
                                  <Typography variant='subtitle2' color='text.secondary'>
                                    คำแนะนำในการแก้ไข:
                                  </Typography>
                                  <Typography variant='body2' paragraph>
                                    {finding.correctiveActions}
                                  </Typography>
                                </Grid>
                              )}

                              {finding.dueDate && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant='subtitle2' color='text.secondary'>
                                    กำหนดแก้ไขภายใน:
                                  </Typography>
                                  <Typography variant='body2'>
                                    {new Date(finding.dueDate).toLocaleDateString('th-TH')}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      )
                    })
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      ไม่มีข้อค้นพบที่บันทึกไว้
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    การติดตาม
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        ผู้ตรวจติดตาม:
                      </Typography>
                      <Typography variant='body1'>{currentAudit.followUpAuditor || '-'}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        วันที่ตรวจติดตาม:
                      </Typography>
                      <Typography variant='body1'>
                        {currentAudit.followUpDate
                          ? new Date(currentAudit.followUpDate).toLocaleDateString('th-TH')
                          : '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    เอกสารแนบ
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='subtitle2' color='text.secondary'>
                          รายงานการตรวจสอบ:
                        </Typography>
                        <Typography variant='body2'>
                          {currentAudit.auditReportFileName ? (
                            <Button
                              variant='text'
                              href={`https://ismsp-backend.onrender.com${currentAudit.auditReportFileName}`}
                              target='_blank'
                              startIcon={<AssignmentIcon />}
                              size='small'
                            >
                              {currentAudit.auditReportFileName.split('/').pop()}
                            </Button>
                          ) : (
                            '-'
                          )}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='subtitle2' color='text.secondary'>
                          บันทึกข้อค้นพบ:
                        </Typography>
                        <Typography variant='body2'>
                          {currentAudit.findingsFileName ? (
                            <Button
                              variant='text'
                              href={`https://ismsp-backend.onrender.com${currentAudit.findingsFileName}`}
                              target='_blank'
                              startIcon={<FindInPageIcon />}
                              size='small'
                            >
                              {currentAudit.findingsFileName.split('/').pop()}
                            </Button>
                          ) : (
                            '-'
                          )}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='subtitle2' color='text.secondary'>
                          หลักฐานการแก้ไข:
                        </Typography>
                        <Typography variant='body2'>
                          {currentAudit.correctiveActionEvidenceFileName ? (
                            <Button
                              variant='text'
                              href={`https://ismsp-backend.onrender.com${currentAudit.correctiveActionEvidenceFileName}`}
                              target='_blank'
                              startIcon={<AssignmentIcon />}
                              size='small'
                            >
                              {currentAudit.correctiveActionEvidenceFileName.split('/').pop()}
                            </Button>
                          ) : (
                            '-'
                          )}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='subtitle2' color='text.secondary'>
                          รายงานการติดตาม:
                        </Typography>
                        <Typography variant='body2'>
                          {currentAudit.followUpReportFileName ? (
                            <Button
                              variant='text'
                              href={`https://ismsp-backend.onrender.com${currentAudit.followUpReportFileName}`}
                              target='_blank'
                              startIcon={<AssignmentIcon />}
                              size='small'
                            >
                              {currentAudit.followUpReportFileName.split('/').pop()}
                            </Button>
                          ) : (
                            '-'
                          )}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetailDialog(false)} color='inherit'>
                ปิด
              </Button>
              <Button
                onClick={() => {
                  setOpenDetailDialog(false)
                  handleEditAudit(currentAudit)
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือไม่ว่าต้องการลบรายการตรวจสอบนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color='inherit'>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained' startIcon={<DeleteIcon />}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
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
