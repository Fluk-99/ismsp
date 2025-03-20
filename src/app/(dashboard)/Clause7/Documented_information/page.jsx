'use client'

import { useState, useEffect } from 'react'
import { Box, Button, Grid, Paper, TextField, Typography, IconButton, MenuItem, Select } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'

const API_BASE_URL = 'http://192.168.0.119:3000/api/7SUPP/documentedInfo'

const Doc = () => {
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`)
      if (!response.ok) throw new Error('Failed to fetch documents')

      const data = await response.json()
      setDocuments(Array.isArray(data.data) ? data.data : [])
    } catch (error) {
      console.error('❌ Error fetching documents:', error)
      setDocuments([])
    }
  }

  const addDocument = () => {
    setDocuments(prev => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        documentName: '',
        documentType: 'Policy',
        documentOwner: '',
        documentVersion: 'v1.0',
        documentStatus: 'Draft',
        documentRetention: '5 Years',
        documentReviewPeriod: '1 Year',
        documentFile: null,
        isEditing: true
      }
    ])
  }

  const updateDocument = (id, key, value) => {
    setDocuments(prev => prev.map(doc => (doc.id === id ? { ...doc, [key]: value } : doc)))
  }

  const saveDocument = async doc => {
    try {
      let response

      const formData = new FormData()
      formData.append('documentName', doc.documentName)
      formData.append('documentType', doc.documentType)
      formData.append('documentOwner', doc.documentOwner)
      formData.append('documentVersion', doc.documentVersion)
      formData.append('documentStatus', doc.documentStatus)
      formData.append('documentRetention', doc.documentRetention)
      formData.append('documentReviewPeriod', doc.documentReviewPeriod)
      if (doc.documentFile) formData.append('documentFile', doc.documentFile)

      if (doc.id.toString().startsWith('new')) {
        response = await fetch(`${API_BASE_URL}/create`, {
          method: 'POST',
          body: formData
        })
      } else {
        response = await fetch(`${API_BASE_URL}/${doc.id}`, {
          method: 'PUT',
          body: formData
        })
      }

      if (!response.ok) throw new Error(`Error saving document ${doc.id}`)
      fetchDocuments()
    } catch (error) {
      console.error('❌ Error saving document:', error)
    }
  }

  const removeDocument = async id => {
    try {
      if (!id.toString().startsWith('new')) {
        await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' })
      }
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    } catch (error) {
      console.error('❌ Error deleting document:', error)
    }
  }

  const handleFileUpload = (id, event) => {
    const file = event.target.files[0]
    updateDocument(id, 'documentFile', file)
  }

  return (
    <Box p={4} bgcolor='white' boxShadow={3} borderRadius={2}>
      <Typography variant='h4' align='center' gutterBottom fontWeight='bold'>
        Clause 7: Documented Information
      </Typography>

      <Grid container spacing={3}>
        {documents.map(doc => (
          <Grid item xs={12} key={doc.id}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box display='flex' justifyContent='flex-end' mb={1}>
                <IconButton color='primary' onClick={() => saveDocument(doc)}>
                  <SaveIcon />
                </IconButton>
                <IconButton color='error' onClick={() => removeDocument(doc.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Document Name'
                    value={doc.documentName}
                    onChange={e => updateDocument(doc.id, 'documentName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    value={doc.documentType}
                    onChange={e => updateDocument(doc.id, 'documentType', e.target.value)}
                  >
                    <MenuItem value='Policy'>Policy</MenuItem>
                    <MenuItem value='Procedure'>Procedure</MenuItem>
                    <MenuItem value='Record'>Record</MenuItem>
                    <MenuItem value='Report'>Report</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Document Owner'
                    value={doc.documentOwner}
                    onChange={e => updateDocument(doc.id, 'documentOwner', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Version'
                    value={doc.documentVersion}
                    onChange={e => updateDocument(doc.id, 'documentVersion', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    value={doc.documentStatus}
                    onChange={e => updateDocument(doc.id, 'documentStatus', e.target.value)}
                  >
                    <MenuItem value='Draft'>Draft</MenuItem>
                    <MenuItem value='Approved'>Approved</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Retention Period'
                    value={doc.documentRetention}
                    onChange={e => updateDocument(doc.id, 'documentRetention', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Review Period'
                    value={doc.documentReviewPeriod}
                    onChange={e => updateDocument(doc.id, 'documentReviewPeriod', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box mt={2}>
                <FileUploadButton onChange={e => handleFileUpload(doc.id, e)} />
                {doc.documentFile && <Typography sx={{ mt: 1, color: 'gray' }}>{doc.documentFile.name}</Typography>}
              </Box>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button
            variant='contained'
            color='primary'
            onClick={addDocument}
            startIcon={<AddCircleOutline />}
            sx={{ mt: 2 }}
          >
            Add Document
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

// File Upload Button Component
function FileUploadButton({ onChange }) {
  return (
    <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
      Upload File
      <input type='file' hidden onChange={onChange} />
    </Button>
  )
}

export default Doc
