'use client'

import { useEffect, useState } from 'react'
import { TextField, Select, MenuItem, Button, Typography, Box, CircularProgress } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
//api
const API_URL = 'http://192.168.0.119:3000/api/settings/organization'
const CREATE_API_URL = 'http://192.168.0.119:3000/api/settings/organization/create'
//const Delete_API_URL = `http://192.168.0.119:3000/api/settings/organization/${orgId}`;
// const TEST = "http://192.168.0.119:3000/api/settings/organization/:id";

const Organization_C = () => {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [canAdd, setCanAdd] = useState(true)

  const fetchOrganizations = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("✅ API Response Data:", data);

        const formattedData = data.data.map((org) => ({
            id: org._id,
            orgId: org.orgId,
            companyName: org.name,
            companyType: org.businessType,
            isEditable: false,
            isSaved: true,
        }));

        setOrganizations(formattedData);
    } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error("Failed to fetch organizations.");
    }
};

// ✅ ตรวจสอบว่า `fetchOrganizations` มีอยู่และเรียกใช้ได้
useEffect(() => {
    fetchOrganizations();
}, []);

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

  const handleEditToggle = id => {
    setOrganizations(prev =>
      prev.map(org => (org.id === id ? { ...org, isEditable: !org.isEditable, isSaved: false } : org))
    )
    setCanAdd(true)
  }

  const handleSaveToAPI = async id => {
    const org = organizations.find(org => org.id === id)

    if (!org || org.companyName.trim() === '' || org.companyType === '') {
      toast.error('Please fill in all fields before saving!', { position: 'top-right', autoClose: 3000 })
      return
    }

    try {
      const response = await fetch(CREATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: org.companyName,
          businessType: org.companyType
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      toast.success('Organization saved successfully!', { position: 'top-right', autoClose: 3000 })

      setOrganizations(prev => prev.map(org => (org.id === id ? { ...org, isEditable: false, isSaved: true } : org)))
      setCanAdd(false)
    } catch (error) {
      console.error('Error saving organization:', error)
      toast.error('Failed to save organization. Please try again.')
    }
  }

  const handleAddOrganization = () => {
    const newOrg = {
      id: Date.now().toString(),
      companyName: '',
      companyType: '',
      isEditable: true,
      isSaved: false
    }
    setOrganizations(prev => [...prev, newOrg])
    setCanAdd(false)
  }
//pete
const handleDeleteOrganization = async (orgId) => {
  console.log("Debugging: orgId before delete:", orgId);
  try {
      if (!orgId) {
          throw new Error("Invalid organization ID.");
      }

      console.log(`Attempting to delete organization with ID: ${orgId}`);

      const response = await fetch(`http://192.168.0.119:3000/api/settings/organization/${orgId}`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
          },
      });

      console.log(`Response status: ${response.status}`);

      const data = await response.json(); // ✅ กำหนดค่าตัวแปร `data`

      console.log("✅ API Response Data:", data);

      if (!response.ok) {
          console.error("API Error:", data.message);
          throw new Error(`Failed to delete organization. Status: ${response.status}, Error: ${data.message}`);
      }

      console.log("Delete Success:", data);

      // ✅ อัปเดต UI โดยการกรองเอา org ที่ลบออกจาก State
      setOrganizations((prev) => prev.filter((org) => org.orgId !== orgId));

      toast.success(data.message || "Organization deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
      });
      await fetchOrganizations();

  } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error(error.message || "Failed to delete organization. Please try again.");
  }
};




/////////////////////////

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <ToastContainer />

      <Typography variant='h4' align='center' gutterBottom>
        Organization Information
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        organizations.map(org => (
          <Box
            key={org.id}
            sx={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              marginTop: '30px',
              alignItems: 'center'
            }}
          >
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

            <Button
              variant='contained'
              color='secondary'
              onClick={() => handleEditToggle(org.id)}
              sx={{ marginRight: '10px' }}
            >
              {org.isEditable ? 'Cancel' : 'Edit'}
            </Button>

            {
              <Button
                variant='contained'
                color='primary'
                onClick={() => handleSaveToAPI(org.id)}
                disabled={!org.isEditable || org.companyName.trim() === '' || org.companyType === ''}
                sx={{ marginRight: '10px' }}
              >
                Save
              </Button>
            }

            <Button
            variant='contained'
            color='error'
            onClick={() => handleDeleteOrganization(org.orgId)}>
              Delete
            </Button>
          </Box>
        ))
      )}

      {canAdd && (
        <Box sx={{ textAlign: "center", marginTop: "20px" }}>
          <Button variant="contained" color="success" onClick={handleAddOrganization}>
            Add Organization
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Organization_C
