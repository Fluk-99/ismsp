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

export default function LeadershipCommitment() {
  const [meetingDate, setMeetingDate] = useState('')
  const [location, setLocation] = useState('')
  const [attendees, setAttendees] = useState([])
  const [topics, setTopics] = useState('')
  const [outcome, setOutcome] = useState('')
  const [attachments, setAttachments] = useState(null)
  const [signatures, setSignatures] = useState(null)
  const [attachmentName, setAttachmentName] = useState('')
  const [signatureName, setSignatureName] = useState('')
  const [commitments, setCommitments] = useState([])

  useEffect(() => {
    fetchCommitments()
  }, [])

  const fetchCommitments = async () => {
    try {
      const response = await fetch('http://192.168.0.119:3000/api/5LEAD/leadership-commitment')
      const data = await response.json()
      console.log('Data from API:', data)
      if (Array.isArray(data)) {
        setCommitments(data)
      } else {
        console.error('Data format incorrect', data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleFileUpload = async (event, setFile, setFileName) => {
    await new Promise(resolve => setTimeout(resolve, 0))
    const file = event.target.files[0]
    setFile(file)
    if (file) setFileName(file.name)
  }

  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('meetingDate', meetingDate)
    formData.append('location', location)
    formData.append('attendees', JSON.stringify(attendees))
    formData.append('topics', topics)
    formData.append('outcome', outcome)
    if (attachments) formData.append('attachments', attachments)
    if (signatures) formData.append('signatures', signatures)

    try {
      const response = await fetch('http://192.168.0.119:3000/api/5LEAD/leadership-commitment/create', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      console.log('Server Response:', result)
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save data')
      }
      alert('บันทึกข้อมูลสำเร็จ!')
      fetchCommitments()
    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) return
    try {
      const response = await fetch(`http://192.168.0.119:3000/api/5LEAD/leadership-commitment/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete data')
      setCommitments(commitments.filter(commitment => commitment._id !== id))
      alert('ลบข้อมูลสำเร็จ!')
    } catch (error) {
      console.error('Error deleting data:', error)
      alert('เกิดข้อผิดพลาดในการลบข้อมูล')
    }
  }

  return (
    <div className='p-6 shadow-lg rounded-lg mx-auto'>
      <h2 className='text-xl font-bold text-center'>Clause 5: Leadership</h2>
      <p className='text-center text-gray-600 mb-4'>5.1 Leadership and Commitment</p>

      <TextField
        fullWidth
        label='Meeting Date'
        type='date'
        InputLabelProps={{ shrink: true }}
        value={meetingDate}
        onChange={e => setMeetingDate(e.target.value)}
        className='mb-4'
      />

      <TextField
        fullWidth
        label='Meeting Location'
        value={location}
        onChange={e => setLocation(e.target.value)}
        className='mb-4'
      />

      <FormControl fullWidth className='mb-4'>
        <InputLabel>Attendees</InputLabel>
        <Select multiple value={attendees} onChange={e => setAttendees(e.target.value)}>
          <MenuItem value='CEO'>CEO</MenuItem>
          <MenuItem value='CIO'>CIO</MenuItem>
          <MenuItem value='CISO'>CISO</MenuItem>
          <MenuItem value='Compliance Team'>Compliance Team</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label='Meeting Topics'
        value={topics}
        onChange={e => setTopics(e.target.value)}
        className='mb-4'
      />

      <TextField
        fullWidth
        label='Meeting Outcome'
        value={outcome}
        onChange={e => setOutcome(e.target.value)}
        className='mb-4'
      />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
            Uplode Attachment File
            <input type='file' hidden onChange={e => handleFileUpload(e, setAttachments, setAttachmentName)} />
          </Button>
          {attachmentName && (
            <Typography variant='body2' color='textSecondary'>
              {attachmentName}
            </Typography>
          )}
        </Grid>
        <Grid item xs={6}>
          <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
            Upload Signature File
            <input type='file' hidden onChange={e => handleFileUpload(e, setSignatures, setSignatureName)} />
          </Button>
          {signatureName && (
            <Typography variant='body2' color='textSecondary'>
              {signatureName}
            </Typography>
          )}
        </Grid>
      </Grid>

      <div className='flex justify-between mt-4'>
        <Button variant='contained' color='secondary'>
          Cancel
        </Button>
        <Button variant='contained' color='primary' onClick={handleSubmit}>
          Save
        </Button>
      </div>

      <div className='mt-6'>
        <h3 className='text-lg font-bold'>Recorded Data</h3>
        {commitments.map(commitment => (
          <Box key={commitment._id} className='p-4 border rounded mt-2 relative'>
            <IconButton
              onClick={() => handleDelete(commitment._id)}
              sx={{ position: 'absolute', top: 5, right: 5, color: 'secondary' }}
            >
              <DeleteIcon />
            </IconButton>
            <p>
              <strong>Meeting Date:</strong> {new Date(commitment.meetingDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Meeting Location:</strong> {commitment.location}
            </p>
            <p>
              <strong>Attendees:</strong> {commitment.attendees.join(', ')}
            </p>
            <p>
              <strong>Meeting Topics:</strong> {commitment.topics}
            </p>
            <p>
              <strong>Meeting Outcome:</strong> {commitment.outcome}
            </p>

            {commitment.attachments && (
              <p>
                <strong>Attachment:</strong>{' '}
                <Link
                  href={`http://192.168.0.119:3000/${commitment.attachments.replace(/\\/g, '/')}`}
                  target='_blank'
                  color='primary'
                  fontWeight='bold'
                >
                  Attachment File
                </Link>
              </p>
            )}
            {commitment.signatures && (
              <p>
                <strong>Signature:</strong>{' '}
                <Link
                  href={`http://192.168.0.119:3000/${commitment.signatures.replace(/\\/g, '/')}`}
                  target='_blank'
                  color='primary'
                  fontWeight='bold'
                >
                  Signature File
                </Link>
              </p>
            )}
          </Box>
        ))}
      </div>
    </div>
  )
}
