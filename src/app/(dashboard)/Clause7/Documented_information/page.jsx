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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import SaveIcon from '@mui/icons-material/Save'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/Description'

const API_BASE_URL = 'https://ismsp-backend.onrender.com/api'

const DocumentedInformation = () => {
  const [documents, setDocuments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchDocuments()
    fetchEmployees()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/7SUPP/documentedInfo`)
      if (!response.ok) throw new Error(`Fetch error: ${response.statusText}`)
      const data = await response.json()

      setDocuments(
        data.data.map(doc => ({
          ...doc,
          documentFile: null,
          fileName: doc.filePath ? doc.filePath.split('/').pop() : '',
          isEditing: false,
          owner: typeof doc.owner === 'object' && doc.owner !== null ? doc.owner._id : doc.owner || ''
        }))
      )
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      showSnackbar('ไม่สามารถโหลดข้อมูลเอกสารได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/employee`)
      if (!response.ok) throw new Error('Failed to fetch employees')
      const data = await response.json()
      setEmployees(data.data || [])
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const addDocument = () => {
    setDocuments(prev => [
      ...prev,
      {
        _id: `new-${Date.now()}`,
        documentName: '',
        documentType: 'Policy',
        owner: '',
        version: 'v1.0',
        status: 'Draft',
        retentionPeriod: '1 ปี',
        reviewCycle: '1 ปี',
        documentFile: null,
        fileName: '',
        isEditing: true
      }
    ])
  }

  const updateDocument = (id, key, value) => {
    setDocuments(prev => prev.map(doc => (doc._id === id ? { ...doc, [key]: value } : doc)))
  }

  const handleFileChange = (id, file) => {
    setDocuments(prev => prev.map(doc => (doc._id === id ? { ...doc, documentFile: file, fileName: file.name } : doc)))
  }

  const toggleEdit = async id => {
    const doc = documents.find(d => d._id === id)
    if (doc.isEditing) {
      await saveDocument(doc, false)
      setDocuments(prev => prev.map(d => (d._id === id ? { ...d, isEditing: false } : d)))
    } else {
      setDocuments(prev => prev.map(d => (d._id === id ? { ...d, isEditing: true } : d)))
    }
  }

  const saveDocument = async (doc, refreshAll = true) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('documentName', doc.documentName)
      formData.append('documentType', doc.documentType)
      formData.append('owner', doc.owner)
      formData.append('version', doc.version)
      formData.append('status', doc.status)
      formData.append('retentionPeriod', doc.retentionPeriod)
      formData.append('reviewCycle', doc.reviewCycle)
      if (doc.documentFile) formData.append('file', doc.documentFile)

      const isNewDoc = doc._id.startsWith('new')
      const url = isNewDoc
        ? `${API_BASE_URL}/7SUPP/documentedInfo/create`
        : `${API_BASE_URL}/7SUPP/documentedInfo/${doc._id}`

      const response = await fetch(url, {
        method: isNewDoc ? 'POST' : 'PUT',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to save document')

      const savedData = await response.json()

      showSnackbar('บันทึกข้อมูลสำเร็จ', 'success')

      if (refreshAll) {
        fetchDocuments()
      } else if (isNewDoc && savedData?.data) {
        setDocuments(prev =>
          prev.map(d =>
            d._id === doc._id
              ? {
                  ...d,
                  _id: savedData.data._id || d._id,
                  isEditing: false
                }
              : d
          )
        )
      }
    } catch (error) {
      console.error('Failed to save document:', error)
      showSnackbar('ไม่สามารถบันทึกเอกสารได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async id => {
    try {
      if (!id.startsWith('new')) {
        const response = await fetch(`${API_BASE_URL}/7SUPP/documentedInfo/${id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to delete')
      }
      setDocuments(prev => prev.filter(doc => doc._id !== id))
      showSnackbar('ลบข้อมูลสำเร็จ', 'success')
    } catch (error) {
      console.error('Failed to delete document:', error)
      showSnackbar('ไม่สามารถลบเอกสารได้', 'error')
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }))

  return (
    <Box p={4} borderRadius={2} position='relative'>
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

      <Typography variant='h4' align='center' fontWeight='bold'>
        Clause 7.5: Documented Information
      </Typography>
      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {documents.map(doc => (
          <Grid item xs={12} key={doc._id}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h6' fontWeight='bold'>
                  Document
                </Typography>
                <Box>
                  <IconButton onClick={() => toggleEdit(doc._id)} color='primary'>
                    {doc.isEditing ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                  <IconButton onClick={() => deleteDocument(doc._id)} color='error'>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label='Document Name'
                    value={doc.documentName}
                    onChange={e => updateDocument(doc._id, 'documentName', e.target.value)}
                    disabled={!doc.isEditing}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label='Version'
                    value={doc.version}
                    onChange={e => updateDocument(doc._id, 'version', e.target.value)}
                    disabled={!doc.isEditing}
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth disabled={!doc.isEditing}>
                    <InputLabel>Owner</InputLabel>
                    <Select
                      value={doc.owner}
                      onChange={e => updateDocument(doc._id, 'owner', e.target.value)}
                      label='Owner'
                    >
                      {employees.map(emp => (
                        <MenuItem key={emp._id} value={emp._id}>
                          {emp.name} - {emp.department?.name || ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label='Review Cycle'
                    value={doc.reviewCycle}
                    onChange={e => updateDocument(doc._id, 'reviewCycle', e.target.value)}
                    disabled={!doc.isEditing}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label='Retention Period'
                    value={doc.retentionPeriod}
                    onChange={e => updateDocument(doc._id, 'retentionPeriod', e.target.value)}
                    disabled={!doc.isEditing}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth disabled={!doc.isEditing}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={doc.documentType}
                      onChange={e => updateDocument(doc._id, 'documentType', e.target.value)}
                      label='Type'
                    >
                      <MenuItem value='Policy'>Policy</MenuItem>
                      <MenuItem value='Procedure'>Procedure</MenuItem>
                      <MenuItem value='Record'>Record</MenuItem>
                      <MenuItem value='Report'>Report</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth disabled={!doc.isEditing}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={doc.status}
                      onChange={e => updateDocument(doc._id, 'status', e.target.value)}
                      label='Status'
                    >
                      <MenuItem value='Draft'>Draft</MenuItem>
                      <MenuItem value='Approved'>Approved</MenuItem>
                      <MenuItem value='Retired'>Retired</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder='Upload Document'
                    value={doc.fileName || ''}
                    InputProps={{
                      readOnly: true,
                      startAdornment: doc.fileName && (
                        <InputAdornment position='start'>
                          <DescriptionIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton component='label' disabled={!doc.isEditing}>
                            <CloudUploadIcon />
                            <input type='file' hidden onChange={e => handleFileChange(doc._id, e.target.files[0])} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    disabled={!doc.isEditing}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button variant='contained' startIcon={<AddCircleOutline />} onClick={addDocument}>
            Add Document
          </Button>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default DocumentedInformation
