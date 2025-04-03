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
  TableRow
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

const RiskCriteriaPage = () => {
  // State for managing risk criteria
  const [riskCriteria, setRiskCriteria] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentCriteriaId, setCurrentCriteriaId] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    calculationMethod: 'addition',
    confidentialityLevels: [],
    integrityLevels: [],
    availabilityLevels: [],
    criticalAssetThreshold: 0
  })

  // New level inputs
  const [newConfLevel, setNewConfLevel] = useState({ level: '', name: '', description: '' })
  const [newIntLevel, setNewIntLevel] = useState({ level: '', name: '', description: '' })
  const [newAvailLevel, setNewAvailLevel] = useState({ level: '', name: '', description: '' })

  // Notification
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, criteriaId: null })

  // Fetch all risk criteria
  const fetchRiskCriteria = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://ismsp-backend.onrender.com/api/6PLAN/risk-criteria')
      const result = await response.json()

      if (result.success) {
        setRiskCriteria(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to fetch risk criteria')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch criteria by ID
  const fetchCriteriaById = async id => {
    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/6PLAN/risk-criteria/${id}`)
      const result = await response.json()

      if (result.success) {
        setFormData(result.data)
        setCurrentCriteriaId(id)
        setIsEditMode(true)
        setIsFormOpen(true)
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to fetch criteria details', 'error')
      console.error(err)
    }
  }

  // Create new risk criteria
  const createRiskCriteria = async () => {
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/6PLAN/risk-criteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Risk criteria created successfully', 'success')
        fetchRiskCriteria()
        handleCloseForm()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to create risk criteria', 'error')
      console.error(err)
    }
  }

  // Update risk criteria
  const updateRiskCriteria = async () => {
    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/6PLAN/risk-criteria/${currentCriteriaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Risk criteria updated successfully', 'success')
        fetchRiskCriteria()
        handleCloseForm()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to update risk criteria', 'error')
      console.error(err)
    }
  }

  // Delete risk criteria
  const deleteRiskCriteria = async id => {
    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/6PLAN/risk-criteria/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Risk criteria deleted successfully', 'success')
        fetchRiskCriteria()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to delete risk criteria', 'error')
      console.error(err)
    } finally {
      setDeleteDialog({ open: false, criteriaId: null })
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

  // Open form for creating new criteria
  const handleOpenNewForm = () => {
    setFormData({
      calculationMethod: 'addition',
      confidentialityLevels: [],
      integrityLevels: [],
      availabilityLevels: [],
      criticalAssetThreshold: 0
    })
    setIsEditMode(false)
    setCurrentCriteriaId(null)
    setIsFormOpen(true)
  }

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setIsEditMode(false)
    setCurrentCriteriaId(null)
  }

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'criticalAssetThreshold' ? Number(value) : value
    })
  }

  // Add new confidentiality level
  const addConfidentialityLevel = () => {
    if (newConfLevel.level && newConfLevel.name && newConfLevel.description) {
      setFormData({
        ...formData,
        confidentialityLevels: [
          ...formData.confidentialityLevels,
          { level: Number(newConfLevel.level), name: newConfLevel.name, description: newConfLevel.description }
        ]
      })
      setNewConfLevel({ level: '', name: '', description: '' })
    }
  }

  // Add new integrity level
  const addIntegrityLevel = () => {
    if (newIntLevel.level && newIntLevel.name && newIntLevel.description) {
      setFormData({
        ...formData,
        integrityLevels: [
          ...formData.integrityLevels,
          { level: Number(newIntLevel.level), name: newIntLevel.name, description: newIntLevel.description }
        ]
      })
      setNewIntLevel({ level: '', name: '', description: '' })
    }
  }

  // Add new availability level
  const addAvailabilityLevel = () => {
    if (newAvailLevel.level && newAvailLevel.name && newAvailLevel.description) {
      setFormData({
        ...formData,
        availabilityLevels: [
          ...formData.availabilityLevels,
          { level: Number(newAvailLevel.level), name: newAvailLevel.name, description: newAvailLevel.description }
        ]
      })
      setNewAvailLevel({ level: '', name: '', description: '' })
    }
  }

  // Remove level from any category
  const removeLevel = (category, index) => {
    setFormData({
      ...formData,
      [category]: formData[category].filter((_, i) => i !== index)
    })
  }

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault()
    if (isEditMode) {
      updateRiskCriteria()
    } else {
      createRiskCriteria()
    }
  }

  // Open delete confirmation dialog
  const openDeleteDialog = id => {
    setDeleteDialog({ open: true, criteriaId: id })
  }

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, criteriaId: null })
  }

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteDialog.criteriaId) {
      deleteRiskCriteria(deleteDialog.criteriaId)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchRiskCriteria()
  }, [])

  return (
    <>
      <Head>
        <title>6.1 - Actions to Address Risks and Opportunities</title>
      </Head>

      <Container maxWidth='xl'>
        <Box sx={{ py: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            6.1 - Actions to Address Risks and Opportunities
          </Typography>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant='h6'>Risk Criteria Management</Typography>
              <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenNewForm}>
                Add New Criteria
              </Button>
            </Box>

            {loading ? (
              <Typography>Loading risk criteria...</Typography>
            ) : error ? (
              <Alert severity='error'>{error}</Alert>
            ) : riskCriteria.length === 0 ? (
              <Alert severity='info'>No risk criteria found. Please add new criteria.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Calculation Method</TableCell>
                      <TableCell>Confidentiality Levels</TableCell>
                      <TableCell>Integrity Levels</TableCell>
                      <TableCell>Availability Levels</TableCell>
                      <TableCell>Critical Asset Threshold</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riskCriteria.map(criteria => (
                      <TableRow key={criteria._id}>
                        <TableCell>{criteria.calculationMethod}</TableCell>
                        <TableCell>{criteria.confidentialityLevels.length} levels</TableCell>
                        <TableCell>{criteria.integrityLevels.length} levels</TableCell>
                        <TableCell>{criteria.availabilityLevels.length} levels</TableCell>
                        <TableCell>{criteria.criticalAssetThreshold}</TableCell>
                        <TableCell>
                          <IconButton color='primary' onClick={() => fetchCriteriaById(criteria._id)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color='error' onClick={() => openDeleteDialog(criteria._id)}>
                            <DeleteIcon />
                          </IconButton>
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
            <DialogTitle>{isEditMode ? 'Edit Risk Criteria' : 'Add New Risk Criteria'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
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

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Critical Asset Threshold'
                    name='criticalAssetThreshold'
                    type='number'
                    value={formData.criticalAssetThreshold}
                    onChange={handleInputChange}
                  />
                </Grid>

                {/* Confidentiality Levels */}
                <Grid item xs={12}>
                  <Typography variant='h6' gutterBottom>
                    Confidentiality Levels
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={2}>
                        <TextField
                          label='Level'
                          type='number'
                          value={newConfLevel.level}
                          onChange={e => setNewConfLevel({ ...newConfLevel, level: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label='Name'
                          type='string'
                          value={newConfLevel.name}
                          onChange={e => setNewConfLevel({ ...newConfLevel, name: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          label='Description'
                          value={newConfLevel.description}
                          onChange={e => setNewConfLevel({ ...newConfLevel, description: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button variant='contained' onClick={addConfidentialityLevel} fullWidth sx={{ height: '100%' }}>
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <TableContainer component={Paper} variant='outlined' sx={{ mb: 3 }}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Level</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align='center'>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.confidentialityLevels.map((level, index) => (
                          <TableRow key={index}>
                            <TableCell>{level.level}</TableCell>
                            <TableCell>{level.name}</TableCell>
                            <TableCell>{level.description}</TableCell>
                            <TableCell align='center'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => removeLevel('confidentialityLevels', index)}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {formData.confidentialityLevels.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} align='center'>
                              No levels added
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Integrity Levels */}
                <Grid item xs={12}>
                  <Typography variant='h6' gutterBottom>
                    Integrity Levels
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={2}>
                        <TextField
                          label='Level'
                          type='number'
                          value={newIntLevel.level}
                          onChange={e => setNewIntLevel({ ...newIntLevel, level: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label='Name'
                          type='string'
                          value={newIntLevel.name}
                          onChange={e => setNewIntLevel({ ...newIntLevel, name: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          label='Description'
                          value={newIntLevel.description}
                          onChange={e => setNewIntLevel({ ...newIntLevel, description: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button variant='contained' onClick={addIntegrityLevel} fullWidth sx={{ height: '100%' }}>
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <TableContainer component={Paper} variant='outlined' sx={{ mb: 3 }}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Level</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align='center'>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.integrityLevels.map((level, index) => (
                          <TableRow key={index}>
                            <TableCell>{level.level}</TableCell>
                            <TableCell>{level.name}</TableCell>
                            <TableCell>{level.description}</TableCell>
                            <TableCell align='center'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => removeLevel('integrityLevels', index)}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {formData.integrityLevels.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} align='center'>
                              No levels added
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Availability Levels */}
                <Grid item xs={12}>
                  <Typography variant='h6' gutterBottom>
                    Availability Levels
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={2}>
                        <TextField
                          label='Level'
                          type='number'
                          value={newAvailLevel.level}
                          onChange={e => setNewAvailLevel({ ...newAvailLevel, level: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label='Name'
                          type='string'
                          value={newAvailLevel.name}
                          onChange={e => setNewAvailLevel({ ...newAvailLevel, name: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          label='Description'
                          value={newAvailLevel.description}
                          onChange={e => setNewAvailLevel({ ...newAvailLevel, description: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button variant='contained' onClick={addAvailabilityLevel} fullWidth sx={{ height: '100%' }}>
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Level</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align='center'>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.availabilityLevels.map((level, index) => (
                          <TableRow key={index}>
                            <TableCell>{level.level}</TableCell>
                            <TableCell>{level.name}</TableCell>
                            <TableCell>{level.description}</TableCell>
                            <TableCell align='center'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => removeLevel('availabilityLevels', index)}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {formData.availabilityLevels.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} align='center'>
                              No levels added
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseForm} startIcon={<CancelIcon />}>
                Cancel
              </Button>
              <Button type='submit' variant='contained' startIcon={<SaveIcon />}>
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this risk criteria? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button onClick={confirmDelete} color='error' variant='contained'>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

export default RiskCriteriaPage
