'use client'
// pages/8OPER/8.1-operational-planning.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  TextField,
  Button,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Autocomplete,
  CircularProgress
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LinkIcon from '@mui/icons-material/Link'

const OperationalPlanningPage = () => {
  // State for managing objectives
  const [objectives, setObjectives] = useState([])
  const [riskAssessments, setRiskAssessments] = useState([])
  const [selectedRiskAssessment, setSelectedRiskAssessment] = useState(null)
  const [treatmentPlans, setTreatmentPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentObjectiveId, setCurrentObjectiveId] = useState(null)
  const [viewMode, setViewMode] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    riskAssessmentId: '',
    riskTreatmentPlanIndex: '',
    selectedRiskTreatmentOptions: [],
    objectiveTitle: '',
    achievementPlan: '',
    objectiveLinks: [],
    defineKPI: false
  })

  // New objective link
  const [newObjectiveLink, setNewObjectiveLink] = useState('')

  // Available risk treatment options from selected plan
  const [availableRiskTreatmentOptions, setAvailableRiskTreatmentOptions] = useState([])

  // Notification
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, objectiveId: null })

  // Detail view dialog
  const [detailDialog, setDetailDialog] = useState({ open: false, objective: null })

  // Base URL for API
  const baseUrl = 'http://192.168.0.119:3000'

  // Fetch all objectives
  const fetchObjectives = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/8OPER/objective-planning`)
      const result = await response.json()

      if (result.success) {
        setObjectives(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to fetch objectives')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all risk assessments
  const fetchRiskAssessments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/6PLAN/risk-assessment`)
      const result = await response.json()

      if (result.success) {
        setRiskAssessments(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to fetch risk assessments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch objective by ID
  const fetchObjectiveById = async (id, viewOnly = false) => {
    try {
      const response = await fetch(`${baseUrl}/api/8OPER/objective-planning/${id}`)
      const result = await response.json()

      if (result.success) {
        const objective = result.data

        // Find corresponding risk assessment
        const riskAssessment = riskAssessments.find(ra => ra._id === objective.riskAssessmentId)
        if (riskAssessment) {
          setSelectedRiskAssessment(riskAssessment)
          setTreatmentPlans(riskAssessment.riskTreatmentPlans || [])

          // Set available risk treatment options if there's a selected treatment plan
          if (
            objective.riskTreatmentPlanIndex !== undefined &&
            riskAssessment.riskTreatmentPlans &&
            riskAssessment.riskTreatmentPlans[objective.riskTreatmentPlanIndex]
          ) {
            const treatmentPlan = riskAssessment.riskTreatmentPlans[objective.riskTreatmentPlanIndex]
            const options = []

            if (treatmentPlan.riskTreatmentOptions) {
              if (treatmentPlan.riskTreatmentOptions.reduceRisk) options.push('reduceRisk')
              if (treatmentPlan.riskTreatmentOptions.transferRisk) options.push('transferRisk')
              if (treatmentPlan.riskTreatmentOptions.avoidRisk) options.push('avoidRisk')
              if (treatmentPlan.riskTreatmentOptions.acceptRisk) options.push('acceptRisk')
              if (treatmentPlan.riskTreatmentOptions.other) options.push('other')
            }

            setAvailableRiskTreatmentOptions(options)
          }
        }

        setFormData({
          riskAssessmentId: objective.riskAssessmentId || '',
          riskTreatmentPlanIndex:
            objective.riskTreatmentPlanIndex !== undefined ? objective.riskTreatmentPlanIndex : '',
          selectedRiskTreatmentOptions: objective.selectedRiskTreatmentOptions || [],
          objectiveTitle: objective.objectiveTitle || '',
          achievementPlan: objective.achievementPlan || '',
          objectiveLinks: objective.objectiveLinks || [],
          defineKPI: objective.defineKPI || false
        })

        setCurrentObjectiveId(id)

        if (viewOnly) {
          setViewMode(true)
        } else {
          setIsEditMode(true)
          setViewMode(false)
        }

        setIsFormOpen(true)
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to fetch objective details', 'error')
      console.error(err)
    }
  }

  // View objective details
  const viewObjectiveDetails = objective => {
    setDetailDialog({ open: true, objective })
  }

  // Create new objective
  const createObjective = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/8OPER/objective-planning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Objective created successfully', 'success')
        fetchObjectives()
        handleCloseForm()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to create objective', 'error')
      console.error(err)
    }
  }

  // Update objective
  const updateObjective = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/8OPER/objective-planning/${currentObjectiveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Objective updated successfully', 'success')
        fetchObjectives()
        handleCloseForm()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to update objective', 'error')
      console.error(err)
    }
  }

  // Delete objective
  const deleteObjective = async id => {
    try {
      const response = await fetch(`${baseUrl}/api/8OPER/objective-planning/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Objective deleted successfully', 'success')
        fetchObjectives()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to delete objective', 'error')
      console.error(err)
    } finally {
      setDeleteDialog({ open: false, objectiveId: null })
    }
  }

  // Show notification
  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    })
  }

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  // Open form for creating new objective
  const handleOpenNewForm = () => {
    setFormData({
      riskAssessmentId: '',
      riskTreatmentPlanIndex: '',
      selectedRiskTreatmentOptions: [],
      objectiveTitle: '',
      achievementPlan: '',
      objectiveLinks: [],
      defineKPI: false
    })
    setSelectedRiskAssessment(null)
    setTreatmentPlans([])
    setAvailableRiskTreatmentOptions([])
    setIsEditMode(false)
    setViewMode(false)
    setCurrentObjectiveId(null)
    setIsFormOpen(true)
  }

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setIsEditMode(false)
    setViewMode(false)
    setCurrentObjectiveId(null)
  }

  // Handle risk assessment change
  const handleRiskAssessmentChange = event => {
    const riskAssessmentId = event.target.value
    const selectedRA = riskAssessments.find(ra => ra._id === riskAssessmentId)

    setSelectedRiskAssessment(selectedRA)
    setTreatmentPlans(selectedRA?.riskTreatmentPlans || [])
    setFormData({
      ...formData,
      riskAssessmentId,
      riskTreatmentPlanIndex: '',
      selectedRiskTreatmentOptions: []
    })
    setAvailableRiskTreatmentOptions([])
  }

  // Handle treatment plan change
  const handleTreatmentPlanChange = event => {
    const index = parseInt(event.target.value, 10)
    const treatmentPlan = treatmentPlans[index]
    const options = []

    if (treatmentPlan.riskTreatmentOptions) {
      if (treatmentPlan.riskTreatmentOptions.reduceRisk) options.push('reduceRisk')
      if (treatmentPlan.riskTreatmentOptions.transferRisk) options.push('transferRisk')
      if (treatmentPlan.riskTreatmentOptions.avoidRisk) options.push('avoidRisk')
      if (treatmentPlan.riskTreatmentOptions.acceptRisk) options.push('acceptRisk')
      if (treatmentPlan.riskTreatmentOptions.other) options.push('other')
    }

    setAvailableRiskTreatmentOptions(options)
    setFormData({
      ...formData,
      riskTreatmentPlanIndex: index,
      selectedRiskTreatmentOptions: []
    })
  }

  // Handle risk treatment option change
  const handleRiskTreatmentOptionChange = event => {
    const { value, checked } = event.target

    if (checked) {
      setFormData({
        ...formData,
        selectedRiskTreatmentOptions: [...formData.selectedRiskTreatmentOptions, value]
      })
    } else {
      setFormData({
        ...formData,
        selectedRiskTreatmentOptions: formData.selectedRiskTreatmentOptions.filter(option => option !== value)
      })
    }
  }

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  // Add new objective link
  const addObjectiveLink = () => {
    if (newObjectiveLink.trim()) {
      setFormData({
        ...formData,
        objectiveLinks: [...formData.objectiveLinks, newObjectiveLink.trim()]
      })
      setNewObjectiveLink('')
    }
  }

  // Remove objective link
  const removeObjectiveLink = index => {
    setFormData({
      ...formData,
      objectiveLinks: formData.objectiveLinks.filter((_, i) => i !== index)
    })
  }

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault()
    if (isEditMode) {
      updateObjective()
    } else {
      createObjective()
    }
  }

  // Open delete confirmation dialog
  const openDeleteDialog = id => {
    setDeleteDialog({ open: true, objectiveId: id })
  }

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, objectiveId: null })
  }

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteDialog.objectiveId) {
      deleteObjective(deleteDialog.objectiveId)
    }
  }

  // Close detail dialog
  const closeDetailDialog = () => {
    setDetailDialog({ open: false, objective: null })
  }

  // Get treatment plan description
  const getTreatmentPlanDescription = objective => {
    // ถ้า objective เป็น object ให้ใช้ตามนี้
    if (objective && typeof objective === 'object') {
      if (!objective.riskAssessmentId || objective.riskTreatmentPlanIndex === undefined) {
        return 'N/A'
      }

      const assessment = objective.riskAssessmentId // ใช้ object ที่ populate มาแล้ว
      if (
        !assessment ||
        !assessment.riskTreatmentPlans ||
        !assessment.riskTreatmentPlans[objective.riskTreatmentPlanIndex]
      ) {
        return 'N/A'
      }

      const plan = assessment.riskTreatmentPlans[objective.riskTreatmentPlanIndex]
      return plan.treatmentDescription || 'No description'
    }
    // กรณีแบบเดิมที่ส่ง riskAssessmentId และ planIndex แยกกัน
    else {
      const riskAssessmentId = arguments[0]
      const planIndex = arguments[1]

      if (!riskAssessmentId || planIndex === undefined) return 'N/A'

      const assessment = riskAssessments.find(a => a._id === riskAssessmentId)
      if (!assessment || !assessment.riskTreatmentPlans || !assessment.riskTreatmentPlans[planIndex]) {
        return 'N/A'
      }

      const plan = assessment.riskTreatmentPlans[planIndex]
      return plan.treatmentDescription || 'No description'
    }
  }

  // Format risk treatment options for display
  const formatRiskTreatmentOptions = options => {
    if (!options || options.length === 0) return 'None'

    const displayMap = {
      reduceRisk: 'Reduce Risk',
      transferRisk: 'Transfer Risk',
      avoidRisk: 'Avoid Risk',
      acceptRisk: 'Accept Risk',
      other: 'Other'
    }

    return options.map(opt => displayMap[opt] || opt).join(', ')
  }

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.riskAssessmentId &&
      formData.riskTreatmentPlanIndex !== '' &&
      formData.selectedRiskTreatmentOptions.length > 0 &&
      formData.objectiveTitle &&
      formData.achievementPlan &&
      formData.objectiveLinks.length > 0
    )
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchObjectives()
    fetchRiskAssessments()
  }, [])

  return (
    <>
      <Head>
        <h2 className='text-xl font-bold text-center'>Clause 8: Operational Planning and Control</h2>
      </Head>

      <Container maxWidth='xl'>
        <Box sx={{ py: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            <h2 className='text-xl font-bold text-center'>Clause 8: Operational Planning and Control</h2>
          </Typography>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant='h6'>Objective Planning Management</Typography>
              <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenNewForm}>
                Add New Objective
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity='error'>{error}</Alert>
            ) : objectives.length === 0 ? (
              <Alert severity='info'>No objectives found. Please add a new objective.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Objective Title</TableCell>
                      <TableCell>Treatment Plan</TableCell>
                      <TableCell>Treatment Options</TableCell>
                      <TableCell>KPI Defined</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {objectives.map(objective => (
                      <TableRow key={objective._id}>
                        <TableCell>{objective.objectiveTitle}</TableCell>
                        <TableCell>{getTreatmentPlanDescription(objective)}</TableCell>
                        <TableCell>{formatRiskTreatmentOptions(objective.selectedRiskTreatmentOptions)}</TableCell>
                        <TableCell>
                          {objective.defineKPI ? (
                            <Chip color='success' label='Yes' variant='outlined' size='small' />
                          ) : (
                            <Chip color='default' label='No' variant='outlined' size='small' />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title='View Details'>
                            <IconButton color='primary' onClick={() => viewObjectiveDetails(objective)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Edit'>
                            <IconButton color='primary' onClick={() => fetchObjectiveById(objective._id)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete'>
                            <IconButton color='error' onClick={() => openDeleteDialog(objective._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth='md' fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {isEditMode ? 'Edit Objective' : viewMode ? 'View Objective' : 'Add New Objective'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Risk Assessment Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={viewMode || isEditMode}>
                    <InputLabel id='risk-assessment-label'>Risk Assessment</InputLabel>
                    <Select
                      labelId='risk-assessment-label'
                      value={formData.riskAssessmentId}
                      onChange={handleRiskAssessmentChange}
                      label='Risk Assessment'
                      required
                    >
                      {riskAssessments.map(assessment => (
                        <MenuItem key={assessment._id} value={assessment._id}>
                          {assessment.calculationMethod} (Threshold: {assessment.acceptableRiskThreshold})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Treatment Plan Selection */}
                {selectedRiskAssessment && (
                  <Grid item xs={12}>
                    <FormControl fullWidth disabled={viewMode || isEditMode}>
                      <InputLabel id='treatment-plan-label'>Risk Treatment Plan</InputLabel>
                      <Select
                        labelId='treatment-plan-label'
                        value={formData.riskTreatmentPlanIndex}
                        onChange={handleTreatmentPlanChange}
                        label='Risk Treatment Plan'
                        required
                      >
                        {treatmentPlans.map((plan, index) => (
                          <MenuItem key={index} value={index}>
                            Plan #{index + 1}:{' '}
                            {plan.treatmentDescription
                              ? plan.treatmentDescription.substring(0, 50) + '...'
                              : 'No description'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Risk Treatment Options */}
                {formData.riskTreatmentPlanIndex !== '' && availableRiskTreatmentOptions.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' gutterBottom>
                      Risk Treatment Options
                    </Typography>
                    <FormGroup row>
                      {availableRiskTreatmentOptions.map(option => (
                        <FormControlLabel
                          key={option}
                          control={
                            <Checkbox
                              checked={formData.selectedRiskTreatmentOptions.includes(option)}
                              onChange={handleRiskTreatmentOptionChange}
                              value={option}
                              disabled={viewMode}
                            />
                          }
                          label={
                            option === 'reduceRisk'
                              ? 'Reduce Risk'
                              : option === 'transferRisk'
                                ? 'Transfer Risk'
                                : option === 'avoidRisk'
                                  ? 'Avoid Risk'
                                  : option === 'acceptRisk'
                                    ? 'Accept Risk'
                                    : 'Other'
                          }
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                )}

                {/* Objective Title */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Objective Title'
                    name='objectiveTitle'
                    value={formData.objectiveTitle}
                    onChange={handleInputChange}
                    disabled={viewMode}
                    required
                  />
                </Grid>

                {/* Achievement Plan */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Achievement Plan'
                    name='achievementPlan'
                    value={formData.achievementPlan}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    disabled={viewMode}
                    required
                  />
                </Grid>

                {/* Define KPI */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.defineKPI}
                        onChange={handleInputChange}
                        name='defineKPI'
                        disabled={viewMode}
                      />
                    }
                    label='Define as KPI'
                  />
                </Grid>

                {/* Objective Links */}
                <Grid item xs={12}>
                  <Typography variant='subtitle1' gutterBottom>
                    Objective Linkage
                  </Typography>

                  <Paper variant='outlined' sx={{ p: 2 }}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.objectiveLinks.includes('ยุทธศาสตร์ด้านความมั่นคงปลอดภัย')}
                            onChange={e => {
                              const value = 'ยุทธศาสตร์ด้านความมั่นคงปลอดภัย'
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: [...formData.objectiveLinks, value]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: formData.objectiveLinks.filter(link => link !== value)
                                })
                              }
                            }}
                            disabled={viewMode}
                          />
                        }
                        label='ยุทธศาสตร์ด้านความมั่นคงปลอดภัย'
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.objectiveLinks.includes('แผนนโยบายองค์กร')}
                            onChange={e => {
                              const value = 'แผนนโยบายองค์กร'
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: [...formData.objectiveLinks, value]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: formData.objectiveLinks.filter(link => link !== value)
                                })
                              }
                            }}
                            disabled={viewMode}
                          />
                        }
                        label='แผนนโยบายองค์กร'
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.objectiveLinks.includes('ผลการประเมินบริบทองค์กร')}
                            onChange={e => {
                              const value = 'ผลการประเมินบริบทองค์กร'
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: [...formData.objectiveLinks, value]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: formData.objectiveLinks.filter(link => link !== value)
                                })
                              }
                            }}
                            disabled={viewMode}
                          />
                        }
                        label='ผลการประเมินบริบทองค์กร'
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.objectiveLinks.includes('การประเมินความเสี่ยง')}
                            onChange={e => {
                              const value = 'การประเมินความเสี่ยง'
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: [...formData.objectiveLinks, value]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: formData.objectiveLinks.filter(link => link !== value)
                                })
                              }
                            }}
                            disabled={viewMode}
                          />
                        }
                        label='การประเมินความเสี่ยง'
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.objectiveLinks.includes('กฎหมายและระเบียบภายนอก')}
                            onChange={e => {
                              const value = 'กฎหมายและระเบียบภายนอก'
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: [...formData.objectiveLinks, value]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: formData.objectiveLinks.filter(link => link !== value)
                                })
                              }
                            }}
                            disabled={viewMode}
                          />
                        }
                        label='กฎหมายและระเบียบภายนอก'
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.objectiveLinks.includes('มาตรฐานสากล')}
                            onChange={e => {
                              const value = 'มาตรฐานสากล'
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: [...formData.objectiveLinks, value]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  objectiveLinks: formData.objectiveLinks.filter(link => link !== value)
                                })
                              }
                            }}
                            disabled={viewMode}
                          />
                        }
                        label='มาตรฐานสากล'
                      />

                      {/* "Other" option with text field */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.hasOtherObjectiveLink || false}
                              onChange={e => {
                                // Track "Other" selection in a separate state
                                const isChecked = e.target.checked

                                if (!isChecked) {
                                  // Remove any "Other" entries when unchecked
                                  setFormData({
                                    ...formData,
                                    hasOtherObjectiveLink: false,
                                    objectiveLinks: formData.objectiveLinks.filter(link => !link.startsWith('Other:'))
                                  })
                                  setNewObjectiveLink('')
                                } else {
                                  // When checked, add placeholder or current text
                                  const otherText = newObjectiveLink.trim() || 'โปรดระบุ'
                                  setFormData({
                                    ...formData,
                                    hasOtherObjectiveLink: true,
                                    objectiveLinks: [
                                      ...formData.objectiveLinks.filter(link => !link.startsWith('Other:')),
                                      `Other: ${otherText}`
                                    ]
                                  })
                                }
                              }}
                              disabled={viewMode}
                            />
                          }
                          label='Other (describe)'
                        />

                        {!viewMode &&
                          (formData.hasOtherObjectiveLink ||
                            formData.objectiveLinks.some(link => link.startsWith('Other:'))) && (
                            <TextField
                              sx={{ ml: 2, flex: 1 }}
                              size='small'
                              value={newObjectiveLink}
                              onChange={e => {
                                const inputValue = e.target.value
                                setNewObjectiveLink(inputValue)

                                // Always update the form data with the current input value
                                const updatedLinks = formData.objectiveLinks.filter(link => !link.startsWith('Other:'))
                                if (inputValue.trim() !== '') {
                                  updatedLinks.push(`Other: ${inputValue.trim()}`)
                                } else if (formData.hasOtherObjectiveLink) {
                                  updatedLinks.push('Other: โปรดระบุ')
                                }

                                setFormData({
                                  ...formData,
                                  hasOtherObjectiveLink: true,
                                  objectiveLinks: updatedLinks
                                })
                              }}
                              placeholder='โปรดระบุรายละเอียด'
                              disabled={viewMode}
                            />
                          )}
                      </Box>
                    </FormGroup>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseForm} startIcon={<CancelIcon />}>
                {viewMode ? 'Close' : 'Cancel'}
              </Button>
              {!viewMode && (
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  startIcon={<SaveIcon />}
                  disabled={!isFormValid()}
                >
                  {isEditMode ? 'Update' : 'Save'}
                </Button>
              )}
            </DialogActions>
          </form>
        </Dialog>

        {/* View Detail Dialog */}
        <Dialog open={detailDialog.open} onClose={closeDetailDialog} maxWidth='md' fullWidth>
          <DialogTitle>Objective Details</DialogTitle>
          <DialogContent dividers>
            {detailDialog.objective && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Objective Title:
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {detailDialog.objective.objectiveTitle}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Achievement Plan:
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {detailDialog.objective.achievementPlan}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Risk Treatment Plan:
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {getTreatmentPlanDescription(detailDialog.objective)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Risk Treatment Options:
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {formatRiskTreatmentOptions(detailDialog.objective.selectedRiskTreatmentOptions)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Define as KPI:
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {detailDialog.objective.defineKPI ? 'Yes' : 'No'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                    Objective Links:
                  </Typography>
                  {detailDialog.objective.objectiveLinks && detailDialog.objective.objectiveLinks.length > 0 ? (
                    <Paper variant='outlined' sx={{ p: 2 }}>
                      {detailDialog.objective.objectiveLinks.map((link, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinkIcon color='primary' fontSize='small' sx={{ mr: 1 }} />
                            <Typography variant='body2'>{link}</Typography>
                          </Box>
                          {index < detailDialog.objective.objectiveLinks.length - 1 && <Divider sx={{ my: 1 }} />}
                        </Box>
                      ))}
                    </Paper>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      No links defined
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDetailDialog}>Close</Button>
            <Button
              color='primary'
              onClick={() => {
                closeDetailDialog()
                fetchObjectiveById(detailDialog.objective._id)
              }}
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this objective? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button onClick={confirmDelete} color='error'>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity={notification.severity} variant='filled'>
            {notification.message};
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

export default OperationalPlanningPage
