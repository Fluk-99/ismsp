'use client'
import { useState, useEffect } from 'react'
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Box,
  Link,
  Typography,
  IconButton
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'

export default function InformationSecurityPolicy() {
  const [policyTitle, setPolicyTitle] = useState('')
  const [policyVersion, setPolicyVersion] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [approver, setApprover] = useState('')
  const [scope, setScope] = useState('')
  const [securityPractices, setSecurityPractices] = useState([])
  const [communicationMethod, setCommunicationMethod] = useState('')
  const [policyStatus, setPolicyStatus] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [attachmentName, setAttachmentName] = useState('')
  const [policies, setPolicies] = useState([])

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      const response = await fetch('http://192.168.0.119:3000/api/5LEAD/information-security-policy')
      const data = await response.json()
      if (Array.isArray(data)) {
        setPolicies(data)
      } else {
        console.error('Data format incorrect', data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleFileUpload = async event => {
    const file = event.target.files[0]
    setAttachment(file)
    if (file) setAttachmentName(file.name)
  }

  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('policyTitle', policyTitle)
    formData.append('policyVersion', policyVersion)
    formData.append('effectiveDate', effectiveDate)
    formData.append('approver', approver)
    formData.append('scope', scope)
    formData.append('securityPractices', JSON.stringify(securityPractices))
    formData.append('communicationMethod', communicationMethod)
    formData.append('policyStatus', policyStatus)
    if (attachment) formData.append('attachment', attachment)

    try {
      const response = await fetch('http://192.168.0.119:3000/api/5LEAD/information-security-policy/create', {
        method: 'POST',
        body: formData
      })
      if (!response.ok) throw new Error('Failed to save data')
      alert('Policy saved successfully!')
      fetchPolicies()
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred while saving the policy')
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return
    try {
      const response = await fetch(`http://192.168.0.119:3000/api/5LEAD/information-security-policy/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete policy')
      setPolicies(policies.filter(policy => policy._id !== id))
      alert('Policy deleted successfully!')
    } catch (error) {
      console.error('Error deleting data:', error)
      alert('An error occurred while deleting the policy')
    }
  }

  return (
    <div className='p-6 bg-white shadow-lg rounded-lg max-w-2xl mx-auto'>
      <h2 className='text-xl font-bold text-center'>Clause 5: Leadership</h2>
      <p className='text-center text-gray-600 mb-4'>5.2 Information Security Policy</p>

      <TextField
        fullWidth
        label='Policy Title'
        value={policyTitle}
        onChange={e => setPolicyTitle(e.target.value)}
        className='mb-4'
      />

      <TextField
        fullWidth
        label='Policy Version'
        value={policyVersion}
        onChange={e => setPolicyVersion(e.target.value)}
        className='mb-4'
      />
      <TextField
        fullWidth
        label='Effective Date'
        type='date'
        InputLabelProps={{ shrink: true }}
        value={effectiveDate}
        onChange={e => setEffectiveDate(e.target.value)}
        className='mb-4'
      />
      <TextField
        fullWidth
        label='Approver'
        value={approver}
        onChange={e => setApprover(e.target.value)}
        className='mb-4'
      />
      <TextField fullWidth label='Scope' value={scope} onChange={e => setScope(e.target.value)} className='mb-4' />
      <TextField
        fullWidth
        label='Communication Method'
        value={communicationMethod}
        onChange={e => setCommunicationMethod(e.target.value)}
        className='mb-4'
      />
      <FormControl fullWidth className='mb-4'>
        <InputLabel>Security Practices</InputLabel>
        <Select multiple value={securityPractices} onChange={e => setSecurityPractices(e.target.value)}>
          <MenuItem value='Access Control'>Access Control</MenuItem>
          <MenuItem value='Data Protection'>Data Protection</MenuItem>
          <MenuItem value='Risk Management'>Risk Management</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth className='mb-4'>
        <InputLabel>Policy Status</InputLabel>
        <Select value={policyStatus} onChange={e => setPolicyStatus(e.target.value)}>
          <MenuItem value='Active'>Active</MenuItem>
          <MenuItem value='Under Review'>Under Review</MenuItem>
          <MenuItem value='Revoked'>Revoked</MenuItem>
        </Select>
      </FormControl>
      <Grid item xs={6}>
        <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
          Upload Document
          <input type='file' hidden onChange={e => handleFileUpload(e, setAttachments, setAttachmentName)} />
        </Button>
        {attachmentName && (
          <Typography variant='body2' color='textSecondary'>
            {attachmentName}
          </Typography>
        )}
      </Grid>
      <Button
        variant='contained'
        color='primary'
        sx={{ marginLeft: '16px', padding: '8px 16px' }} // ✅ เพิ่มระยะห่าง
        onClick={handleSubmit}
      >
        Save Policy
      </Button>

      <div className='mt-6'>
        <h3 className='text-lg font-bold'>Recorded Policies</h3>
        {policies.map(policy => (
          <Box key={policy._id} className='p-4 border rounded mt-2 relative'>
            <IconButton
              onClick={() => handleDelete(policy._id)}
              sx={{ position: 'absolute', top: 5, right: 5, color: 'secondary' }}
            >
              <DeleteIcon />
            </IconButton>
            <p>
              <strong>Policy Title:</strong> {policy.policyTitle}
            </p>
            <p>
              <strong>Version:</strong> {policy.policyVersion}
            </p>
            <p>
              <strong>Effective Date:</strong> {new Date(policy.effectiveDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Approved By:</strong> {policy.approver}
            </p>
            <p>
              <strong>Scope:</strong> {policy.scope}
            </p>
            <p>
              <strong>Security Practices:</strong> {policy.securityPractices.join(', ')}
            </p>
            <p>
              <strong>Communication Method:</strong> {policy.communicationMethod}
            </p>
            <p>
              <strong>Policy Status:</strong>{' '}
              <Typography
                variant='body1'
                component='span' // ✅ ใช้ <span> แทน <p> เพื่อให้อยู่บรรทัดเดียวกัน
                sx={{
                  fontWeight: 'bold',
                  color:
                    policy.policyStatus === 'Active'
                      ? 'green'
                      : policy.policyStatus === 'Under Review'
                        ? 'orange'
                        : policy.policyStatus === 'Revoked'
                          ? 'red'
                          : 'inherit'
                }}
              >
                {policy.policyStatus}
              </Typography>
            </p>

            {policy.attachment && (
              <p>
                <strong>Attachment:</strong>{' '}
                <Link
                  href={`http://192.168.0.119:3000/${policy.attachment.replace(/\\/g, '/')}`}
                  target='_blank'
                  color='primary'
                  fontWeight='bold'
                >
                  Attachment File
                </Link>
              </p>
            )}
          </Box>
        ))}
      </div>
    </div>
  )
}
