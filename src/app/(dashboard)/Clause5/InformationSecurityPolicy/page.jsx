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
  IconButton,
  Paper,
  Chip,
  Divider
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import SecurityIcon from '@mui/icons-material/Security'

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/5LEAD/information-security-policy')
      const data = await response.json()
      if (Array.isArray(data)) {
        setPolicies(data)
      } else {
        console.error('Data format incorrect', data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async event => {
    const file = event.target.files[0]
    setAttachment(file)
    if (file) setAttachmentName(file.name)
  }

  const resetForm = () => {
    setPolicyTitle('')
    setPolicyVersion('')
    setEffectiveDate('')
    setApprover('')
    setScope('')
    setSecurityPractices([])
    setCommunicationMethod('')
    setPolicyStatus('')
    setAttachment(null)
    setAttachmentName('')
  }

  const handleSubmit = async () => {
    // ตรวจสอบว่าฟิลด์ที่จำเป็นถูกกรอกครบหรือไม่
    if (
      !policyTitle ||
      !policyVersion ||
      !effectiveDate ||
      !approver ||
      !scope ||
      securityPractices.length === 0 ||
      !communicationMethod ||
      !policyStatus
    ) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }

    setLoading(true)
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
      const response = await fetch('https://ismsp-backend.onrender.com/api/5LEAD/information-security-policy/create', {
        method: 'POST',
        body: formData
      })
      if (!response.ok) throw new Error('Failed to save data')
      alert('บันทึกนโยบายเรียบร้อยแล้ว')
      resetForm()
      fetchPolicies()
    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกนโยบาย')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบนโยบายนี้?')) return
    setLoading(true)
    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/5LEAD/information-security-policy/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete policy')
      setPolicies(policies.filter(policy => policy._id !== id))
      alert('ลบนโยบายเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error deleting data:', error)
      alert('เกิดข้อผิดพลาดในการลบนโยบาย')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'Active':
        return 'green'
      case 'Under Review':
        return 'orange'
      case 'Revoked':
        return 'red'
      default:
        return 'inherit'
    }
  }

  return (
    <div className='p-6 shadow-lg rounded-lg max-w-4xl mx-auto '>
      {/* Header ที่ดูทันสมัยขึ้น */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          p: 2,
          borderRadius: '8px'
        }}
      >
        <div>
          <h2 className='text-xl font-bold text-center mb-0'>Clause 5: Leadership</h2>
          <p className='text-center text-gray-600 mb-0'>5.2 Information Security Policy</p>
        </div>
      </Box>

      {/* แบบฟอร์มในกรอบ */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: '8px' }}>
        <Typography variant='h6' sx={{ mb: 2, fontWeight: 'bold' }}>
          Create New Policy
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Policy Title'
              value={policyTitle}
              onChange={e => setPolicyTitle(e.target.value)}
              className='mb-3'
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Policy Version'
              value={policyVersion}
              onChange={e => setPolicyVersion(e.target.value)}
              className='mb-3'
              required
              placeholder='e.g. 1.0'
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Effective Date'
              type='date'
              InputLabelProps={{ shrink: true }}
              value={effectiveDate}
              onChange={e => setEffectiveDate(e.target.value)}
              className='mb-3'
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Approver'
              value={approver}
              onChange={e => setApprover(e.target.value)}
              className='mb-3'
              required
              placeholder='Name of approving authority'
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label='Scope'
          value={scope}
          onChange={e => setScope(e.target.value)}
          className='mb-3'
          required
          multiline
          rows={2}
          placeholder='Define the scope of this policy'
        />

        <TextField
          fullWidth
          label='Communication Method'
          value={communicationMethod}
          onChange={e => setCommunicationMethod(e.target.value)}
          className='mb-3'
          required
          placeholder='How this policy will be communicated'
        />

        <FormControl fullWidth className='mb-3' required>
          <InputLabel>Security Practices</InputLabel>
          <Select
            multiple
            value={securityPractices}
            onChange={e => setSecurityPractices(e.target.value)}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(value => (
                  <Chip key={value} label={value} size='small' />
                ))}
              </Box>
            )}
          >
            <MenuItem value='Access Control'>Access Control</MenuItem>
            <MenuItem value='Data Protection'>Data Protection</MenuItem>
            <MenuItem value='Risk Management'>Risk Management</MenuItem>
            <MenuItem value='Incident Response'>Incident Response</MenuItem>
            <MenuItem value='Network Security'>Network Security</MenuItem>
            <MenuItem value='Physical Security'>Physical Security</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth className='mb-4' required>
          <InputLabel>Policy Status</InputLabel>
          <Select value={policyStatus} onChange={e => setPolicyStatus(e.target.value)}>
            <MenuItem value='Active'>Active</MenuItem>
            <MenuItem value='Under Review'>Under Review</MenuItem>
            <MenuItem value='Revoked'>Revoked</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />} sx={{ mr: 2 }}>
            Upload Document
            <input type='file' hidden onChange={handleFileUpload} />
          </Button>
          {attachmentName && (
            <Typography variant='body2' color='textSecondary'>
              {attachmentName}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant='outlined' color='secondary' onClick={resetForm} disabled={loading}>
            Clear Form
          </Button>
          <Button
            variant='contained'
            color='primary'
            sx={{ padding: '8px 24px' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'กำลังบันทึก...' : 'Save Policy'}
          </Button>
        </Box>
      </Paper>

      <div className='mt-6'>
        <Typography variant='h6' sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          Recorded Policies
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>กำลังโหลดข้อมูล...</Typography>
          </Box>
        ) : policies.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, borderRadius: '8px' }}>
            <Typography>ยังไม่มีนโยบายที่บันทึกไว้</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {policies.map(policy => (
              <Grid item xs={12} key={policy._id}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    borderRadius: '8px',
                    position: 'relative',
                    borderLeft: `4px solid ${getStatusColor(policy.policyStatus)}`
                  }}
                >
                  <IconButton
                    onClick={() => handleDelete(policy._id)}
                    sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant='h6' sx={{ mb: 1, fontWeight: 'bold' }}>
                        {policy.policyTitle}
                        <Chip
                          label={policy.policyStatus}
                          size='small'
                          sx={{
                            ml: 2,
                            backgroundColor: getStatusColor(policy.policyStatus),
                            color: 'white'
                          }}
                        />
                      </Typography>

                      <Typography variant='body2' sx={{ mb: 2, color: 'text.secondary' }}>
                        Version: {policy.policyVersion} | Effective:{' '}
                        {new Date(policy.effectiveDate).toLocaleDateString()} | Approved by: {policy.approver}
                      </Typography>

                      <Typography variant='body1' sx={{ mb: 1 }}>
                        <strong>Scope:</strong> {policy.scope}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                          Security Practices:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {policy.securityPractices.map(practice => (
                            <Chip key={practice} label={practice} size='small' variant='outlined' />
                          ))}
                        </Box>
                      </Box>

                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Communication Method:</strong> {policy.communicationMethod}
                      </Typography>

                      {policy.attachment && (
                        <Button
                          variant='outlined'
                          size='small'
                          startIcon={<AttachFileIcon />}
                          component={Link}
                          href={`https://ismsp-backend.onrender.com/${policy.attachment.replace(/\\/g, '/')}`}
                          target='_blank'
                          sx={{ mt: 1 }}
                        >
                          View Document
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </div>
  )
}
