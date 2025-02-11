'use client'
import { useState } from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

const API_URL = "http://192.168.0.119:3000/api/settings/organization";

const SectionContainer = styled('div')({
  marginBottom: '20px',
  padding: '15px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  backgroundColor: '#f9f9f9'
})

export default function Page() {
  const [policyFile, setPolicyFile] = useState(null)
  const [steeringCommittee, setSteeringCommittee] = useState('')
  const [ismrText, setIsmrText] = useState('')
  const [internalAudit, setInternalAudit] = useState(false)
  const [documentClassification, setDocumentClassification] = useState('')

  const handleFileUpload = event => {
    setPolicyFile(event.target.files[0])
  }

  const handleSave = () => {
    alert('Data Saved Successfully!')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <Typography variant='h4' style={{ marginBottom: '20px', textAlign: 'center' }}>
        Clause 5: Leadership
      </Typography>

      {/* Policy Section */}
      <SectionContainer>
        <Typography variant='h6'>Policy</Typography>
        <input type='file' onChange={handleFileUpload} />
        {policyFile && <p>Uploaded File: {policyFile.name}</p>}

        {/* Internal Audit */}
        <FormControlLabel
          control={<Checkbox checked={internalAudit} onChange={() => setInternalAudit(!internalAudit)} />}
          label='Internal Audit'
        />

        {/* Document Classification */}
        <FormControl fullWidth style={{ marginTop: '10px' }}>
          <InputLabel>Document Classification</InputLabel>
          <Select
            value={documentClassification}
            onChange={e => setDocumentClassification(e.target.value)}
          >
            <MenuItem value="Public">Public</MenuItem>
            <MenuItem value="Internal">Internal</MenuItem>
            <MenuItem value="Confidential">Confidential</MenuItem>
            <MenuItem value="Restricted">Restricted</MenuItem>
          </Select>
        </FormControl>
      </SectionContainer>

      {/* Role and Responsibility Section */}
      <SectionContainer>
        <Typography variant='h6'>Role and Responsibility</Typography>

        {/* ISMS Steering Committee */}
        <Typography variant='subtitle1'>ISMS Steering Committee</Typography>
        <TextField
          fullWidth
          multiline
          label='Enter Responsibility (HTML supported)'
          value={steeringCommittee}
          onChange={e => setSteeringCommittee(e.target.value)}
        />

        {/* ISMR */}
        <Typography variant='subtitle1' style={{ marginTop: '10px' }}>
          ISMR (Information Security Management Representative)
        </Typography>
        <TextField
          fullWidth
          multiline
          label='Enter ISMR Details'
          value={ismrText}
          onChange={e => setIsmrText(e.target.value)}
        />
      </SectionContainer>

      {/* Commitment Section */}
      <SectionContainer>
        <Typography variant='h6'>Commitment</Typography>
        <p>Clause 5: Leadership focuses on the responsibility and commitment required for maintaining ISMS.</p>
      </SectionContainer>

      {/* Save Button */}
      <Button variant='contained' color='primary' fullWidth onClick={handleSave}>
        Save
      </Button>
    </div>
  )
}
