'use client'

import { useEffect, useState } from 'react'
import { TextField, Button, Typography, Box, CircularProgress, Autocomplete } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import CancelIcon from '@mui/icons-material/Cancel'
import 'react-toastify/dist/ReactToastify.css'

// API URLs
const API_URL = 'https://ismsp-backend.onrender.com/api/settings/organization'
const COMPANY_TYPES_URL = 'https://ismsp-backend.onrender.com/api/settings/company-type'

const Organization_C = () => {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [canAdd, setCanAdd] = useState(true)
  const [companyTypes, setCompanyTypes] = useState([])

  useEffect(() => {
    fetchOrganizations()
    fetchCompanyTypes()
  }, [])

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch data')

      const data = await response.json()
      setOrganizations(
        data.data.map(org => ({
          id: org._id,
          orgId: org.orgId,
          companyName: org.name,
          companyType: org.businessType,
          isEditable: false,
          isSaved: true
        }))
      )
    } catch (error) {
      toast.error('Failed to fetch organizations.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanyTypes = async () => {
    try {
      const res = await fetch(COMPANY_TYPES_URL)
      if (!res.ok) throw new Error('Failed to fetch company types')
      const data = await res.json()

      // Make sure we're using the correct property from the response
      setCompanyTypes(data.types || [])
      console.log('Fetched company types:', data.types)
    } catch (error) {
      toast.error('Failed to load company types.')
      console.error(error)
    }
  }

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

  // แก้ไขฟังก์ชันนี้เพื่อบันทึกประเภทบริษัทใหม่
  const saveCompanyTypeIfNew = async type => {
    // ตรวจสอบว่าประเภทนี้มีอยู่แล้วหรือไม่
    if (!type || companyTypes.includes(type)) return

    try {
      console.log(`Attempting to save new company type: ${type}`)

      const res = await fetch(COMPANY_TYPES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(`Failed to save company type: ${errorData.message || res.statusText}`)
      }

      const data = await res.json()
      console.log('Company type save response:', data)

      // อัปเดต state ด้วยประเภทใหม่
      setCompanyTypes(prev => [...prev, type])
      toast.success(`Added new company type: ${type}`)
    } catch (error) {
      toast.error(`Failed to save new company type: ${error.message}`)
      console.error('Error saving company type:', error)
    }
  }

  // แก้ไขฟังก์ชันนี้เพื่อแยกระหว่างการสร้างใหม่และการอัปเดต
  const handleSaveToAPI = async id => {
    const org = organizations.find(org => org.id === id)

    if (!org || !org.companyName.trim() || !org.companyType) {
      toast.error('Please fill in all fields before saving!')
      return
    }

    // บันทึกประเภทบริษัทใหม่ก่อน (ถ้ามี)
    if (org.companyType && !companyTypes.includes(org.companyType)) {
      await saveCompanyTypeIfNew(org.companyType)
    }

    try {
      // ตรวจสอบว่าเป็นการสร้างใหม่หรืออัปเดต
      const isNewOrg = org.id.startsWith('temp-')

      // กำหนด URL และ Method ตามประเภทของการดำเนินการ
      let url = isNewOrg ? `${API_URL}/create` : `${API_URL}/${org.orgId}`
      let method = isNewOrg ? 'POST' : 'PUT'

      console.log(`${isNewOrg ? 'Creating' : 'Updating'} organization:`, org)
      console.log(`API call: ${method} ${url}`)

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: org.companyName,
          businessType: org.companyType
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Failed to ${isNewOrg ? 'create' : 'update'} organization: ${errorData.message || response.statusText}`
        )
      }

      toast.success(`Organization ${isNewOrg ? 'created' : 'updated'} successfully!`)
      fetchOrganizations()
      setCanAdd(true)
    } catch (error) {
      toast.error(`Failed to save organization: ${error.message}`)
      console.error('Error saving organization:', error)
    }
  }

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

      toast.success('Organization deleted successfully!')
      await fetchOrganizations()
    } catch (error) {
      toast.error('Failed to delete organization.')
      console.error(error)
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
          <Box
            key={org.id}
            sx={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <TextField
              fullWidth
              label='Organization Name'
              value={org.companyName}
              disabled={!org.isEditable}
              onChange={e => handleChange(org.id, 'companyName', e.target.value)}
            />

            <Autocomplete
              fullWidth
              sx={{ flex: 1 }}
              freeSolo
              options={companyTypes}
              value={org.companyType}
              onChange={(e, newValue) => {
                handleChange(org.id, 'companyType', newValue)
              }}
              onInputChange={(e, newInputValue) => {
                handleChange(org.id, 'companyType', newInputValue)
              }}
              renderInput={params => (
                <TextField {...params} label='Company Type' disabled={!org.isEditable} fullWidth />
              )}
              disabled={!org.isEditable}
            />

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

            <Button
              variant='contained'
              color='error'
              onClick={() => handleDeleteOrganization(org.orgId)}
              disabled={!org.orgId} // Disable for new records
            >
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
