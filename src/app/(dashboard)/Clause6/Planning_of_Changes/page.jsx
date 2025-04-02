'use client'
import { useState, useEffect, useRef } from 'react'
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
  MenuItem
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { format } from 'date-fns'

const ChangePlanPage = () => {
  // State for managing change plans
  const [changePlans, setChangePlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPlanId, setCurrentPlanId] = useState(null)
  const [viewMode, setViewMode] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    reason: '',
    changeDetails: '',
    startDate: null,
    endDate: null
  })

  // File upload refs
  const referenceDocumentRef = useRef(null)
  const approverSignatureRef = useRef(null)

  // File state
  const [referenceDocument, setReferenceDocument] = useState(null)
  const [approverSignature, setApproverSignature] = useState(null)

  // Selected files for display
  const [selectedReferenceDocument, setSelectedReferenceDocument] = useState(null)
  const [selectedApproverSignature, setSelectedApproverSignature] = useState(null)

  // Notification
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, planId: null })

  // Detail view dialog
  const [detailDialog, setDetailDialog] = useState({ open: false, plan: null })

  // Base URL for API
  const baseUrl = 'http://192.168.0.119:3000'

  // Fetch all change plans
  const fetchChangePlans = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/6PLAN/change-plan`)
      const result = await response.json()

      if (result.success) {
        setChangePlans(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to fetch change plans')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch change plan by ID
  const fetchChangePlanById = async (id, viewOnly = false) => {
    try {
      const response = await fetch(`${baseUrl}/api/6PLAN/change-plan/${id}`)
      const result = await response.json()

      if (result.success) {
        const plan = result.data
        setFormData({
          title: plan.title,
          reason: plan.reason,
          changeDetails: plan.changeDetails,
          startDate: new Date(plan.startDate),
          endDate: new Date(plan.endDate)
        })

        // Set file info for display
        setSelectedReferenceDocument(plan.referenceDocument)
        setSelectedApproverSignature(plan.approverSignature)

        setCurrentPlanId(id)

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
      showNotification('Failed to fetch change plan details', 'error')
      console.error(err)
    }
  }

  // View change plan details
  const viewChangePlanDetails = plan => {
    setDetailDialog({ open: true, plan })
  }

  // Create FormData for file uploads
  const createFormDataWithFiles = () => {
    const data = new FormData()

    // Add form fields
    data.append('title', formData.title)
    data.append('reason', formData.reason)
    data.append('changeDetails', formData.changeDetails)
    data.append('startDate', formData.startDate.toISOString())
    data.append('endDate', formData.endDate.toISOString())

    // Add files if selected
    if (referenceDocument) {
      data.append('referenceDocument', referenceDocument)
    }

    if (approverSignature) {
      data.append('approverSignature', approverSignature)
    }

    return data
  }

  // Create new change plan
  const createChangePlan = async () => {
    try {
      const formDataWithFiles = createFormDataWithFiles()

      const response = await fetch(`${baseUrl}/api/6PLAN/change-plan`, {
        method: 'POST',
        body: formDataWithFiles
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Change plan created successfully', 'success')
        fetchChangePlans()
        handleCloseForm()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to create change plan', 'error')
      console.error(err)
    }
  }

  // Update change plan
  const updateChangePlan = async () => {
    try {
      // For update, we might need to handle files differently depending on the API
      const formDataWithFiles = createFormDataWithFiles()

      const response = await fetch(`${baseUrl}/api/6PLAN/change-plan/${currentPlanId}`, {
        method: 'PUT',
        body: formDataWithFiles
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Change plan updated successfully', 'success')
        fetchChangePlans()
        handleCloseForm()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to update change plan', 'error')
      console.error(err)
    }
  }

  // Delete change plan
  const deleteChangePlan = async id => {
    try {
      const response = await fetch(`${baseUrl}/api/6PLAN/change-plan/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        showNotification('Change plan deleted successfully', 'success')
        fetchChangePlans()
      } else {
        showNotification(result.message, 'error')
      }
    } catch (err) {
      showNotification('Failed to delete change plan', 'error')
      console.error(err)
    } finally {
      setDeleteDialog({ open: false, planId: null })
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

  // Open form for creating new plan
  const handleOpenNewForm = () => {
    setFormData({
      title: '',
      reason: '',
      changeDetails: '',
      startDate: null,
      endDate: null
    })
    setReferenceDocument(null)
    setApproverSignature(null)
    setSelectedReferenceDocument(null)
    setSelectedApproverSignature(null)
    setIsEditMode(false)
    setViewMode(false)
    setCurrentPlanId(null)
    setIsFormOpen(true)
  }

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setIsEditMode(false)
    setViewMode(false)
    setCurrentPlanId(null)
    // Reset file inputs
    if (referenceDocumentRef.current) {
      referenceDocumentRef.current.value = ''
    }
    if (approverSignatureRef.current) {
      approverSignatureRef.current.value = ''
    }
  }

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle date change
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    })
  }

  // Handle file selection
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0]
    if (file) {
      if (fileType === 'referenceDocument') {
        setReferenceDocument(file)
        setSelectedReferenceDocument({
          fileName: file.name,
          filePath: URL.createObjectURL(file)
        })
      } else if (fileType === 'approverSignature') {
        setApproverSignature(file)
        setSelectedApproverSignature({
          fileName: file.name,
          filePath: URL.createObjectURL(file)
        })
      }
    }
  }

  // Trigger file input click
  const triggerFileInput = fileType => {
    if (fileType === 'referenceDocument' && referenceDocumentRef.current) {
      referenceDocumentRef.current.click()
    } else if (fileType === 'approverSignature' && approverSignatureRef.current) {
      approverSignatureRef.current.click()
    }
  }

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault()
    if (isEditMode) {
      updateChangePlan()
    } else {
      createChangePlan()
    }
  }

  // Open delete confirmation dialog
  const openDeleteDialog = id => {
    setDeleteDialog({ open: true, planId: id })
  }

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, planId: null })
  }

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteDialog.planId) {
      deleteChangePlan(deleteDialog.planId)
    }
  }

  // Close detail dialog
  const closeDetailDialog = () => {
    setDetailDialog({ open: false, plan: null })
  }

  // Format date for display
  const formatDate = dateString => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy')
    } catch (e) {
      return 'Invalid date'
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    return formData.title && formData.reason && formData.changeDetails && formData.startDate && formData.endDate
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchChangePlans()
  }, [])

  return (
    <>
      <Head>
        <title>6.3 - Planning of Changes</title>
      </Head>

      <Container maxWidth='xl'>
        <Box sx={{ py: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            6.3 - Planning of Changes
          </Typography>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant='h6'>Change Plan Management</Typography>
              <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenNewForm}>
                Add New Change Plan
              </Button>
            </Box>

            {loading ? (
              <Typography>Loading change plans...</Typography>
            ) : error ? (
              <Alert severity='error'>{error}</Alert>
            ) : changePlans.length === 0 ? (
              <Alert severity='info'>No change plans found. Please add a new plan.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Has Reference</TableCell>
                      <TableCell>Has Approval</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {changePlans.map(plan => (
                      <TableRow key={plan._id}>
                        <TableCell>{plan.title}</TableCell>
                        <TableCell>
                          {plan.reason.length > 30 ? `${plan.reason.substring(0, 30)}...` : plan.reason}
                        </TableCell>
                        <TableCell>{formatDate(plan.startDate)}</TableCell>
                        <TableCell>{formatDate(plan.endDate)}</TableCell>
                        <TableCell>{plan.referenceDocument ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{plan.approverSignature ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <Tooltip title='View Details'>
                            <IconButton color='primary' onClick={() => viewChangePlanDetails(plan)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Edit'>
                            <IconButton color='primary' onClick={() => fetchChangePlanById(plan._id)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete'>
                            <IconButton color='error' onClick={() => openDeleteDialog(plan._id)}>
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
              {isEditMode ? 'Edit Change Plan' : viewMode ? 'View Change Plan' : 'Add New Change Plan'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Title'
                    name='title'
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={viewMode}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Reason for Change'
                    name='reason'
                    value={formData.reason}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    disabled={viewMode}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Change Details'
                    name='changeDetails'
                    value={formData.changeDetails}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    disabled={viewMode}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label='Start Date'
                      value={formData.startDate}
                      onChange={date => handleDateChange('startDate', date)}
                      renderInput={params => <TextField {...params} fullWidth required />}
                      disabled={viewMode}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label='End Date'
                      value={formData.endDate}
                      onChange={date => handleDateChange('endDate', date)}
                      renderInput={params => <TextField {...params} fullWidth required />}
                      disabled={viewMode}
                      minDate={formData.startDate}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant='subtitle1'>Document References</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant='outlined' sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant='subtitle1' gutterBottom>
                        Reference Document
                      </Typography>

                      {selectedReferenceDocument ? (
                        <Box>
                          <Typography variant='body2' gutterBottom>
                            {selectedReferenceDocument.fileName}
                          </Typography>

                          {selectedReferenceDocument.filePath && (
                            <Button
                              variant='outlined'
                              size='small'
                              target='_blank'
                              href={`${baseUrl}${selectedReferenceDocument.filePath}`}
                              disabled={!selectedReferenceDocument.filePath.startsWith('/')}
                            >
                              View Document
                            </Button>
                          )}
                        </Box>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          No reference document selected
                        </Typography>
                      )}

                      {!viewMode && (
                        <Box sx={{ mt: 2 }}>
                          <input
                            type='file'
                            ref={referenceDocumentRef}
                            style={{ display: 'none' }}
                            onChange={e => handleFileChange(e, 'referenceDocument')}
                          />
                          <Button
                            variant='contained'
                            startIcon={<UploadFileIcon />}
                            size='small'
                            onClick={() => triggerFileInput('referenceDocument')}
                          >
                            {selectedReferenceDocument ? 'Change Document' : 'Upload Document'}
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant='outlined' sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant='subtitle1' gutterBottom>
                        Approver Signature
                      </Typography>

                      {selectedApproverSignature ? (
                        <Box>
                          <Typography variant='body2' gutterBottom>
                            {selectedApproverSignature.fileName}
                          </Typography>

                          {selectedApproverSignature.filePath && (
                            <Button
                              variant='outlined'
                              size='small'
                              target='_blank'
                              href={`${baseUrl}${selectedApproverSignature.filePath}`}
                              disabled={!selectedApproverSignature.filePath.startsWith('/')}
                            >
                              View Signature
                            </Button>
                          )}
                        </Box>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          No signature selected
                        </Typography>
                      )}

                      {!viewMode && (
                        <Box sx={{ mt: 2 }}>
                          <input
                            type='file'
                            ref={approverSignatureRef}
                            style={{ display: 'none' }}
                            onChange={e => handleFileChange(e, 'approverSignature')}
                          />
                          <Button
                            variant='contained'
                            startIcon={<UploadFileIcon />}
                            size='small'
                            onClick={() => triggerFileInput('approverSignature')}
                          >
                            {selectedApproverSignature ? 'Change Signature' : 'Upload Signature'}
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
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
          <DialogTitle>Change Plan Details</DialogTitle>
          <DialogContent dividers>
            {detailDialog.plan && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant='subtitle1'>Title:</Typography>
                  <Typography variant='body1' gutterBottom>
                    {detailDialog.plan.title}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1'>Reason for Change:</Typography>
                  <Typography variant='body1' gutterBottom>
                    {detailDialog.plan.reason}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1'>Change Details:</Typography>
                  <Typography variant='body1' paragraph>
                    {detailDialog.plan.changeDetails}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1'>Start Date:</Typography>
                  <Typography variant='body1' gutterBottom>
                    {formatDate(detailDialog.plan.startDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1'>End Date:</Typography>
                  <Typography variant='body1' gutterBottom>
                    {formatDate(detailDialog.plan.endDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant='h6' gutterBottom>
                    Documents
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Typography variant='subtitle1' gutterBottom>
                        Reference Document
                      </Typography>

                      {detailDialog.plan.referenceDocument ? (
                        <Box>
                          <Typography variant='body2' gutterBottom>
                            {detailDialog.plan.referenceDocument.fileName}
                          </Typography>
                          <Button
                            variant='outlined'
                            size='small'
                            startIcon={<AttachFileIcon />}
                            href={`${baseUrl}${detailDialog.plan.referenceDocument.filePath}`}
                            target='_blank'
                          >
                            View Document
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          No reference document attached
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Typography variant='subtitle1' gutterBottom>
                        Approver Signature
                      </Typography>

                      {detailDialog.plan.approverSignature ? (
                        <Box>
                          <Typography variant='body2' gutterBottom>
                            {detailDialog.plan.approverSignature.fileName}
                          </Typography>
                          <Button
                            variant='outlined'
                            size='small'
                            startIcon={<AttachFileIcon />}
                            href={`${baseUrl}${detailDialog.plan.approverSignature.filePath}`}
                            target='_blank'
                          >
                            View Signature
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          No approver signature attached
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
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
                fetchChangePlanById(detailDialog.plan._id, true)
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
            <Typography>Are you sure you want to delete this change plan? This action cannot be undone.</Typography>
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

export default ChangePlanPage
