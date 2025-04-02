'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Tooltip,
  OutlinedInput
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import SaveIcon from '@mui/icons-material/Save'
import DescriptionIcon from '@mui/icons-material/Description'
import FilterListIcon from '@mui/icons-material/FilterList'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.119:3000/api'

const ResourcesForm = () => {
  // State for resources
  const [resources, setResources] = useState([])
  const [filteredResources, setFilteredResources] = useState([])
  const [newResource, setNewResource] = useState({
    resourceName: '',
    category: '',
    description: '',
    status: 'Active',
    file: null,
    fileName: ''
  })
  const [editMode, setEditMode] = useState(false)
  const [currentResourceId, setCurrentResourceId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    description: '',
    status: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Load data on component mount
  useEffect(() => {
    fetchResources()
  }, [])

  // Apply filters whenever resources or filters change
  useEffect(() => {
    applyFilters()
  }, [resources, filters])

  // Fetch all resources
  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/7SUPP/resource/files`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setResources(data.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching resources:', error)
      showNotification('Unable to load resource data', 'error')
      setLoading(false)
    }
  }

  // Update form values
  const handleChange = e => {
    const { name, value } = e.target
    setNewResource(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle file upload
  const handleFileChange = e => {
    if (e.target.files[0]) {
      setNewResource(prev => ({
        ...prev,
        file: e.target.files[0],
        fileName: e.target.files[0].name
      }))
    }
  }

  // Save or update resource
  const handleSubmit = async e => {
    e.preventDefault()

    try {
      setLoading(true)

      // Validate required fields (no file validation)
      if (!newResource.resourceName.trim() || !newResource.category) {
        showNotification('Please enter required information (resource name and category)', 'error')
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('resourceName', newResource.resourceName)
      formData.append('category', newResource.category)
      formData.append('description', newResource.description)
      formData.append('status', newResource.status)

      // Only attach file if one was selected
      if (newResource.file) {
        formData.append('file', newResource.file)
      }

      let response

      if (editMode && currentResourceId) {
        // Update existing resource
        response = await fetch(`${API_BASE_URL}/7SUPP/resource/${currentResourceId}`, {
          method: 'PUT',
          body: formData
        })
      } else {
        // Create new resource
        response = await fetch(`${API_BASE_URL}/7SUPP/resource/upload`, {
          method: 'POST',
          body: formData
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      // Reset form
      setNewResource({
        resourceName: '',
        category: '',
        description: '',
        status: 'Active',
        file: null,
        fileName: ''
      })
      setEditMode(false)
      setCurrentResourceId(null)

      // Reload data
      await fetchResources()
      showNotification(editMode ? 'Resource updated successfully' : 'Resource added successfully', 'success')
      setLoading(false)
    } catch (error) {
      console.error('Error saving resource:', error)
      showNotification('Unable to save resource data', 'error')
      setLoading(false)
    }
  }

  // Start editing a resource
  const handleEdit = resource => {
    setNewResource({
      resourceName: resource.resourceName,
      category: resource.category,
      description: resource.description || '',
      status: resource.status,
      file: null,
      fileName: resource.fileName || ''
    })
    setEditMode(true)
    setCurrentResourceId(resource._id)
  }

  // Delete a resource
  const handleDelete = async id => {
    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/7SUPP/resource/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      await fetchResources()
      showNotification('Resource deleted successfully', 'success')
      setLoading(false)
    } catch (error) {
      console.error('Error deleting resource:', error)
      showNotification('Unable to delete resource', 'error')
      setLoading(false)
    }
  }

  // Download file
  const handleDownload = fileName => {
    if (!fileName) return
    window.open(`${API_BASE_URL}/7SUPP/resource/download/${fileName}`, '_blank')
  }

  // Show notification
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    })
  }

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  // Handle filter changes
  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      description: '',
      status: ''
    })
  }

  // Apply filters to resources
  const applyFilters = () => {
    let filtered = [...resources]

    if (filters.category) {
      filtered = filtered.filter(resource => resource.category === filters.category)
    }

    if (filters.description) {
      filtered = filtered.filter(
        resource =>
          resource.description && resource.description.toLowerCase().includes(filters.description.toLowerCase())
      )
    }

    if (filters.status) {
      filtered = filtered.filter(resource => resource.status === filters.status)
    }

    setFilteredResources(filtered)
  }

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters)
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
          bgcolor='rgba(255, 255, 255, 0.7)'
          zIndex={10}
        >
          <CircularProgress />
        </Box>
      )}

      <Typography variant='h4' align='center' gutterBottom fontWeight='bold'>
        Clause 7.1: Resources
      </Typography>
      <Typography variant='subtitle1' align='center' color='text.secondary' paragraph>
        Identification and allocation of resources necessary for the establishment, implementation, maintenance, and
        continual improvement of the ISMS
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Resource Form */}
      <Paper variant='outlined' sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant='h6' gutterBottom>
          {editMode ? 'Edit Resource' : 'Add New Resource'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label='Resource Name'
                name='resourceName'
                value={newResource.resourceName}
                onChange={handleChange}
                variant='outlined'
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select name='category' value={newResource.category} onChange={handleChange} label='Category'>
                  <MenuItem value='Personnel'>Personnel</MenuItem>
                  <MenuItem value='Budget'>Budget</MenuItem>
                  <MenuItem value='Information System'>Information System</MenuItem>
                  <MenuItem value='Hardware'>Hardware</MenuItem>
                  <MenuItem value='Data'>Data</MenuItem>
                  <MenuItem value='Service'>Service</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                name='description'
                value={newResource.description}
                onChange={handleChange}
                variant='outlined'
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name='status' value={newResource.status} onChange={handleChange} label='Status'>
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Inactive'>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 1, p: 1 }}>
                <Typography
                  variant='body2'
                  sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {newResource.fileName || 'No file selected (optional)'}
                </Typography>
                <Button component='label' variant='contained' startIcon={<UploadFileIcon />}>
                  Upload File
                  <input type='file' hidden onChange={handleFileChange} />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {editMode && (
                <Button
                  variant='outlined'
                  onClick={() => {
                    setNewResource({
                      resourceName: '',
                      category: '',
                      description: '',
                      status: 'Active',
                      file: null,
                      fileName: ''
                    })
                    setEditMode(false)
                    setCurrentResourceId(null)
                  }}
                >
                  Cancel
                </Button>
              )}

              <Button
                type='submit'
                variant='contained'
                color='primary'
                startIcon={editMode ? <SaveIcon /> : <AddIcon />}
              >
                {editMode ? 'Save Changes' : 'Add Resource'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Resource Table */}
      <Paper variant='outlined' sx={{ mb: 4, borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>Resource List</Typography>
          <Box>
            <Button variant='outlined' startIcon={<FilterListIcon />} onClick={toggleFilters} sx={{ mr: 1 }}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {showFilters && (
              <Button variant='outlined' startIcon={<RestartAltIcon />} onClick={resetFilters}>
                Reset Filters
              </Button>
            )}
          </Box>
        </Box>

        {/* Filter Section */}
        {showFilters && (
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant='outlined' size='small'>
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    name='category'
                    value={filters.category}
                    onChange={handleFilterChange}
                    label='Filter by Category'
                  >
                    <MenuItem value=''>All Categories</MenuItem>
                    <MenuItem value='Personnel'>Personnel</MenuItem>
                    <MenuItem value='Budget'>Budget</MenuItem>
                    <MenuItem value='Information System'>Information System</MenuItem>
                    <MenuItem value='Hardware'>Hardware</MenuItem>
                    <MenuItem value='Data'>Data</MenuItem>
                    <MenuItem value='Service'>Service</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant='outlined' size='small'>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select name='status' value={filters.status} onChange={handleFilterChange} label='Filter by Status'>
                    <MenuItem value=''>All Statuses</MenuItem>
                    <MenuItem value='Active'>Active</MenuItem>
                    <MenuItem value='Inactive'>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width='30%'>Resource Name</TableCell>
                <TableCell width='15%'>Category</TableCell>
                <TableCell width='25%'>Description</TableCell>
                <TableCell width='10%'>Status</TableCell>
                <TableCell width='10%'>Document</TableCell>
                <TableCell width='10%' align='center'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    No resources found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResources.map(resource => (
                  <TableRow key={resource._id}>
                    <TableCell>{resource.resourceName}</TableCell>
                    <TableCell>{resource.category}</TableCell>
                    <TableCell>{resource.description || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={resource.status}
                        size='small'
                        color={resource.status === 'Active' ? 'success' : 'error'}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      {resource.fileName ? (
                        <Tooltip title='Download Document'>
                          <IconButton size='small' onClick={() => handleDownload(resource.fileName)}>
                            <DescriptionIcon color='primary' />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        'No file'
                      )}
                    </TableCell>
                    <TableCell align='center'>
                      <Tooltip title='Edit'>
                        <IconButton size='small' onClick={() => handleEdit(resource)} sx={{ color: 'secondary' }}>
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton size='small' onClick={() => handleDelete(resource._id)} sx={{ color: 'secondary' }}>
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Resource Summary */}
      <Paper variant='outlined' sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant='h6' gutterBottom>
          Resource Summary
        </Typography>

        <Grid container spacing={3}>
          {/* Personnel */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#bbdefb',
                borderRadius: 2,
                border: '1px solid #64b5f6',
                textAlign: 'center'
              }}
            >
              <Typography variant='h5' fontWeight='bold' color='#1976d2'>
                {resources.filter(r => r.category === 'Personnel').length}
              </Typography>
              <Typography>Personnel</Typography>
            </Paper>
          </Grid>

          {/* Budget */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#c8e6c9',
                borderRadius: 2,
                border: '1px solid #81c784',
                textAlign: 'center'
              }}
            >
              <Typography variant='h5' fontWeight='bold' color='#388e3c'>
                {resources.filter(r => r.category === 'Budget').length}
              </Typography>
              <Typography>Budget</Typography>
            </Paper>
          </Grid>

          {/* Information System */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#f3e5f5',
                borderRadius: 2,
                border: '1px solid #ce93d8',
                textAlign: 'center'
              }}
            >
              <Typography variant='h5' fontWeight='bold' color='#9c27b0'>
                {resources.filter(r => r.category === 'Information System').length}
              </Typography>
              <Typography>Information System</Typography>
            </Paper>
          </Grid>

          {/* Hardware */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#fff3e0',
                borderRadius: 2,
                border: '1px solid #ffb74d',
                textAlign: 'center'
              }}
            >
              <Typography variant='h5' fontWeight='bold' color='#fb8c00'>
                {resources.filter(r => r.category === 'Hardware').length}
              </Typography>
              <Typography>Hardware</Typography>
            </Paper>
          </Grid>

          {/* Data */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#e1f5fe',
                borderRadius: 2,
                border: '1px solid #4fc3f7',
                textAlign: 'center'
              }}
            >
              <Typography variant='h5' fontWeight='bold' color='#039be5'>
                {resources.filter(r => r.category === 'Data').length}
              </Typography>
              <Typography>Data</Typography>
            </Paper>
          </Grid>

          {/* Service */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#fce4ec',
                borderRadius: 2,
                border: '1px solid #f06292',
                textAlign: 'center'
              }}
            >
              <Typography variant='h5' fontWeight='bold' color='#ec407a'>
                {resources.filter(r => r.category === 'Service').length}
              </Typography>
              <Typography>Service</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ResourcesForm
