'use client'
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Chip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityIcon from '@mui/icons-material/Visibility'

const RiskAssessmentPage = () => {
  // State for managing risk assessments
  const [riskAssessments, setRiskAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentAssessmentId, setCurrentAssessmentId] = useState(null)
  const [viewMode, setViewMode] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    calculationMethod: 'addition',
    likelihoodLevels: [],
    impactLevels: [],
    acceptableRiskThreshold: 0,
    riskTreatmentPlans: []
  })

  // New level inputs
  const [newLikelihoodLevel, setNewLikelihoodLevel] = useState({ level: '', name: '', description: '' })
  const [newImpactLevel, setNewImpactLevel] = useState({ level: '', name: '', description: '' })

  // New treatment plan
  const [newTreatmentPlan, setNewTreatmentPlan] = useState({
    contextConsiderations: '',
    riskTreatmentOptions: {
      reduceRisk: false,
      transferRisk: false,
      avoidRisk: false,
      acceptRisk: false,
      other: ''
    },
    treatmentDescription: ''
  })

  // Notification
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, assessmentId: null })

  // Detail view dialog
  const [detailDialog, setDetailDialog] = useState({ open: false, assessment: null })

  // Fetch all risk assessments
  const fetchRiskAssessments = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://ismsp-backend.onrender.com/api/6PLAN/risk-assessment')
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

  // Fetch assessment by ID
  const fetchAssessmentById = async (id, viewOnly = false) => {
    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/6PLAN/risk-assessment/${id}`)
      const result = await response.json()

      if (result.success) {
        setFormData(result.data)
        setCurrentAssessmentId(id)

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
      showNotification('Failed to fetch assessment details', 'error')
      console.error(err)
    }
  }

  // View assessment details
  const viewAssessmentDetails = assessment => {
    setDetailDialog({ open: true, assessment })
  }

  // Create new risk assessment
  const createRiskAssessment = async () => {
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/6PLAN/risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Risk assessment created successfully', 'success')
        fetchRiskAssessments()
        handleCloseForm()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to create risk assessment', 'error')
      console.error(err)
    }
  }

  // Update risk assessment
  const updateRiskAssessment = async () => {
    try {
      const response = await fetch(
        `https://ismsp-backend.onrender.com/api/6PLAN/risk-assessment/${currentAssessmentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      )

      const result = await response.json()

      if (result.success) {
        showNotification('Risk assessment updated successfully', 'success')
        fetchRiskAssessments()
        handleCloseForm()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to update risk assessment', 'error')
      console.error(err)
    }
  }

  // Delete risk assessment
  const deleteRiskAssessment = async id => {
    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/6PLAN/risk-assessment/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Risk assessment deleted successfully', 'success')
        fetchRiskAssessments()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to delete risk assessment', 'error')
      console.error(err)
    } finally {
      setDeleteDialog({ open: false, assessmentId: null })
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

  // Open form for creating new assessment
  const handleOpenNewForm = () => {
    setFormData({
      calculationMethod: 'addition',
      likelihoodLevels: [],
      impactLevels: [],
      acceptableRiskThreshold: 0,
      riskTreatmentPlans: []
    })
    setIsEditMode(false)
    setViewMode(false)
    setCurrentAssessmentId(null)
    setIsFormOpen(true)
  }

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setIsEditMode(false)
    setViewMode(false)
    setCurrentAssessmentId(null)
  }

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'acceptableRiskThreshold' ? Number(value) : value
    })
  }

  // Add new likelihood level
  const addLikelihoodLevel = () => {
    if ((newLikelihoodLevel.level && newLikelihoodLevel.name, newLikelihoodLevel.description)) {
      setFormData({
        ...formData,
        likelihoodLevels: [
          ...formData.likelihoodLevels,
          {
            level: Number(newLikelihoodLevel.level),
            name: newLikelihoodLevel.name,
            description: newLikelihoodLevel.description
          }
        ]
      })
      setNewLikelihoodLevel({ level: '', name: '', description: '' })
    }
  }

  // Add new impact level
  const addImpactLevel = () => {
    if (newImpactLevel.level && newImpactLevel.name && newImpactLevel.description) {
      setFormData({
        ...formData,
        impactLevels: [
          ...formData.impactLevels,
          {
            level: Number(newImpactLevel.level),
            name: newImpactLevel.name,
            description: newImpactLevel.description
          }
        ]
      })
      setNewImpactLevel({ level: '', name: '', description: '' })
    }
  }

  // Remove level from likelihood or impact
  const removeLevel = (category, index) => {
    setFormData({
      ...formData,
      [category]: formData[category].filter((_, i) => i !== index)
    })
  }

  // Handle treatment plan input change
  const handleTreatmentPlanChange = e => {
    const { name, value, type, checked } = e.target

    if (name.startsWith('riskTreatmentOptions.')) {
      const optionName = name.split('.')[1]
      setNewTreatmentPlan({
        ...newTreatmentPlan,
        riskTreatmentOptions: {
          ...newTreatmentPlan.riskTreatmentOptions,
          [optionName]: type === 'checkbox' ? checked : value
        }
      })
    } else {
      setNewTreatmentPlan({
        ...newTreatmentPlan,
        [name]: value
      })
    }
  }

  // Add treatment plan
  const addTreatmentPlan = () => {
    if (newTreatmentPlan.contextConsiderations && newTreatmentPlan.treatmentDescription) {
      setFormData({
        ...formData,
        riskTreatmentPlans: [...formData.riskTreatmentPlans, { ...newTreatmentPlan }]
      })

      // Reset new treatment plan
      setNewTreatmentPlan({
        contextConsiderations: '',
        riskTreatmentOptions: {
          reduceRisk: false,
          transferRisk: false,
          avoidRisk: false,
          acceptRisk: false,
          other: ''
        },
        treatmentDescription: ''
      })
    } else {
      showNotification('Please fill all required treatment plan fields', 'warning')
    }
  }

  // Remove treatment plan
  const removeTreatmentPlan = index => {
    setFormData({
      ...formData,
      riskTreatmentPlans: formData.riskTreatmentPlans.filter((_, i) => i !== index)
    })
  }

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault()
    if (isEditMode) {
      updateRiskAssessment()
    } else {
      createRiskAssessment()
    }
  }

  // Open delete confirmation dialog
  const openDeleteDialog = id => {
    setDeleteDialog({ open: true, assessmentId: id })
  }

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, assessmentId: null })
  }

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteDialog.assessmentId) {
      deleteRiskAssessment(deleteDialog.assessmentId)
    }
  }

  // Close detail dialog
  const closeDetailDialog = () => {
    setDetailDialog({ open: false, assessment: null })
  }

  // Get total number of levels
  const getLevelCount = (assessment, type) => {
    return assessment[type].length
  }

  // Get total number of treatment plans
  const getTreatmentPlanCount = assessment => {
    return assessment.riskTreatmentPlans.length
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchRiskAssessments()
  }, [])

  return (
    <>
      <Head>
        <title>6.2 - Risk Assessment and Treatment Criteria</title>
      </Head>

      <Container maxWidth='xl'>
        <Box sx={{ py: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            6.2 - Risk Assessment and Treatment Criteria
          </Typography>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant='h6'>Risk Assessment Management</Typography>
              <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenNewForm}>
                Add New Assessment
              </Button>
            </Box>

            {loading ? (
              <Typography>Loading risk assessments...</Typography>
            ) : error ? (
              <Alert severity='error'>{error}</Alert>
            ) : riskAssessments.length === 0 ? (
              <Alert severity='info'>No risk assessments found. Please add new assessment criteria.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Calculation Method</TableCell>
                      <TableCell>Likelihood Levels</TableCell>
                      <TableCell>Impact Levels</TableCell>
                      <TableCell>Acceptable Risk Threshold</TableCell>
                      <TableCell>Treatment Plans</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riskAssessments.map(assessment => (
                      <TableRow key={assessment._id}>
                        <TableCell>{assessment.calculationMethod}</TableCell>
                        <TableCell>{getLevelCount(assessment, 'likelihoodLevels')} levels</TableCell>
                        <TableCell>{getLevelCount(assessment, 'impactLevels')} levels</TableCell>
                        <TableCell>{assessment.acceptableRiskThreshold}</TableCell>
                        <TableCell>{getTreatmentPlanCount(assessment)} plans</TableCell>
                        <TableCell>
                          <Tooltip title='View Details'>
                            <IconButton color='primary' onClick={() => viewAssessmentDetails(assessment)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Edit'>
                            <IconButton color='primary' onClick={() => fetchAssessmentById(assessment._id)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete'>
                            <IconButton color='error' onClick={() => openDeleteDialog(assessment._id)}>
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
        <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth='lg' fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {isEditMode ? 'Edit Risk Assessment' : viewMode ? 'View Risk Assessment' : 'Add New Risk Assessment'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={viewMode}>
                    <InputLabel id='calculation-method-label'>Calculation Method</InputLabel>
                    <Select
                      labelId='calculation-method-label'
                      name='calculationMethod'
                      value={formData.calculationMethod}
                      onChange={handleInputChange}
                      label='Calculation Method'
                    >
                      <MenuItem value='addition'>Addition</MenuItem>
                      <MenuItem value='multiplication'>Multiplication</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Acceptable Risk Threshold'
                    name='acceptableRiskThreshold'
                    type='number'
                    value={formData.acceptableRiskThreshold}
                    onChange={handleInputChange}
                    disabled={viewMode}
                  />
                </Grid>

                {/* Likelihood Levels Section */}
                <Grid item xs={12}>
                  <Accordion defaultExpanded>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls='likelihood-levels-content'
                      id='likelihood-levels-header'
                    >
                      <Typography variant='h6'>Likelihood Levels</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {!viewMode && (
                        <Box sx={{ mb: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={2}>
                              <TextField
                                label='Level'
                                type='number'
                                value={newLikelihoodLevel.level}
                                onChange={e => setNewLikelihoodLevel({ ...newLikelihoodLevel, level: e.target.value })}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                label='Name'
                                type='string'
                                value={newLikelihoodLevel.name}
                                onChange={e => setNewLikelihoodLevel({ ...newLikelihoodLevel, name: e.target.value })}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={8}>
                              <TextField
                                label='Description'
                                value={newLikelihoodLevel.description}
                                onChange={e =>
                                  setNewLikelihoodLevel({ ...newLikelihoodLevel, description: e.target.value })
                                }
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <Button
                                variant='contained'
                                onClick={addLikelihoodLevel}
                                fullWidth
                                sx={{ height: '100%' }}
                              >
                                Add
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      <TableContainer component={Paper} variant='outlined' sx={{ mb: 3 }}>
                        <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell>Level</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Description</TableCell>
                              {!viewMode && <TableCell align='center'>Action</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {formData.likelihoodLevels.map((level, index) => (
                              <TableRow key={index}>
                                <TableCell>{level.level}</TableCell>
                                <TableCell>{level.name}</TableCell>
                                <TableCell>{level.description}</TableCell>
                                {!viewMode && (
                                  <TableCell align='center'>
                                    <IconButton
                                      size='small'
                                      color='error'
                                      onClick={() => removeLevel('likelihoodLevels', index)}
                                    >
                                      <DeleteIcon fontSize='small' />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                            {formData.likelihoodLevels.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={viewMode ? 2 : 3} align='center'>
                                  No levels added
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Impact Levels Section */}
                <Grid item xs={12}>
                  <Accordion defaultExpanded>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls='impact-levels-content'
                      id='impact-levels-header'
                    >
                      <Typography variant='h6'>Impact Levels</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {!viewMode && (
                        <Box sx={{ mb: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={2}>
                              <TextField
                                label='Level'
                                type='number'
                                value={newImpactLevel.level}
                                onChange={e => setNewImpactLevel({ ...newImpactLevel, level: e.target.value })}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                label='Name'
                                type='string'
                                value={newImpactLevel.name}
                                onChange={e => setNewImpactLevel({ ...newImpactLevel, name: e.target.value })}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={8}>
                              <TextField
                                label='Description'
                                value={newImpactLevel.description}
                                onChange={e => setNewImpactLevel({ ...newImpactLevel, description: e.target.value })}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <Button variant='contained' onClick={addImpactLevel} fullWidth sx={{ height: '100%' }}>
                                Add
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      <TableContainer component={Paper} variant='outlined' sx={{ mb: 3 }}>
                        <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell>Level</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Description</TableCell>
                              {!viewMode && <TableCell align='center'>Action</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {formData.impactLevels.map((level, index) => (
                              <TableRow key={index}>
                                <TableCell>{level.level}</TableCell>
                                <TableCell>{level.name}</TableCell>
                                <TableCell>{level.description}</TableCell>
                                {!viewMode && (
                                  <TableCell align='center'>
                                    <IconButton
                                      size='small'
                                      color='error'
                                      onClick={() => removeLevel('impactLevels', index)}
                                    >
                                      <DeleteIcon fontSize='small' />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                            {formData.impactLevels.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={viewMode ? 2 : 3} align='center'>
                                  No levels added
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Risk Treatment Plans Section */}
                <Grid item xs={12}>
                  <Accordion defaultExpanded>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls='treatment-plans-content'
                      id='treatment-plans-header'
                    >
                      <Typography variant='h6'>Risk Treatment Plans</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {!viewMode && (
                        <Paper variant='outlined' sx={{ p: 2, mb: 3 }}>
                          <Typography variant='subtitle1' gutterBottom>
                            Add New Treatment Plan
                          </Typography>

                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                label='Context Considerations'
                                name='contextConsiderations'
                                value={newTreatmentPlan.contextConsiderations}
                                onChange={handleTreatmentPlanChange}
                                fullWidth
                                multiline
                                rows={2}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Typography variant='subtitle2' gutterBottom>
                                Risk Treatment Options
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={newTreatmentPlan.riskTreatmentOptions.reduceRisk}
                                        onChange={handleTreatmentPlanChange}
                                        name='riskTreatmentOptions.reduceRisk'
                                      />
                                    }
                                    label='Reduce Risk'
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={newTreatmentPlan.riskTreatmentOptions.transferRisk}
                                        onChange={handleTreatmentPlanChange}
                                        name='riskTreatmentOptions.transferRisk'
                                      />
                                    }
                                    label='Transfer Risk'
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={newTreatmentPlan.riskTreatmentOptions.avoidRisk}
                                        onChange={handleTreatmentPlanChange}
                                        name='riskTreatmentOptions.avoidRisk'
                                      />
                                    }
                                    label='Avoid Risk'
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={newTreatmentPlan.riskTreatmentOptions.acceptRisk}
                                        onChange={handleTreatmentPlanChange}
                                        name='riskTreatmentOptions.acceptRisk'
                                      />
                                    }
                                    label='Accept Risk'
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                label='Other Treatment Options'
                                name='riskTreatmentOptions.other'
                                value={newTreatmentPlan.riskTreatmentOptions.other}
                                onChange={handleTreatmentPlanChange}
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                label='Treatment Description'
                                name='treatmentDescription'
                                value={newTreatmentPlan.treatmentDescription}
                                onChange={handleTreatmentPlanChange}
                                fullWidth
                                multiline
                                rows={3}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Button variant='contained' onClick={addTreatmentPlan} startIcon={<AddIcon />}>
                                Add Treatment Plan
                              </Button>
                            </Grid>
                          </Grid>
                        </Paper>
                      )}

                      <Typography variant='subtitle1' gutterBottom>
                        Current Treatment Plans
                      </Typography>

                      <Grid container spacing={2}>
                        {formData.riskTreatmentPlans.length === 0 ? (
                          <Grid item xs={12}>
                            <Alert severity='info'>No treatment plans added yet</Alert>
                          </Grid>
                        ) : (
                          formData.riskTreatmentPlans.map((plan, index) => (
                            <Grid item xs={12} key={index}>
                              <Card variant='outlined'>
                                <CardContent>
                                  <Typography variant='h6' gutterBottom>
                                    Treatment Plan #{index + 1}
                                  </Typography>

                                  <Typography variant='subtitle2' gutterBottom>
                                    Context Considerations:
                                  </Typography>
                                  <Typography paragraph>{plan.contextConsiderations}</Typography>

                                  <Typography variant='subtitle2' gutterBottom>
                                    Risk Treatment Options:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {plan.riskTreatmentOptions.reduceRisk && (
                                      <Chip label='Reduce Risk' color='primary' variant='outlined' />
                                    )}
                                    {plan.riskTreatmentOptions.transferRisk && (
                                      <Chip label='Transfer Risk' color='primary' variant='outlined' />
                                    )}
                                    {plan.riskTreatmentOptions.avoidRisk && (
                                      <Chip label='Avoid Risk' color='primary' variant='outlined' />
                                    )}
                                    {plan.riskTreatmentOptions.acceptRisk && (
                                      <Chip label='Accept Risk' color='primary' variant='outlined' />
                                    )}
                                  </Box>

                                  {plan.riskTreatmentOptions.other && (
                                    <>
                                      <Typography variant='subtitle2' gutterBottom>
                                        Other Options:
                                      </Typography>
                                      <Typography paragraph>{plan.riskTreatmentOptions.other}</Typography>
                                    </>
                                  )}

                                  <Typography variant='subtitle2' gutterBottom>
                                    Treatment Description:
                                  </Typography>
                                  <Typography paragraph>{plan.treatmentDescription}</Typography>
                                </CardContent>
                                {!viewMode && (
                                  <CardActions>
                                    <Button
                                      size='small'
                                      color='error'
                                      startIcon={<DeleteIcon />}
                                      onClick={() => removeTreatmentPlan(index)}
                                    >
                                      Remove
                                    </Button>
                                  </CardActions>
                                )}
                              </Card>
                            </Grid>
                          ))
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseForm} startIcon={<CancelIcon />}>
                {viewMode ? 'Close' : 'Cancel'}
              </Button>
              {!viewMode && (
                <Button type='submit' variant='contained' color='primary' startIcon={<SaveIcon />}>
                  {isEditMode ? 'Update' : 'Save'}
                </Button>
              )}
            </DialogActions>
          </form>
        </Dialog>

        {/* View Detail Dialog */}
        <Dialog open={detailDialog.open} onClose={closeDetailDialog} maxWidth='md' fullWidth>
          <DialogTitle>Risk Assessment Details</DialogTitle>
          <DialogContent dividers>
            {detailDialog.assessment && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1'>Calculation Method:</Typography>
                  <Typography variant='body1' gutterBottom>
                    {detailDialog.assessment.calculationMethod}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1'>Acceptable Risk Threshold:</Typography>
                  <Typography variant='body1' gutterBottom>
                    {detailDialog.assessment.acceptableRiskThreshold}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant='h6' gutterBottom>
                    Likelihood Levels
                  </Typography>
                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Level</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailDialog.assessment.likelihoodLevels.map((level, index) => (
                          <TableRow key={index}>
                            <TableCell>{level.level}</TableCell>
                            <TableCell>{level.description}</TableCell>
                          </TableRow>
                        ))}
                        {detailDialog.assessment.likelihoodLevels.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} align='center'>
                              No levels defined
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='h6' gutterBottom>
                    Impact Levels
                  </Typography>
                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Level</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailDialog.assessment.impactLevels.map((level, index) => (
                          <TableRow key={index}>
                            <TableCell>{level.level}</TableCell>
                            <TableCell>{level.description}</TableCell>
                          </TableRow>
                        ))}
                        {detailDialog.assessment.impactLevels.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} align='center'>
                              No levels defined
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='h6' gutterBottom>
                    Risk Treatment Plans
                  </Typography>
                  {detailDialog.assessment.riskTreatmentPlans.length === 0 ? (
                    <Alert severity='info'>No treatment plans defined</Alert>
                  ) : (
                    detailDialog.assessment.riskTreatmentPlans.map((plan, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Card variant='outlined'>
                          <CardContent>
                            <Typography variant='subtitle1' gutterBottom>
                              Treatment Plan #{index + 1}
                            </Typography>

                            <Typography variant='subtitle2'>Context Considerations:</Typography>
                            <Typography paragraph>{plan.contextConsiderations}</Typography>

                            <Typography variant='subtitle2'>Risk Treatment Options:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                              {plan.riskTreatmentOptions.reduceRisk && (
                                <Chip label='Reduce Risk' color='primary' variant='outlined' />
                              )}
                              {plan.riskTreatmentOptions.transferRisk && (
                                <Chip label='Transfer Risk' color='primary' variant='outlined' />
                              )}
                              {plan.riskTreatmentOptions.avoidRisk && (
                                <Chip label='Avoid Risk' color='primary' variant='outlined' />
                              )}
                              {plan.riskTreatmentOptions.acceptRisk && (
                                <Chip label='Accept Risk' color='primary' variant='outlined' />
                              )}
                            </Box>

                            {plan.riskTreatmentOptions.other && (
                              <>
                                <Typography variant='subtitle2'>Other Options:</Typography>
                                <Typography paragraph>{plan.riskTreatmentOptions.other}</Typography>
                              </>
                            )}

                            <Typography variant='subtitle2'>Treatment Description:</Typography>
                            <Typography paragraph>{plan.treatmentDescription}</Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    ))
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
                fetchAssessmentById(detailDialog.assessment._id, true)
              }}
            >
              View in Form
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this risk assessment? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button onClick={confirmDelete} color='error'>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

export default RiskAssessmentPage
