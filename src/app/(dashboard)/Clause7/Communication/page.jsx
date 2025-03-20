'use client'

import { useState } from 'react'
import { Box, Button, Grid, Paper, TextField, Typography, IconButton, MenuItem, Select } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'

const Communication = () => {
  const [communications, setCommunications] = useState([])
  const [communicationFiles, setCommunicationFiles] = useState({
    ismsPlan: [],
    externalPolicy: []
  })
  const [isEditingGlobal, setIsEditingGlobal] = useState(true)

  const addCommunication = () => {
    setCommunications(prev => [
      ...prev,
      {
        id: Date.now(),
        title: '',
        date: '',
        communicationType: 'internal',
        channel: '',
        isEditing: true
      }
    ])
  }

  const updateCommunication = (id, key, value) => {
    setCommunications(prev => prev.map(comm => (comm.id === id ? { ...comm, [key]: value } : comm)))
  }

  const removeCommunication = id => {
    setCommunications(prev => prev.filter(comm => comm.id !== id))
  }

  const toggleEditCommunication = id => {
    setCommunications(prev => prev.map(comm => (comm.id === id ? { ...comm, isEditing: !comm.isEditing } : comm)))
  }

  const addFile = (category, files) => {
    setCommunicationFiles(prev => ({
      ...prev,
      [category]: [...prev[category], ...files]
    }))
  }

  const removeFile = (category, index) => {
    setCommunicationFiles(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }))
  }

  return (
    <Box p={4} bgcolor='white' boxShadow={3} borderRadius={2}>
      {/* Global Save & Edit Button */}
      <Box display='flex' justifyContent='flex-end' mb={2}>
        <Button
          variant='contained'
          color={isEditingGlobal ? 'secondary' : 'warning'}
          onClick={() => setIsEditingGlobal(!isEditingGlobal)}
        >
          {isEditingGlobal ? 'Save All' : 'Edit All'}
        </Button>
      </Box>

      <Typography variant='h4' align='center' gutterBottom fontWeight='bold'>
        Clause 7: Communication
      </Typography>

      <Grid container spacing={3}>
        {communications.map(comm => (
          <Grid item xs={12} key={comm.id}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box display='flex' justifyContent='flex-end' mb={1}>
                <IconButton
                  color={comm.isEditing ? 'primary' : 'warning'}
                  onClick={() => toggleEditCommunication(comm.id)}
                >
                  {comm.isEditing ? <SaveIcon /> : <EditIcon />}
                </IconButton>
                <IconButton color='error' onClick={() => removeCommunication(comm.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='หัวข้อการสื่อสาร'
                    value={comm.title}
                    disabled={!comm.isEditing}
                    onChange={e => updateCommunication(comm.id, 'title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type='date'
                    label='วันที่สื่อสาร'
                    value={comm.date}
                    disabled={!comm.isEditing}
                    onChange={e => updateCommunication(comm.id, 'date', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    value={comm.communicationType}
                    disabled={!comm.isEditing}
                    onChange={e => updateCommunication(comm.id, 'communicationType', e.target.value)}
                  >
                    <MenuItem value='internal'>การสื่อสารภายใน (Internal Communication)</MenuItem>
                    <MenuItem value='external'>การสื่อสารภายนอก (External Communication)</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='ช่องทางที่ใช้สื่อสาร'
                    value={comm.channel}
                    disabled={!comm.isEditing}
                    onChange={e => updateCommunication(comm.id, 'channel', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button
            variant='contained'
            color='primary'
            onClick={addCommunication}
            startIcon={<AddCircleOutline />}
            sx={{ mt: 2 }}
          >
            Add Communication
          </Button>
        </Grid>

        {/* File Upload Section */}
        {Object.keys(communicationFiles).map((category, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant='h6' gutterBottom fontWeight='bold'>
                {getCategoryLabel(category)}
              </Typography>

              {communicationFiles[category].map((file, idx) => (
                <Box key={idx} display='flex' alignItems='center' gap={2} mb={1}>
                  <Typography>{file.name}</Typography>
                  <IconButton color='error' onClick={() => removeFile(category, idx)}>
                    <RemoveCircleOutline />
                  </IconButton>
                </Box>
              ))}

              <FileUploadButton
                disabled={!isEditingGlobal}
                onChange={e => addFile(category, Array.from(e.target.files))}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

// Function to get category label
function getCategoryLabel(category) {
  const labels = {
    ismsPlan: 'แผนการสื่อสารภายในเกี่ยวกับ ISMS',
    externalPolicy: 'นโยบายการสื่อสารภายนอก'
  }
  return labels[category] || category
}

// File Upload Button Component
function FileUploadButton({ disabled, onChange }) {
  return (
    <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />} disabled={disabled}>
      Upload Files
      <input type='file' hidden multiple onChange={onChange} />
    </Button>
  )
}

export default Communication
