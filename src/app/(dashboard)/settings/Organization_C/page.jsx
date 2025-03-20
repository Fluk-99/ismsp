'use client'
//ตัวอย่าง
import { useEffect, useState } from 'react'
import { TextField, Select, MenuItem, Button, Typography, Box, CircularProgress } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import CancelIcon from '@mui/icons-material/Cancel'
import 'react-toastify/dist/ReactToastify.css'
//Get api
//-----------------------------------------------------url------------------------------------
const API_URL = 'http://192.168.0.119:3000/api/settings/organization'

const Organization_C = () => {
  //---------------------------------------------------------
  const [organizations, setOrganizations] = useState([])
  //---------------------------------------------------------
  const [loading, setLoading] = useState(true)
  const [canAdd, setCanAdd] = useState(true)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch data')

      const data = await response.json()
      //body--------------------------------------------------------------------- ดึงค่ามาใช้
      setOrganizations(
        data.data.map(org => ({
          id: org._id, // ใช้ `_id` จาก MongoDB
          orgId: org.orgId,
          companyName: org.name,
          companyType: org.businessType,
          isEditable: false,
          isSaved: true
        }))
      )
      //-------------------------------------------------------------------------
    } catch (error) {
      toast.error('Failed to fetch organizations.')
    } finally {
      setLoading(false)
    }
  }

  // ประเภทของบริษัทที่รองรับ
  const companyTypes = [
    'Corporation',
    'Partnership',
    'Sole Proprietorship',
    'Cooperative',
    'Registered Business',
    'Unregistered Business',
    'Manufacturing',
    'Service',
    'Retail/Wholesale',
    'Technology',
    'Construction',
    'Logistics',
    'Local Business',
    'National Business',
    'International Business',
    'Non-Profit Organization',
    'Government-Owned Enterprise',
    'Joint Venture'
  ]

  // ฟังก์ชันอัปเดต State เมื่อมีการเปลี่ยนแปลงค่า
  const handleChange = (id, field, value) => {
    setOrganizations(prev => prev.map(org => (org.id === id ? { ...org, [field]: value } : org)))
  }

  // ฟังก์ชันเปิด/ปิดโหมดแก้ไข
  const handleEditToggle = id => {
    setOrganizations(prev =>
      prev.map(org => (org.id === id ? { ...org, isEditable: !org.isEditable, isSaved: false } : org))
    )
    setCanAdd(true)
  }
  //------------------------------------------------------------------------------post หรือ save    // สร้าง
  const handleSaveToAPI = async id => {
    const org = organizations.find(org => org.id === id)

    if (!org || !org.companyName.trim() || !org.companyType) {
      toast.error('Please fill in all fields before saving!')
      return
    }
    // url + /create
    try {
      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: org.companyName,
          businessType: org.companyType
        })
      })

      if (!response.ok) throw new Error(`Failed to save organization (${response.status})`)

      toast.success('Organization saved successfully!')
      fetchOrganizations() // รีโหลดข้อมูลหลังจากบันทึก
      setCanAdd(true)
    } catch (error) {
      toast.error('Failed to save organization.')
    }
  }
  //------------------------------------------------------------------------------new
  // ฟังก์ชันเพิ่ม Organization ใหม่
  const handleAddOrganization = () => {
    setOrganizations(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        companyName: '',
        companyType: '',
        isEditable: true,
        isSaved: false
      }
    ])
    setCanAdd(false)
  }

  // ยกเลิกการเพิ่ม Organization
  const handleCancelAdd = () => {
    setOrganizations(prev => prev.filter(org => !org.id.startsWith('temp-')))
    setCanAdd(true)
  }

  // ฟังก์ชันลบ Organization
  const handleDeleteOrganization = async orgId => {
    try {
      const response = await fetch(`${API_URL}/${orgId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`Failed to delete organization (${response.status})`)

      toast.success('✅ Organization deleted successfully!')
      await fetchOrganizations()
    } catch (error) {
      toast.error('Failed to delete organization.')
    }
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <ToastContainer />

      <Typography variant='h4' align='center' gutterBottom>
        Organization Management
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        organizations.map(org => (
          <Box key={org.id} sx={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
            <TextField
              fullWidth
              label='Organization Name'
              value={org.companyName}
              disabled={!org.isEditable}
              onChange={e => handleChange(org.id, 'companyName', e.target.value)}
            />

            <Select
              fullWidth
              disabled={!org.isEditable}
              value={org.companyType}
              onChange={e => handleChange(org.id, 'companyType', e.target.value)}
            >
              {companyTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>

            <Button variant='contained' color='secondary' onClick={() => handleEditToggle(org.id)}>
              {org.isEditable ? 'Cancel' : 'Edit'}
            </Button>

            <Button
              variant='contained'
              color='primary'
              onClick={() => handleSaveToAPI(org.id)}
              disabled={!org.isEditable || !org.companyName.trim() || !org.companyType}
            >
              Save
            </Button>

            <Button variant='contained' color='error' onClick={() => handleDeleteOrganization(org.orgId)}>
              Delete
            </Button>
          </Box>
        ))
      )}

      {canAdd ? (
        <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
          <Button variant='contained' color='success' onClick={handleAddOrganization}>
            Add Organization
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
          <Button variant='contained' color='error' startIcon={<CancelIcon />} onClick={handleCancelAdd}>
            Cancel Add
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Organization_C
