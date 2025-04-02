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
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Checkbox,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import VisibilityIcon from '@mui/icons-material/Visibility'

export default function BoundaryManagement() {
  const [allSOAs, setAllSOAs] = useState([])
  const [boundary, setBoundary] = useState({
    soaItems: [],
    besidesSOA: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' })
  const [loading, setLoading] = useState(true)

  // เพิ่มสถานะเพื่อเก็บ SOA IDs ที่เลือกแล้ว
  const [selectedSOAs, setSelectedSOAs] = useState(new Set())

  // เพิ่มตัวกรองสำหรับ Inclusion/Exclusion
  const [inclusionFilter, setInclusionFilter] = useState('all')

  useEffect(() => {
    fetchSoaOptions()
    fetchBoundaries()
  }, [])

  const fetchSoaOptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://192.168.0.119:3000/api/settings/soa')
      const result = await response.json()

      console.log('SOA Options:', result.data)

      if (result.data && result.data.length > 0) {
        setAllSOAs(result.data)
      } else {
        console.warn('SOA Options API returned empty data.')
        setAllSOAs([])
      }
    } catch (error) {
      console.error('Error fetching SOA Options:', error)
      setAlert({
        open: true,
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล SOA',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBoundaries = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://192.168.0.119:3000/api/4COTO/boundary/')
      const result = await response.json()

      console.log('📥 Fetched Boundary Data:', JSON.stringify(result, null, 2))

      if (result && Array.isArray(result) && result.length > 0) {
        // ดึงข้อมูลขอบเขตจาก API
        const boundaryData = result[0]
        let soaItems = []

        // ตรวจสอบว่ามีโครงสร้างข้อมูลใหม่หรือไม่
        if (boundaryData.soaItems) {
          // ถ้ามีโครงสร้างใหม่ ใช้ข้อมูลโดยตรง
          soaItems = Array.isArray(boundaryData.soaItems)
            ? boundaryData.soaItems.map(item => ({
                soa: item.soa || '',
                status: item.status || 'Included',
                description: item.description || ''
              }))
            : []
        } else {
          // แปลงจากโครงสร้างเก่า (inclusions/exclusions) เป็นโครงสร้างใหม่
          soaItems = [
            // แปลง inclusions เป็น status: "Included"
            ...(boundaryData.inclusions || []).map(inc => ({
              soa: inc.soa || '',
              status: 'Included',
              description: inc.description || ''
            })),
            // แปลง exclusions เป็น status: "Excluded"
            ...(boundaryData.exclusions || []).map(exc => ({
              soa: exc.soa || '',
              status: 'Excluded',
              description: exc.description || ''
            }))
          ]
        }

        // เก็บข้อมูล SOAs ที่เลือกแล้วในเซ็ต
        const selectedSOAIds = new Set(soaItems.map(item => item.soa))
        setSelectedSOAs(selectedSOAIds)

        setBoundary({
          _id: boundaryData._id || undefined,
          soaItems,
          besidesSOA: boundaryData.besidesSOA || ''
        })
      } else {
        console.warn('Boundary API returned empty data.')
        setBoundary({
          _id: undefined,
          soaItems: [],
          besidesSOA: ''
        })
        setSelectedSOAs(new Set())
      }
    } catch (error) {
      console.error('Error fetching Boundary:', error)
      // จัดการข้อมูลเริ่มต้นเมื่อเกิด error
      setBoundary({
        _id: undefined,
        soaItems: [],
        besidesSOA: ''
      })
      setSelectedSOAs(new Set())
      setAlert({
        open: true,
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลขอบเขต',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันจัดการเลือก/ยกเลิกการเลือก SOA รายการ
  const handleToggleSOA = soaId => {
    // ถ้า soaId มีอยู่ใน boundary.soaItems แล้ว ให้ลบออก
    if (selectedSOAs.has(soaId)) {
      // ลบออกจาก boundary.soaItems
      setBoundary(prev => ({
        ...prev,
        soaItems: prev.soaItems.filter(item => item.soa !== soaId)
      }))

      // ลบออกจาก selectedSOAs
      const newSelectedSOAs = new Set(selectedSOAs)
      newSelectedSOAs.delete(soaId)
      setSelectedSOAs(newSelectedSOAs)
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเข้าไป
      setBoundary(prev => ({
        ...prev,
        soaItems: [
          ...prev.soaItems,
          {
            soa: soaId,
            status: 'Included', // ค่าเริ่มต้นเป็น Included
            description: ''
          }
        ]
      }))

      // เพิ่มเข้าไปใน selectedSOAs
      const newSelectedSOAs = new Set(selectedSOAs)
      newSelectedSOAs.add(soaId)
      setSelectedSOAs(newSelectedSOAs)
    }
  }

  // ฟังก์ชันเปลี่ยนสถานะหรืออธิบายของ SOA item
  const handleSOAItemChange = (soaId, field, value) => {
    setBoundary(prev => ({
      ...prev,
      soaItems: prev.soaItems.map(item => (item.soa === soaId ? { ...item, [field]: value } : item))
    }))
  }

  // บันทึก Boundary
  const handleSave = async () => {
    try {
      // ตรวจสอบว่าทุก SOA item มี description
      const hasEmptyDescription = boundary.soaItems.some(item => !item.description.trim())
      if (hasEmptyDescription) {
        setAlert({
          open: true,
          message: 'กรุณากรอกเหตุผลให้ครบทุกรายการ',
          severity: 'warning'
        })
        return
      }

      const response = await fetch('http://192.168.0.119:3000/api/4COTO/boundary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boundary)
      })
      const result = await response.json()
      console.log('Saved:', result)
      setAlert({
        open: true,
        message: 'บันทึกข้อมูลสำเร็จ!',
        severity: 'success'
      })

      await fetchBoundaries()
    } catch (error) {
      console.error('Error saving boundary:', error)
      setAlert({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        severity: 'error'
      })
    }
  }

  // ฟังก์ชันสำหรับการค้นหา SOA
  const handleSearch = e => {
    setSearchTerm(e.target.value)
  }

  // ฟังก์ชันสำหรับการกรอง SOA ตามสถานะ
  const handleStatusFilterChange = e => {
    setStatusFilter(e.target.value)
  }

  // ฟังก์ชันสำหรับการกรอง Inclusion/Exclusion
  const handleInclusionFilterChange = (_, newFilter) => {
    if (newFilter !== null) {
      setInclusionFilter(newFilter)
    }
  }

  // กรอง SOA ตามคำค้นหา, สถานะการนำไปใช้ และสถานะ Inclusion/Exclusion
  const filteredSOAs = allSOAs.filter(soa => {
    // กรองตามคำค้นหา
    const matchesSearch =
      soa.controlId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soa.controlName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soa.controlDescription?.toLowerCase().includes(searchTerm.toLowerCase())

    // กรองตามสถานะการนำไปใช้
    const matchesStatus = statusFilter === 'all' || soa.implementationStatus === statusFilter

    // ประกาศฟังก์ชันนี้ก่อนที่จะใช้
    const getSOAItem = soaId => {
      return boundary.soaItems.find(item => item.soa === soaId)
    }

    // ตอนนี้คุณสามารถใช้มันได้
    const soaItem = getSOAItem(soa.soaId)

    let matchesInclusion = true

    if (inclusionFilter !== 'all') {
      if (inclusionFilter === 'included') {
        matchesInclusion = soaItem && soaItem.status === 'Included'
      } else if (inclusionFilter === 'excluded') {
        matchesInclusion = soaItem && soaItem.status === 'Excluded'
      } else if (inclusionFilter === 'selected') {
        matchesInclusion = soaItem !== undefined
      } else if (inclusionFilter === 'unselected') {
        matchesInclusion = soaItem === undefined
      }
    }

    return matchesSearch && matchesStatus && matchesInclusion
  })

  // สร้างแถบสถานะการนำไปใช้
  const renderImplementationStatus = status => {
    let color
    switch (status) {
      case 'Fully Implemented':
        color = 'success'
        break
      case 'Partially Implemented':
        color = 'warning'
        break
      case 'Not Implemented':
        color = 'error'
        break
      default:
        color = 'default'
    }
    return <Chip label={status} color={color} size='small' />
  }

  // หา SOA Item จาก soa id
  const getSOAItem = soaId => {
    return boundary.soaItems.find(item => item.soa === soaId)
  }

  // คำนวณสถิติสำหรับแสดงในสรุป
  const includedCount = boundary.soaItems.filter(item => item.status === 'Included').length
  const excludedCount = boundary.soaItems.filter(item => item.status === 'Excluded').length
  const totalSelectedCount = boundary.soaItems.length

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='50vh'>
        <CircularProgress />
        <Typography variant='h6' sx={{ ml: 2 }}>
          กำลังโหลดข้อมูล...
        </Typography>
      </Box>
    )
  }

  return (
    <Box className='p-4 md:p-10 max-w-7xl mx-auto rounded-lg shadow-lg'>
      <Typography variant='h5' className='text-center font-bold mb-6'>
        การจัดการขอบเขต (Boundary Management)
      </Typography>

      {/* แถบค้นหาและกรอง SOA */}
      <Paper className='p-4 mb-6'>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='ค้นหา SOA'
              variant='outlined'
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon fontSize='small' sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              placeholder='ค้นหาตาม ID หรือชื่อ'
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id='status-filter-label'>สถานะการนำไปใช้</InputLabel>
              <Select
                labelId='status-filter-label'
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label='สถานะการนำไปใช้'
                startAdornment={<FilterListIcon fontSize='small' sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value='all'>ทั้งหมด</MenuItem>
                <MenuItem value='Fully Implemented'>นำไปใช้เต็มรูปแบบ</MenuItem>
                <MenuItem value='Partially Implemented'>นำไปใช้บางส่วน</MenuItem>
                <MenuItem value='Not Implemented'>ยังไม่ได้นำไปใช้</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Typography variant='body2' sx={{ minWidth: '80px' }}>
                แสดงเฉพาะ:
              </Typography>
              <ToggleButtonGroup
                value={inclusionFilter}
                exclusive
                onChange={handleInclusionFilterChange}
                aria-label='inclusion filter'
                size='small'
                fullWidth
              >
                <ToggleButton value='all' aria-label='show all'>
                  ทั้งหมด
                </ToggleButton>
                <ToggleButton value='included' aria-label='show included only'>
                  Included
                </ToggleButton>
                <ToggleButton value='excluded' aria-label='show excluded only'>
                  Excluded
                </ToggleButton>
                <ToggleButton value='selected' aria-label='show selected only'>
                  เลือกแล้ว
                </ToggleButton>
                <ToggleButton value='unselected' aria-label='show unselected only'>
                  ยังไม่เลือก
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* แสดงสรุปจำนวนรายการที่เลือก */}
      <Paper className='p-3 mb-4'>
        <Grid container spacing={2} alignItems='center'>
          <Grid item>
            <VisibilityIcon color='primary' />
          </Grid>
          <Grid item xs>
            <Typography variant='body1'>
              เลือก <strong>{totalSelectedCount}</strong> รายการ จาก {allSOAs.length} รายการ &nbsp;|&nbsp;{' '}
              <Chip label={`Included: ${includedCount}`} color='success' size='small' />
              &nbsp; <Chip label={`Excluded: ${excludedCount}`} color='error' size='small' />
              &nbsp;|&nbsp; กำลังแสดง <strong>{filteredSOAs.length}</strong> รายการ
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* แสดงรายการ SOA ทั้งหมด */}
      <Typography variant='h6' className='mt-4 mb-3'>
        Statement of Applicability (SOA)
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table aria-label='SOA table' size='small'>
          <TableHead>
            <TableRow>
              <TableCell width='5%'>เลือก</TableCell>
              <TableCell width='10%'>รหัส</TableCell>
              <TableCell width='25%'>ชื่อ</TableCell>
              <TableCell width='15%'>สถานะการนำไปใช้</TableCell>
              <TableCell width='15%'>ใช้/ไม่ใช้</TableCell>
              <TableCell width='30%'>เหตุผล</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSOAs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  ไม่พบรายการ SOA ที่ตรงกับเงื่อนไขการค้นหา
                </TableCell>
              </TableRow>
            ) : (
              filteredSOAs.map(soa => {
                const isSelected = selectedSOAs.has(soa.soaId)
                const soaItem = getSOAItem(soa.soaId)

                return (
                  <TableRow
                    key={soa.soaId}
                    sx={{
                      backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                      // เพิ่มสีพื้นหลังตามสถานะ Included/Excluded
                      ...(isSelected &&
                        soaItem?.status === 'Included' && {
                          backgroundColor: 'rgba(46, 125, 50, 0.08)'
                        }),
                      ...(isSelected &&
                        soaItem?.status === 'Excluded' && {
                          backgroundColor: 'rgba(211, 47, 47, 0.08)'
                        })
                    }}
                  >
                    <TableCell>
                      <Checkbox checked={isSelected} onChange={() => handleToggleSOA(soa.soaId)} />
                    </TableCell>
                    <TableCell>{soa.controlId}</TableCell>
                    <TableCell>{soa.controlName}</TableCell>
                    <TableCell>{renderImplementationStatus(soa.implementationStatus)}</TableCell>
                    <TableCell>
                      {isSelected && (
                        <RadioGroup
                          row
                          value={soaItem?.status || 'Included'}
                          onChange={e => handleSOAItemChange(soa.soaId, 'status', e.target.value)}
                        >
                          <FormControlLabel value='Included' control={<Radio size='small' />} label='ใช้' />
                          <FormControlLabel value='Excluded' control={<Radio size='small' />} label='ไม่ใช้' />
                        </RadioGroup>
                      )}
                    </TableCell>
                    <TableCell>
                      {isSelected && (
                        <TextField
                          fullWidth
                          size='small'
                          placeholder={soaItem?.status === 'Excluded' ? 'ระบุเหตุผลที่ไม่ใช้' : 'ระบุเหตุผลที่ใช้'}
                          value={soaItem?.description || ''}
                          onChange={e => handleSOAItemChange(soa.soaId, 'description', e.target.value)}
                          error={isSelected && !soaItem?.description}
                          helperText={isSelected && !soaItem?.description ? 'กรุณาระบุเหตุผล' : ''}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider className='my-6' />

      {/* ข้อมูลเพิ่มเติม */}
      <Typography variant='h6' className='mt-6 mb-2'>
        ข้อมูลเพิ่มเติมนอกเหนือจาก SOA
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        label='ข้อมูลเพิ่มเติม'
        value={boundary.besidesSOA}
        onChange={e => setBoundary(prev => ({ ...prev, besidesSOA: e.target.value }))}
        placeholder='ระบุข้อมูลเพิ่มเติมเกี่ยวกับขอบเขตที่นอกเหนือจาก SOA เช่น มาตรฐานภายในองค์กร ข้อกำหนดเฉพาะ ฯลฯ'
        className='mb-6'
      />

      {/* ปุ่มบันทึก */}
      <Button
        variant='contained'
        color='primary'
        className='mt-6'
        fullWidth
        onClick={handleSave}
        size='large'
        disabled={boundary.soaItems.length === 0}
      >
        บันทึกข้อมูลขอบเขต
      </Button>

      {/* Alert สำหรับแสดงข้อความแจ้งเตือน */}
      <Snackbar open={alert.open} autoHideDuration={5000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
