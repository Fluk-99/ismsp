'use client'
import { useState, useEffect } from 'react'
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert
} from '@mui/material'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'

export default function FactorManagement() {
  const [analysisType, setAnalysisType] = useState('SWOT Analysis')
  const [savedFactors, setSavedFactors] = useState([])
  const [newFactor, setNewFactor] = useState({
    type: 'Strength',
    category: 'Internal',
    description: ''
  })
  const [editingFactor, setEditingFactor] = useState(null)
  const [factorId, setFactorId] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // โหลดข้อมูล Factors จาก API เมื่อโหลดหน้า
  useEffect(() => {
    fetchFactors()
  }, [])

  // เมื่อ analysisType เปลี่ยน ให้อัปเดตค่าเริ่มต้นของ type และ category
  useEffect(() => {
    if (analysisType === 'SWOT Analysis') {
      setNewFactor(prev => ({
        ...prev,
        type: 'Strength',
        category: 'Internal'
      }))
    } else {
      setNewFactor(prev => ({
        ...prev,
        type: 'Political',
        category: 'External'
      }))
    }
  }, [analysisType])

  const fetchFactors = async () => {
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/4COTO/factor')
      const result = await response.json()

      if (result.data && result.data.length > 0) {
        // ใช้ข้อมูลล่าสุด
        const latestFactor = result.data[result.data.length - 1]
        setFactorId(latestFactor._id)
        setAnalysisType(latestFactor.analysisType)
        setSavedFactors(latestFactor.factors || [])
      }
    } catch (error) {
      console.error('Error fetching factors:', error)
      showSnackbar('ไม่สามารถโหลดข้อมูลได้', 'error')
    }
  }

  // แสดง Snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    })
  }

  // ปิด Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    })
  }

  // อัปเดตค่าใน newFactor
  const handleChange = (field, value) => {
    setNewFactor(prev => ({ ...prev, [field]: value }))

    // อัพเดต category อัตโนมัติสำหรับการวิเคราะห์แบบ SWOT
    if (field === 'type' && analysisType === 'SWOT Analysis') {
      if (value === 'Strength' || value === 'Weakness') {
        setNewFactor(prev => ({ ...prev, category: 'Internal' }))
      } else if (value === 'Opportunity' || value === 'Threat') {
        setNewFactor(prev => ({ ...prev, category: 'External' }))
      }
    }
  }

  // บันทึก/อัปเดต Factor ลงฐานข้อมูล
  const handleSaveFactor = async () => {
    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!newFactor.type || !newFactor.category || !newFactor.description) {
      showSnackbar('กรุณากรอกข้อมูลให้ครบ', 'error')
      return
    }

    // ตรวจสอบว่า type ตรงกับ analysisType หรือไม่
    const validTypes =
      analysisType === 'SWOT Analysis'
        ? ['Strength', 'Weakness', 'Opportunity', 'Threat']
        : ['Political', 'Economic', 'Social', 'Technological', 'Environmental', 'Legal']

    if (!validTypes.includes(newFactor.type)) {
      showSnackbar(`ประเภท Factor ไม่ตรงกับการวิเคราะห์ ${analysisType}`, 'error')
      return
    }

    try {
      // เตรียมข้อมูลสำหรับส่งไป API
      let factors = []

      if (editingFactor !== null) {
        // กรณีกำลังแก้ไข
        factors = savedFactors.map((factor, index) =>
          index === editingFactor ? { ...newFactor, uniqueId: factor.uniqueId } : factor
        )
      } else {
        // กรณีเพิ่มใหม่
        factors = [
          ...savedFactors,
          {
            ...newFactor,
            uniqueId: `${newFactor.type}-${newFactor.category}-${Date.now()}`
          }
        ]
      }

      const data = {
        analysisType,
        factors
      }

      // ส่งข้อมูลไป API
      const method = factorId ? 'PUT' : 'POST'
      const url = factorId
        ? `https://ismsp-backend.onrender.com/api/4COTO/factor/${factorId}`
        : 'https://ismsp-backend.onrender.com/api/4COTO/factor/create'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        // อัปเดตข้อมูลหลังบันทึกสำเร็จ
        if (!factorId && result.data?._id) {
          setFactorId(result.data._id)
        }
        setSavedFactors(factors)
        setNewFactor({
          type: analysisType === 'SWOT Analysis' ? 'Strength' : 'Political',
          category: analysisType === 'SWOT Analysis' ? 'Internal' : 'External',
          description: ''
        })
        setEditingFactor(null)
        showSnackbar('บันทึกข้อมูลสำเร็จ!')
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (error) {
      console.error('Error saving data:', error)
      showSnackbar(`เกิดข้อผิดพลาด: ${error.message}`, 'error')
    }
  }

  // เริ่มการแก้ไข Factor
  const handleEditFactor = index => {
    setEditingFactor(index)
    setNewFactor({ ...savedFactors[index] })
  }

  // ลบ Factor
  const handleDeleteFactor = async index => {
    try {
      const updatedFactors = savedFactors.filter((_, i) => i !== index)

      const data = {
        analysisType,
        factors: updatedFactors
      }

      // ส่งข้อมูลไป API
      const response = await fetch(`https://ismsp-backend.onrender.com/api/4COTO/factor/${factorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        setSavedFactors(updatedFactors)
        showSnackbar('ลบข้อมูลสำเร็จ!')
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการลบ')
      }
    } catch (error) {
      console.error('Error deleting factor:', error)
      showSnackbar(`เกิดข้อผิดพลาด: ${error.message}`, 'error')
    }
  }

  // ยกเลิกการแก้ไข
  const handleCancelEdit = () => {
    setEditingFactor(null)
    setNewFactor({
      type: analysisType === 'SWOT Analysis' ? 'Strength' : 'Political',
      category: analysisType === 'SWOT Analysis' ? 'Internal' : 'External',
      description: ''
    })
  }

  // ฟังก์ชันสำหรับจัดการการเปลี่ยน analysisType
  const handleAnalysisTypeChange = async newType => {
    // ตรวจสอบว่าเป็นค่าเดิมหรือไม่
    if (newType === analysisType) return

    if (savedFactors.length > 0) {
      const confirmChange = window.confirm(
        'การเปลี่ยนประเภทการวิเคราะห์จะล้างข้อมูล Factors ทั้งหมด คุณต้องการเปลี่ยนใช่หรือไม่?'
      )

      if (confirmChange) {
        try {
          // อัปเดตข้อมูลในฐานข้อมูล
          const response = await fetch(`https://ismsp-backend.onrender.com/api/4COTO/factor/${factorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysisType: newType,
              factors: []
            })
          })

          const result = await response.json()

          if (response.ok) {
            // อัปเดต state ท้องถิ่น
            setAnalysisType(newType)
            setSavedFactors([])
            setNewFactor({
              type: newType === 'SWOT Analysis' ? 'Strength' : 'Political',
              category: newType === 'SWOT Analysis' ? 'Internal' : 'External',
              description: ''
            })
            showSnackbar('เปลี่ยนประเภทการวิเคราะห์สำเร็จ')
          } else {
            throw new Error(result.message || 'ไม่สามารถอัปเดตข้อมูลได้')
          }
        } catch (error) {
          console.error('Error changing analysis type:', error)
          showSnackbar(`เกิดข้อผิดพลาด: ${error.message}`, 'error')
        }
      }
    } else {
      // ถ้ายังไม่มี factors สามารถเปลี่ยนได้ทันที
      setAnalysisType(newType)
    }
  }

  return (
    <Box className='p-10 max-w-4xl mx-auto rounded-lg shadow-lg'>
      <Typography variant='h5' className='text-center font-bold mb-4'>
        Factor Management
      </Typography>

      {/* ส่วนเลือกประเภทการวิเคราะห์ */}
      <FormControl fullWidth className='mb-4'>
        <InputLabel>Analysis Type</InputLabel>
        <Select value={analysisType} onChange={e => handleAnalysisTypeChange(e.target.value)}>
          <MenuItem value='SWOT Analysis'>SWOT Analysis</MenuItem>
          <MenuItem value='PESTEL Analysis'>PESTEL Analysis</MenuItem>
        </Select>
      </FormControl>

      {/* ส่วนเพิ่ม/แก้ไข Factor */}
      <Typography variant='h6' className='mt-4 mb-2'>
        {editingFactor !== null ? 'แก้ไข Factor' : 'เพิ่ม Factor'}
      </Typography>

      <Grid container spacing={2} className='mb-2'>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={newFactor.type} onChange={e => handleChange('type', e.target.value)}>
              {analysisType === 'SWOT Analysis'
                ? ['Strength', 'Weakness', 'Opportunity', 'Threat'].map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))
                : ['Political', 'Economic', 'Social', 'Technological', 'Environmental', 'Legal'].map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={newFactor.category} onChange={e => handleChange('category', e.target.value)}>
              <MenuItem value='Internal'>Internal</MenuItem>
              <MenuItem value='External'>External</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label='Description'
            value={newFactor.description}
            onChange={e => handleChange('description', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant='contained'
              color='primary'
              startIcon={editingFactor !== null ? <SaveIcon /> : <AddCircleOutline />}
              onClick={handleSaveFactor}
              sx={{ height: '56px' }}
            >
              {editingFactor !== null ? 'บันทึก' : 'เพิ่ม'}
            </Button>

            {editingFactor !== null && (
              <Button variant='outlined' color='secondary' onClick={handleCancelEdit} sx={{ height: '56px' }}>
                ยกเลิก
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* ส่วนแสดงรายการ Factors */}
      <Typography variant='h6' className='mt-6 mb-2'>
        รายการ Factors
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {savedFactors.length > 0 ? (
              savedFactors.map((factor, index) => (
                <TableRow key={factor.uniqueId || index}>
                  <TableCell>{factor.type}</TableCell>
                  <TableCell>{factor.category}</TableCell>
                  <TableCell>{factor.description}</TableCell>
                  <TableCell align='right'>
                    <IconButton color='primary' onClick={() => handleEditFactor(index)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color='error' onClick={() => handleDeleteFactor(index)}>
                      <DeleteOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align='center'>
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar สำหรับแจ้งเตือน */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
