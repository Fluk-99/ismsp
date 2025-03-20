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
  IconButton,
  Box,
  Typography
} from '@mui/material'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'

export default function BoundaryManagement() {
  const [soaOptions, setSoaOptions] = useState([])
  const [boundary, setBoundary] = useState({
    inclusions: [],
    exclusions: [],
    besidesSOA: ''
  })

  useEffect(() => {
    fetchSoaOptions()
    fetchBoundaries()
  }, [])

  useEffect(() => {
    console.log('Updated SOA Options:', soaOptions)
    console.log('Updated Boundary:', boundary)
  }, [soaOptions, boundary])

  const fetchSoaOptions = async () => {
    try {
      const response = await fetch('http://192.168.0.119:3000/api/settings/soa')
      const result = await response.json()

      console.log('Updated SOA Options:', result.data)

      if (result.data && result.data.length > 0) {
        setSoaOptions(result.data)
      } else {
        console.warn('SOA Options API returned empty data.')
        setSoaOptions([])
      }
    } catch (error) {
      console.error('Error fetching SOA Options:', error)
    }
  }

  const fetchBoundaries = async () => {
    try {
      const response = await fetch('http://192.168.0.119:3000/api/4COTO/boundary/')
      const result = await response.json()

      console.log('📥 Fetched Boundary Data:', JSON.stringify(result, null, 2))

      if (result && Array.isArray(result) && result.length > 0) {
        // ตรวจสอบโครงสร้างข้อมูลที่ได้จาก API แล้วแปลงให้ตรงกับที่ต้องการ
        const boundaryData = result[0]

        // ดึงข้อมูล inclusions แบบปลอดภัย
        const inclusions = boundaryData.inclusions || []
        const formattedInclusions = Array.isArray(inclusions)
          ? inclusions.map(inc => {
              // ตรวจสอบว่า inc มี _doc หรือไม่
              const incData = inc._doc || inc
              return {
                soa: incData.soa || '',
                description: incData.description || ''
              }
            })
          : []

        // ดึงข้อมูล exclusions แบบปลอดภัย
        const exclusions = boundaryData.exclusions || []
        const formattedExclusions = Array.isArray(exclusions)
          ? exclusions.map(exc => {
              const excData = exc._doc || exc
              return {
                soa: excData.soa || '',
                description: excData.description || ''
              }
            })
          : []

        // สร้างข้อมูลที่มีโครงสร้างตามที่คอมโพเนนต์ต้องการ
        setBoundary({
          _id: boundaryData._id || undefined,
          inclusions: formattedInclusions,
          exclusions: formattedExclusions,
          besidesSOA: boundaryData.besidesSOA || ''
        })

        console.log('Formatted boundary data:', {
          _id: boundaryData._id,
          inclusions: formattedInclusions,
          exclusions: formattedExclusions,
          besidesSOA: boundaryData.besidesSOA
        })
      } else {
        console.warn('Boundary API returned empty data.')
        setBoundary({
          _id: undefined,
          inclusions: [],
          exclusions: [],
          besidesSOA: ''
        })
      }
    } catch (error) {
      console.error('Error fetching Boundary:', error)
      // เพิ่มการจัดการข้อมูลเริ่มต้นเมื่อเกิด error
      setBoundary({
        _id: undefined,
        inclusions: [],
        exclusions: [],
        besidesSOA: ''
      })
    }
  }

  // ✅ Handle Change
  const handleChange = (field, value, index = null, type = null) => {
    if (type) {
      setBoundary(prev => ({
        ...prev,
        [type]: prev[type].map((item, i) => (i === index ? { ...item, [field]: value } : item))
      }))
    } else {
      setBoundary(prev => ({ ...prev, [field]: value }))
    }
  }

  // ✅ เพิ่ม Inclusion / Exclusion
  const handleAdd = type => {
    setBoundary(prev => ({
      ...prev,
      [type]: [...prev[type], { soa: soaOptions.length > 0 ? soaOptions[0].soaId : '', description: '' }]
    }))
  }

  // ✅ ลบ Inclusion / Exclusion
  const handleRemove = async (type, index) => {
    setBoundary(prev => {
      const updatedList = prev[type].filter((_, i) => i !== index)
      return { ...prev, [type]: updatedList }
    })

    // ส่งข้อมูลที่อัปเดตไปยังเซิร์ฟเวอร์
    try {
      const updatedBoundary = {
        ...boundary,
        [type]: boundary[type].filter((_, i) => i !== index) // ลบข้อมูลออก
      }

      const response = await fetch('http://192.168.0.119:3000/api/4COTO/boundary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBoundary)
      })

      const result = await response.json()
      console.log('Updated after remove:', result)
      alert('ลบสำเร็จและบันทึกข้อมูลแล้ว!')
      fetchBoundaries() // โหลดข้อมูลใหม่เพื่อให้แน่ใจว่าอัปเดตแล้ว
    } catch (error) {
      console.error('Error removing boundary:', error)
    }
  }

  // ✅ บันทึก Boundary
  const handleSave = async () => {
    try {
      const response = await fetch('http://192.168.0.119:3000/api/4COTO/boundary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boundary)
      })
      const result = await response.json()
      console.log('Saved:', result)
      alert('บันทึกข้อมูลสำเร็จ!')

      await fetchBoundaries()
    } catch (error) {
      console.error('Error saving boundary:', error)
    }
  }

  return (
    <Box className='p-10 max-w-4xl mx-auto bg-white rounded-lg shadow-lg'>
      <Typography variant='h5' className='text-center font-bold'>
        Boundary Management
      </Typography>

      {/* 🔹 Inclusions */}
      <Typography variant='h6' className='mt-6'>
        SOA ที่ใช้ (Inclusions)
      </Typography>
      {boundary.inclusions.map((inc, index) => (
        <Grid container spacing={2} key={index} alignItems='center' className='mt-2'>
          <Grid item xs={5}>
            <FormControl fullWidth>
              <InputLabel>SOA</InputLabel>
              <Select
                value={soaOptions.find(soa => soa.soaId === inc.soa) ? inc.soa : ''}
                onChange={e => handleChange('soa', e.target.value, index, 'inclusions')}
              >
                {soaOptions.map(soa => (
                  <MenuItem key={soa.soaId} value={soa.soaId}>
                    {soa.controlId} {soa.controlName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label='เหตุผลที่ใช้'
              value={inc.description || ''}
              onChange={e => handleChange('description', e.target.value, index, 'inclusions')}
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton
              onClick={() => {
                console.log('Removing inclusions at index:', index)
                handleRemove('inclusions', index)
              }}
              color='error'
            >
              <RemoveCircleOutline />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddCircleOutline />} onClick={() => handleAdd('inclusions')} className='mt-2'>
        เพิ่ม Inclusion
      </Button>

      {/* 🔹 Exclusions */}
      <Typography variant='h6' className='mt-6'>
        SOA ที่ไม่ใช้ (Exclusions)
      </Typography>
      {boundary.exclusions.map((exc, index) => (
        <Grid container spacing={2} key={index} alignItems='center' className='mt-2'>
          <Grid item xs={5}>
            <FormControl fullWidth>
              <InputLabel>SOA</InputLabel>
              <Select
                value={soaOptions.find(soa => soa.soaId === exc.soa) ? exc.soa : ''}
                onChange={e => handleChange('soa', e.target.value, index, 'exclusions')}
              >
                {soaOptions.map(soa => (
                  <MenuItem key={soa.soaId} value={soa.soaId}>
                    {soa.controlId} {soa.controlName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label='เหตุผลที่ไม่ใช้'
              value={exc.description || ''}
              onChange={e => handleChange('description', e.target.value, index, 'exclusions')}
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton
              onClick={() => {
                console.log('Removing exclusions at index:', index)
                handleRemove('exclusions', index)
              }}
              color='error'
            >
              <RemoveCircleOutline />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddCircleOutline />} onClick={() => handleAdd('exclusions')} className='mt-2'>
        เพิ่ม Exclusion
      </Button>

      {/* 🔹 ข้อมูลเพิ่มเติม */}
      <Typography variant='h6' className='mt-6'>
        นอกเหนือจาก SOA (BesidesSOA)
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        label='ข้อมูลเพิ่มเติม'
        value={boundary.besidesSOA}
        onChange={e => handleChange('besidesSOA', e.target.value)}
      />

      {/* 🔹 ปุ่มบันทึก */}
      <Button variant='contained' color='primary' className='mt-6' fullWidth onClick={handleSave}>
        บันทึกข้อมูล Boundary
      </Button>
    </Box>
  )
}
