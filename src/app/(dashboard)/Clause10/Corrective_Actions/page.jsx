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
  Card,
  CardContent,
  CardActions,
  Autocomplete,
  Link,
  Chip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SaveIcon from '@mui/icons-material/Save'
import DescriptionIcon from '@mui/icons-material/Description'
import BusinessIcon from '@mui/icons-material/Business'
import PersonIcon from '@mui/icons-material/Person'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ismsp-backend.onrender.com/api'

const ImprovementForm = () => {
  const [correctiveActions, setCorrectiveActions] = useState([])
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [responsibleType, setResponsibleType] = useState('Employee') // 'Employee' or 'Department'
  const [internalAudits, setInternalAudits] = useState([])
  const [auditFindings, setAuditFindings] = useState([])
  const [selectedFinding, setSelectedFinding] = useState(null)

  // Single form state for all fields
  const [formData, setFormData] = useState({
    ncTopic: '',
    auditReference: '',
    findingReference: '',
    issueDetails: '',
    rootCause: '',
    // สำหรับ improvementActions.temporary
    temporaryAction: '',
    temporaryReason: '',
    temporaryCompletionDate: '',
    // สำหรับ improvementActions.permanent
    permanentAction: '',
    permanentReason: '',
    permanentCompletionDate: '',
    // การป้องกัน
    preventionMeasures: '',
    // ฟิลด์เดิมที่ยังคงใช้
    timeline: '',
    trackingDate: '',
    keyIndicators: '',
    problemsDuringImplementation: '', // เปลี่ยนชื่อจาก encounteredProblems
    implementationResults: '', // เปลี่ยนชื่อจาก results
    status: 'Pending',
    // ข้อมูลไฟล์
    reportFile: null,
    planFile: null,
    evidenceFile: null,
    auditFile: null,
    id: null, // For editing existing records
    // ฟิลด์ที่เกี่ยวข้องกับ follow up
    followUpDate: '',
    followUpResponsibleType: 'Employee',
    followUpResponsible: '',
    followUpReference: '',
    // ฟิลด์เกี่ยวกับ audit reference
    auditReference: '',
    findingReference: '',
    severityLevel: ''
  })

  // Loading data from API
  useEffect(() => {
    fetchCorrectiveActions()
    fetchEmployees()
    fetchDepartments()
    fetchInternalAudits()
  }, [])

  const fetchCorrectiveActions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/10IMPROV/corrective-action`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setCorrectiveActions(data.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      showSnackbar('Unable to load corrective actions data', 'error')
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/settings/employee`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()

      // Transform employee data to a consistent format
      const formattedEmployees = data.data.map(emp => ({
        id: emp._id,
        name: emp.name,
        position: emp.position,
        employeeId: emp.employeeId,
        department: emp.department || 'Not Assigned'
      }))

      setEmployees(formattedEmployees)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching employees:', error)
      showSnackbar('Unable to load employee data', 'error')
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/settings/department`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()

      // Transform department data to a consistent format
      const formattedDepartments = data.data.map(dept => ({
        id: dept._id,
        name: dept.name,
        deptId: dept.deptId,
        description: dept.description || ''
      }))

      setDepartments(formattedDepartments)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching departments:', error)
      showSnackbar('Unable to load department data', 'error')
      setLoading(false)
    }
  }

  const fetchInternalAudits = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/9PE/internal-audit`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`HTTP error ${response.status}: ${errorText}`)
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Internal audits data:', data)

      // Make sure data has the expected structure
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error('Unexpected data format:', data)
        setInternalAudits([])
        showSnackbar('Data format error: Internal audit data has unexpected format', 'error')
      } else {
        // Process the data to ensure findings array exists in each audit
        const processedAudits = data.data.map(audit => ({
          ...audit,
          findings: audit.findings || [] // Ensure findings is always an array
        }))

        setInternalAudits(processedAudits)
      }
    } catch (error) {
      console.error('Error fetching internal audits:', error)
      showSnackbar('Unable to load internal audit data', 'error')
      setInternalAudits([]) // Set empty array to prevent undefined errors
    } finally {
      setLoading(false)
    }
  }

  // Fetch findings for selected audit with improved error handling
  const fetchFindingsForAudit = async auditId => {
    if (!auditId) {
      console.warn('No audit ID provided to fetchFindingsForAudit')
      setAuditFindings([])
      return
    }

    try {
      setLoading(true)
      console.log(`Fetching findings for audit ID: ${auditId}`)

      // Try to get findings from already loaded audits first
      const existingAudit = internalAudits.find(audit => audit._id === auditId)
      if (existingAudit && existingAudit.findings && existingAudit.findings.length > 0) {
        console.log('Using findings from existing audit data')
        const formattedFindings = existingAudit.findings.map(finding => ({
          id: finding._id,
          _id: finding._id,
          topic: finding.topic || 'No Topic',
          issueDetails: finding.issueDetails || '',
          severityLevel: finding.severityLevel || '',
          correctiveActions: finding.correctiveActions || '',
          dueDate: finding.dueDate ? new Date(finding.dueDate).toLocaleDateString() : '',
          status: finding.status || 'Pending'
        }))

        setAuditFindings(formattedFindings)
        setLoading(false)
        return
      }

      // If not available in existing data, fetch from API
      const response = await fetch(`${API_BASE_URL}/9PE/internal-audit/${auditId}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`HTTP error ${response.status} for audit ID ${auditId}: ${errorText}`)
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Audit data:', data)

      if (!data || !data.data) {
        console.error('Unexpected data format:', data)
        setAuditFindings([])
        showSnackbar('Data format error: Audit data has unexpected format', 'error')
        return
      }

      // ตรวจสอบว่ามีข้อมูล findings หรือไม่
      const findings = data.data.findings || []

      // แปลงข้อมูล findings ให้เป็นรูปแบบที่ต้องการ
      const formattedFindings = findings.map(finding => ({
        id: finding._id,
        _id: finding._id,
        topic: finding.topic || 'No Topic',
        issueDetails: finding.issueDetails || '',
        severityLevel: finding.severityLevel || '',
        correctiveActions: finding.correctiveActions || '',
        dueDate: finding.dueDate ? new Date(finding.dueDate).toLocaleDateString() : '',
        status: finding.status || 'Pending'
      }))

      setAuditFindings(formattedFindings)
    } catch (error) {
      console.error(`Error fetching audit findings for audit ID ${auditId}:`, error)
      showSnackbar('Unable to load findings data', 'error')
      setAuditFindings([]) // Set empty array to prevent undefined errors
    } finally {
      setLoading(false)
    }
  }

  const handleNCTopicChange = (event, selectedTopic) => {
    if (!selectedTopic) {
      setFormData(prev => ({
        ...prev,
        ncTopic: '',
        auditReference: '',
        findingReference: '',
        issueDetails: '',
        severityLevel: ''
      }))
      setSelectedFinding(null)
      return
    }

    // เก็บค่า Topic ที่เลือก
    setFormData(prev => ({
      ...prev,
      ncTopic: selectedTopic
    }))

    // ค้นหา finding จากทุก audits ที่มี topic ตรงกับที่เลือก
    let foundAuditId = ''
    let foundFinding = null

    // วนลูปหาใน audit ทั้งหมด
    for (const audit of internalAudits) {
      // หาก audit นี้มี findings
      if (audit.findings && audit.findings.length > 0) {
        // วนลูปใน findings ของ audit นี้
        for (const finding of audit.findings) {
          // ถ้าเจอ finding ที่มี topic ตรงกับที่เลือก
          if (finding.topic === selectedTopic) {
            foundAuditId = audit._id
            foundFinding = finding
            break
          }
        }
        if (foundFinding) break
      }
    }

    // ถ้าเจอข้อมูลที่ตรงกัน ให้ดึงข้อมูล findings จาก audit นั้น
    if (foundAuditId && foundFinding) {
      // อัปเดต state ของ auditFindings โดยดึงข้อมูล findings ทั้งหมดของ audit นั้น
      fetchFindingsForAudit(foundAuditId)

      // อัปเดต formData ด้วยข้อมูลจาก finding ที่พบ
      setFormData(prev => ({
        ...prev,
        auditReference: foundAuditId,
        findingReference: foundFinding._id,
        issueDetails: foundFinding.issueDetails || '',
        severityLevel: foundFinding.severityLevel || ''
      }))

      // เก็บข้อมูล finding ที่เลือกไว้ใน state
      setSelectedFinding(foundFinding)
    }
  }

  // เพิ่มฟังก์ชันนี้สำหรับดึงข้อมูล findings เมื่อเลือก audit
  const handleAuditChange = async (event, selectedAudit) => {
    if (!selectedAudit) {
      setAuditFindings([])
      setFormData(prev => ({
        ...prev,
        auditReference: '',
        findingReference: '',
        ncTopic: ''
      }))
      setSelectedFinding(null)
      return
    }

    try {
      setLoading(true)
      const auditId = selectedAudit._id || selectedAudit.id
      console.log('Selected Audit:', selectedAudit)

      const response = await fetch(`${API_BASE_URL}/9PE/internal-audit/${auditId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Audit findings data:', data)

      const findings = data.data.findings || []
      const formattedFindings = findings.map(finding => ({
        id: finding._id,
        _id: finding._id,
        topic: finding.topic,
        issueDetails: finding.issueDetails || '',
        severityLevel: finding.severityLevel || '',
        correctiveActions: finding.correctiveActions || '',
        dueDate: finding.dueDate ? new Date(finding.dueDate).toLocaleDateString() : '',
        status: finding.status || 'Pending'
      }))

      setAuditFindings(formattedFindings)
      setFormData(prev => ({
        ...prev,
        auditReference: auditId
      }))

      setLoading(false)
    } catch (error) {
      console.error('Error fetching audit findings:', error)
      showSnackbar('Unable to load findings data', 'error')
      setLoading(false)
    }
  }

  const handleFindingChange = (event, selectedFinding) => {
    if (!selectedFinding) {
      setFormData(prev => ({
        ...prev,
        findingReference: '',
        ncTopic: '',
        issueDetails: '',
        severityLevel: ''
      }))
      setSelectedFinding(null)
      return
    }

    console.log('Selected Finding:', selectedFinding)
    setSelectedFinding(selectedFinding)

    // อัปเดต formData ด้วยข้อมูลจาก finding ที่เลือก
    setFormData(prev => ({
      ...prev,
      findingReference: selectedFinding._id,
      ncTopic: selectedFinding.topic,
      issueDetails: selectedFinding.issueDetails || '',
      severityLevel: selectedFinding.severityLevel || ''
    }))
  }

  const renderFindingDetails = () => {
    if (!selectedFinding) return null

    return (
      <Grid item xs={12}>
        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Finding Details
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant='subtitle1'>
                <strong>Topic:</strong> {selectedFinding.topic}
              </Typography>

              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Issue Details:</strong> {selectedFinding.issueDetails || 'ไม่มีข้อมูล'}
              </Typography>

              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Severity Level:</strong> {selectedFinding.severityLevel || 'ไม่ระบุ'}
              </Typography>

              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Corrective Actions:</strong> {selectedFinding.correctiveActions || 'ไม่มีข้อมูล'}
              </Typography>

              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Due Date:</strong> {selectedFinding.dueDate || 'ไม่ระบุ'}
              </Typography>

              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Status:</strong> {selectedFinding.status || 'Pending'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  // Handle form field changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle responsible type change
  const handleResponsibleTypeChange = e => {
    const type = e.target.value
    setResponsibleType(type)
    setFormData(prev => ({
      ...prev,
      responsibleType: type,
      responsiblePerson: '',
      responsibleReference: ''
    }))
  }

  // Handle responsible person change from autocomplete
  const handleResponsibleChange = (event, newValue) => {
    if (newValue) {
      const displayText =
        responsibleType === 'Employee'
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

  // Handle follow-up responsible type change
  const handleFollowUpResponsibleTypeChange = e => {
    const type = e.target.value
    setFormData(prev => ({
      ...prev,
      followUpResponsibleType: type,
      followUpResponsible: '',
      followUpReference: ''
    }))
  }

  // Handle follow-up responsible person change
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

  // Find selected entity for follow-up responsible
  const findFollowUpEntity = () => {
    if (formData.followUpResponsibleType === 'Employee' && formData.followUpReference) {
      return employees.find(emp => emp.id === formData.followUpReference) || null
    } else if (formData.followUpResponsibleType === 'Department' && formData.followUpReference) {
      return departments.find(dept => dept.id === formData.followUpReference) || null
    }
    return null
  }

  // Handle file uploads
  const handleFileChange = (e, fieldName) => {
    if (e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: e.target.files[0]
      }))
    }
  }

  // Reset form to default state
  const resetForm = () => {
    setFormData({
      issueDetails: '',
      rootCause: '',
      temporaryAction: '',
      temporaryReason: '',
      temporaryCompletionDate: '',
      permanentAction: '',
      permanentReason: '',
      permanentCompletionDate: '',
      preventionMeasures: '',
      timeline: '',
      trackingDate: '',
      keyIndicators: '',
      problemsDuringImplementation: '',
      implementationResults: '',
      status: 'Pending',
      reportFile: null,
      planFile: null,
      evidenceFile: null,
      auditFile: null,
      id: null,
      followUpDate: '',
      followUpResponsibleType: 'Employee',
      followUpResponsible: '',
      followUpReference: '',
      auditReference: '',
      findingReference: '',
      severityLevel: ''
    })
    setResponsibleType('Employee')
  }

  // Load data into form for editing
  const editCorrectiveAction = action => {
    // Determine responsible type from the data
    const type = action.responsibleType || 'Employee'
    setResponsibleType(type)

    // Set followUpResponsibleType
    const followUpType = action.followUpResponsibleType || 'Employee'

    // Extract temporary and permanent actions from improvementActions if they exist
    const temporaryAction = action.improvementActions?.temporary?.action || ''
    const temporaryReason = action.improvementActions?.temporary?.reason || ''
    const temporaryCompletionDate = action.improvementActions?.temporary?.completionDate
      ? new Date(action.improvementActions.temporary.completionDate).toISOString().substring(0, 10)
      : ''

    const permanentAction = action.improvementActions?.permanent?.action || ''
    const permanentReason = action.improvementActions?.permanent?.reason || ''
    const permanentCompletionDate = action.improvementActions?.permanent?.completionDate
      ? new Date(action.improvementActions.permanent.completionDate).toISOString().substring(0, 10)
      : ''

    setFormData({
      issueDetails: action.issueDetails || '',
      rootCause: action.rootCause || '',
      temporaryAction,
      temporaryReason,
      temporaryCompletionDate,
      permanentAction,
      permanentReason,
      permanentCompletionDate,
      preventionMeasures: action.preventionMeasures || '',
      timeline: action.timeline ? new Date(action.timeline).toISOString().substring(0, 10) : '',
      trackingDate: action.trackingDate ? new Date(action.trackingDate).toISOString().substring(0, 10) : '',
      keyIndicators: action.keyIndicators || '',
      problemsDuringImplementation: action.problemsDuringImplementation || '',
      implementationResults: action.implementationResults || '',
      status: action.status || 'Pending',
      reportFile: null,
      planFile: null,
      evidenceFile: null,
      auditFile: null,
      id: action._id,
      followUpDate: action.followUpDate ? new Date(action.followUpDate).toISOString().substring(0, 10) : '',
      followUpResponsibleType: followUpType,
      followUpResponsible: action.followUpResponsible || '',
      followUpReference: action.followUpReference || '',
      auditReference: action.auditReference || '',
      findingReference: action.findingReference || '',
      severityLevel: action.severityLevel || ''
    })
  }

  // Delete a corrective action
  const deleteCorrectiveAction = async id => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/10IMPROV/corrective-action/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete corrective action')
      }

      // Remove from list and reset form if currently editing
      setCorrectiveActions(prev => prev.filter(action => action._id !== id))
      if (formData.id === id) {
        resetForm()
      }

      showSnackbar('Item deleted successfully', 'success')
      setLoading(false)
    } catch (error) {
      console.error('Error deleting corrective action:', error)
      showSnackbar('Unable to delete item', 'error')
      setLoading(false)
    }
  }

  // Add new corrective action
  const addNewItem = () => {
    // Save current form if it has data before adding new
    if (formData.responsiblePerson) {
      handleSave()
    }

    resetForm()
  }

  // Find selected entity for display
  const findSelectedEntity = () => {
    if (responsibleType === 'Employee' && formData.responsibleReference) {
      return employees.find(emp => emp.id === formData.responsibleReference) || null
    } else if (responsibleType === 'Department' && formData.responsibleReference) {
      return departments.find(dept => dept.id === formData.responsibleReference) || null
    }
    return null
  }

  // Save form data
  const handleSave = async () => {
    setLoading(true)
    try {
      const formDataObj = new FormData()

      // ฟิลด์พื้นฐาน
      formDataObj.append('ncTopic', formData.ncTopic || '')
      formDataObj.append('issueDetails', formData.issueDetails || '')
      formDataObj.append('rootCause', formData.rootCause || '')

      // ImprovementActions - temporary
      formDataObj.append('temporaryAction', formData.temporaryAction || '')
      formDataObj.append('temporaryReason', formData.temporaryReason || '')
      formDataObj.append('temporaryCompletionDate', formData.temporaryCompletionDate || '')

      // ImprovementActions - permanent
      formDataObj.append('permanentAction', formData.permanentAction || '')
      formDataObj.append('permanentReason', formData.permanentReason || '')
      formDataObj.append('permanentCompletionDate', formData.permanentCompletionDate || '')

      // Prevention measures
      formDataObj.append('preventionMeasures', formData.preventionMeasures || '')

      // Timeline fields
      formDataObj.append('timeline', formData.timeline || '')
      formDataObj.append('trackingDate', formData.trackingDate || '')
      formDataObj.append('status', formData.status || 'Pending')

      // Performance and results
      formDataObj.append('keyIndicators', formData.keyIndicators || '')
      formDataObj.append('problemsDuringImplementation', formData.problemsDuringImplementation || '')
      formDataObj.append('implementationResults', formData.implementationResults || '')

      // Follow-up fields
      formDataObj.append('followUpDate', formData.followUpDate || '')
      formDataObj.append('followUpResponsibleType', formData.followUpResponsibleType || '')
      formDataObj.append('followUpResponsible', formData.followUpResponsible || '')
      formDataObj.append('followUpReference', formData.followUpReference || '')

      // Reference fields
      formDataObj.append('auditReference', formData.auditReference || '')
      formDataObj.append('findingReference', formData.findingReference || '')
      formDataObj.append('severityLevel', formData.severityLevel || '')

      // Append files if they exist
      if (formData.reportFile) formDataObj.append('reportFile', formData.reportFile)
      if (formData.planFile) formDataObj.append('planFile', formData.planFile)
      if (formData.evidenceFile) formDataObj.append('evidenceFile', formData.evidenceFile)
      if (formData.auditFile) formDataObj.append('auditFile', formData.auditFile)

      console.log(
        'FormData payload:',
        [...formDataObj.entries()].map(entry => `${entry[0]}: ${entry[1]}`)
      )

      let response
      if (formData.id) {
        // Update existing record
        response = await fetch(`${API_BASE_URL}/10IMPROV/corrective-action/${formData.id}`, {
          method: 'PUT',
          body: formDataObj
        })
      } else {
        // Create new record
        response = await fetch(`${API_BASE_URL}/10IMPROV/corrective-action/create`, {
          method: 'POST',
          body: formDataObj
        })
      }

      // Log full response for debugging
      const responseText = await response.text()
      console.log('Response status:', response.status)
      console.log('Response body:', responseText)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${responseText}`)
      }

      // Refresh data
      await fetchCorrectiveActions()
      resetForm()
      showSnackbar('Data saved successfully', 'success')
    } catch (error) {
      console.error('Error saving data:', error)
      showSnackbar(`Unable to save data: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Show notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  // Close notification
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // File upload field component
  const FileUploadField = ({ label, file, onChange, existingFile }) => {
    return (
      <TextField
        fullWidth
        variant='outlined'
        label={label}
        value={file ? file.name : existingFile ? existingFile.fileName : ''}
        InputProps={{
          readOnly: true,
          startAdornment: existingFile && (
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
          zIndex={10}
        >
          <CircularProgress />
        </Box>
      )}

      <Typography variant='h4' align='center' fontWeight='bold' gutterBottom>
        Clause 10: Improvement
      </Typography>
      <Typography variant='subtitle1' align='center' color='text.secondary' gutterBottom>
        10.1 Corrective Actions
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Main Form */}
      <Paper variant='outlined' sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          {formData.id ? 'Edit Corrective Action' : 'New Corrective Action'}
        </Typography>

        <Grid container spacing={2}>
          {/* NC Topic */}
          <Grid item xs={12}>
            <Autocomplete
              options={internalAudits
                .flatMap(audit => (audit.findings || []).map(finding => finding.topic))
                .filter((topic, index, self) => self.indexOf(topic) === index)} // กรองให้เหลือเฉพาะ topics ที่ไม่ซ้ำกัน
              renderInput={params => <TextField {...params} label='NC Topic' variant='outlined' />}
              onChange={handleNCTopicChange}
              value={formData.ncTopic || null}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* ส่วน Internal Audit Reference */}
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              Internal Audit Reference
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* แสดงรายละเอียดของ Finding */}
          {renderFindingDetails()}

          {/* Issue Details */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label='Issue Details'
              name='issueDetails'
              variant='outlined'
              value={formData.issueDetails || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label='Root Cause'
              name='rootCause'
              value={formData.rootCause}
              onChange={handleInputChange}
              variant='outlined'
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Temporary Improvement Section */}
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              Temporary Improvement
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Temporary Action'
              name='temporaryAction'
              value={formData.temporaryAction}
              onChange={handleInputChange}
              variant='outlined'
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Reason for Temporary Action'
              name='temporaryReason'
              value={formData.temporaryReason}
              onChange={handleInputChange}
              variant='outlined'
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Temporary Action Completion Date'
              name='temporaryCompletionDate'
              type='date'
              value={formData.temporaryCompletionDate}
              onChange={handleInputChange}
              variant='outlined'
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Permanent Improvement Section */}
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              Permanent Improvement
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Permanent Action'
              name='permanentAction'
              value={formData.permanentAction}
              onChange={handleInputChange}
              variant='outlined'
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Reason for Permanent Action'
              name='permanentReason'
              value={formData.permanentReason}
              onChange={handleInputChange}
              variant='outlined'
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Permanent Action Completion Date'
              name='permanentCompletionDate'
              type='date'
              value={formData.permanentCompletionDate}
              onChange={handleInputChange}
              variant='outlined'
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Prevention Measures */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Prevention Measures'
              name='preventionMeasures'
              multiline
              rows={2}
              value={formData.preventionMeasures}
              onChange={handleInputChange}
              variant='outlined'
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Implementation Timeline */}
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              Implementation Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Implementation Timeline'
              name='timeline'
              type='date'
              value={formData.timeline}
              onChange={handleInputChange}
              variant='outlined'
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select value={formData.status} onChange={handleInputChange} name='status' label='Status'>
                <MenuItem value='Pending'>Pending</MenuItem>
                <MenuItem value='In Progress'>In Progress</MenuItem>
                <MenuItem value='Completed'>Completed</MenuItem>
                <MenuItem value='Verified'>Verified</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Results and Follow-up */}
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              Results and Follow-up
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Key Success Indicators'
              name='keyIndicators'
              value={formData.keyIndicators}
              onChange={handleInputChange}
              variant='outlined'
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Tracking Date'
              name='trackingDate'
              type='date'
              value={formData.trackingDate}
              onChange={handleInputChange}
              variant='outlined'
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Implementation Results'
              name='implementationResults'
              multiline
              rows={2}
              value={formData.implementationResults}
              onChange={handleInputChange}
              variant='outlined'
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Problems During Implementation'
              name='problemsDuringImplementation'
              multiline
              rows={2}
              value={formData.problemsDuringImplementation}
              onChange={handleInputChange}
              variant='outlined'
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Follow-up Responsible Section */}
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              Follow-up Responsible
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Follow-up Responsible Type</InputLabel>
              <Select
                value={formData.followUpResponsibleType}
                onChange={handleFollowUpResponsibleTypeChange}
                label='Follow-up Responsible Type'
              >
                <MenuItem value='Employee'>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize='small' sx={{ mr: 1 }} />
                    Employee
                  </Box>
                </MenuItem>
                <MenuItem value='Department'>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon fontSize='small' sx={{ mr: 1 }} />
                    Department
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            {formData.followUpResponsibleType === 'Employee' ? (
              <Autocomplete
                options={employees}
                getOptionLabel={option => `${option.name} - ${option.position}`}
                renderInput={params => (
                  <TextField {...params} label='Follow-up Responsible Employee' variant='outlined' />
                )}
                onChange={handleFollowUpResponsibleChange}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={findFollowUpEntity()}
                sx={{ mb: 2 }}
              />
            ) : (
              <Autocomplete
                options={departments}
                getOptionLabel={option => `${option.name} (${option.deptId})`}
                renderInput={params => (
                  <TextField {...params} label='Follow-up Responsible Department' variant='outlined' />
                )}
                onChange={handleFollowUpResponsibleChange}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={findFollowUpEntity()}
                sx={{ mb: 2 }}
              />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Follow-up Date'
              name='followUpDate'
              type='date'
              value={formData.followUpDate}
              onChange={handleInputChange}
              variant='outlined'
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Audit Reference Section (Hidden fields unless from audit) */}
          {formData.auditReference && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Severity Level'
                  value={formData.severityLevel}
                  variant='outlined'
                  sx={{ mb: 2 }}
                />
              </Grid>
            </>
          )}

          {/* Documents Section */}
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid container item spacing={2}>
            <Grid item xs={12} md={6}>
              <FileUploadField
                label='Error Report'
                file={formData.reportFile}
                onChange={e => handleFileChange(e, 'reportFile')}
                existingFile={formData.id && correctiveActions.find(a => a._id === formData.id)?.reportFile}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FileUploadField
                label='Improvement Plan'
                file={formData.planFile}
                onChange={e => handleFileChange(e, 'planFile')}
                existingFile={formData.id && correctiveActions.find(a => a._id === formData.id)?.planFile}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FileUploadField
                label='Implementation Evidence'
                file={formData.evidenceFile}
                onChange={e => handleFileChange(e, 'evidenceFile')}
                existingFile={formData.id && correctiveActions.find(a => a._id === formData.id)?.evidenceFile}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FileUploadField
                label='Audit Record'
                file={formData.auditFile}
                onChange={e => handleFileChange(e, 'auditFile')}
                existingFile={formData.id && correctiveActions.find(a => a._id === formData.id)?.auditFile}
              />
            </Grid>
          </Grid>
        </Grid>

        <Box display='flex' justifyContent='space-between' mt={3}>
          <Button variant='outlined' color='secondary' onClick={resetForm}>
            Clear Form
          </Button>
          <Button variant='contained' color='primary' onClick={handleSave} startIcon={<SaveIcon />}>
            {formData.id ? 'Update' : 'Save'}
          </Button>
        </Box>
      </Paper>

      {/* List of existing corrective actions */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6'>Existing Corrective Actions</Typography>
          <Button variant='contained' color='primary' startIcon={<AddIcon />} onClick={addNewItem}>
            Add New
          </Button>
        </Box>

        {correctiveActions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color='text.secondary'>No corrective actions found</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {correctiveActions.map(action => (
              <Grid item xs={12} md={6} key={action._id}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='h6' sx={{ mb: 1 }}>
                      {action.title}
                    </Typography>
                    <Box sx={{ color: 'text.secondary', mb: 1, display: 'flex', alignItems: 'center' }}>
                      {action.responsibleType === 'Department' ? (
                        <BusinessIcon fontSize='small' sx={{ mr: 1 }} />
                      ) : (
                        <PersonIcon fontSize='small' sx={{ mr: 1 }} />
                      )}
                      <Typography variant='body2'>
                        {action.responsiblePerson?.name || action.responsiblePerson}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={action.status}
                        color={
                          action.status === 'Completed'
                            ? 'success'
                            : action.status === 'In Progress'
                              ? 'info'
                              : action.status === 'Verified'
                                ? 'success'
                                : 'warning'
                        }
                        size='small'
                        variant='outlined'
                      />
                      {action.severityLevel && (
                        <Chip
                          label={action.severityLevel}
                          color={
                            action.severityLevel === 'Critical'
                              ? 'error'
                              : action.severityLevel === 'Major'
                                ? 'warning'
                                : 'info'
                          }
                          size='small'
                          variant='outlined'
                        />
                      )}
                    </Box>

                    {action.improvementActions?.temporary?.action && (
                      <Typography variant='body2' sx={{ mb: 1 }} noWrap>
                        <strong>Temporary Action:</strong> {action.improvementActions.temporary.action}
                      </Typography>
                    )}

                    {action.improvementActions?.permanent?.action && (
                      <Typography variant='body2' sx={{ mb: 1 }} noWrap>
                        <strong>Permanent Action:</strong> {action.improvementActions.permanent.action}
                      </Typography>
                    )}

                    {action.timeline && (
                      <Typography variant='body2'>
                        <strong>Timeline:</strong> {new Date(action.timeline).toLocaleDateString()}
                      </Typography>
                    )}

                    {/* File links */}
                    {action.reportFile?.filePath && (
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        <Link
                          href={`https://ismsp-backend.onrender.com${action.reportFile.filePath.replace(/\\/g, '/')}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <DescriptionIcon fontSize='small' sx={{ mr: 0.5 }} />
                          {action.reportFile.fileName || 'Error Report'}
                        </Link>
                      </Typography>
                    )}

                    {action.planFile?.filePath && (
                      <Typography variant='body2' sx={{ mt: 0.5 }}>
                        <Link
                          href={`https://ismsp-backend.onrender.com${action.planFile.filePath.replace(/\\/g, '/')}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <DescriptionIcon fontSize='small' sx={{ mr: 0.5 }} />
                          {action.planFile.fileName || 'Improvement Plan'}
                        </Link>
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size='small' onClick={() => editCorrectiveAction(action)}>
                      Edit
                    </Button>
                    <Button size='small' color='error' onClick={() => deleteCorrectiveAction(action._id)}>
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ImprovementForm
