'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Tab,
  Tabs,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'

const API_BASE_URL = 'https://ismsp-backend.onrender.com'

export default function ReportGeneratorMUI() {
  // สถานะสำหรับการจัดการข้อมูลรายงาน
  const [reportType, setReportType] = useState('full')
  const [mainClause, setMainClause] = useState('4')
  const [subClause, setSubClause] = useState('')
  const [classification, setClassification] = useState('')

  // สถานะสำหรับข้อมูลที่โหลดมาจาก API
  const [classifications, setClassifications] = useState([])
  const [clauses, setClauses] = useState([])
  const [groupedClauses, setGroupedClauses] = useState({})

  // สถานะสำหรับการแสดงผล UI
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [generatedReports, setGeneratedReports] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('success')

  // โหลดข้อมูลเมื่อ component โหลดครั้งแรก
  useEffect(() => {
    fetchClassifications()
    fetchAvailableClauses()
    fetchGeneratedReports()
  }, [])

  // โหลดรายการการจัดประเภทเอกสาร (classifications)
  const fetchClassifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/information-classification`)
      if (!response.ok) {
        throw new Error('Failed to fetch classifications')
      }
      const data = await response.json()
      setClassifications(data.data || [])

      // ตั้งค่าเริ่มต้นหากมีข้อมูล
      if (data.data && data.data.length > 0) {
        setClassification(data.data[0]._id)
      }
    } catch (error) {
      console.error('Error fetching classifications:', error)
      setError('ไม่สามารถโหลดข้อมูลการจัดประเภทเอกสารได้')
    }
  }

  // โหลดรายการ clauses ที่มีในระบบ
  const fetchAvailableClauses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sub-clause-report/available-sub-clauses`)
      if (!response.ok) {
        throw new Error('Failed to fetch available clauses')
      }
      const data = await response.json()
      setClauses(data.clauses || [])
      setGroupedClauses(data.groupedClauses || {})
    } catch (error) {
      console.error('Error fetching available clauses:', error)
      setError('ไม่สามารถโหลดข้อมูล clauses ได้')
    }
  }

  // โหลดรายงานที่สร้างไว้แล้ว
  const fetchGeneratedReports = async () => {
    try {
      setIsLoading(true) // เพิ่มตัวแสดงการโหลด
      console.log(`Fetching reports from: ${API_BASE_URL}/api/report/list`)

      const response = await fetch(`${API_BASE_URL}/api/report/list`)
      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Failed to fetch generated reports: ${response.status}, ${errorText}`)
      }

      const data = await response.json()
      console.log('Reports data:', data)
      setGeneratedReports(data.reports || [])
    } catch (error) {
      console.error('Error fetching generated reports:', error)
      setSnackMessage('เกิดข้อผิดพลาดในการโหลดรายการรายงาน: ' + error.message)
      setSnackSeverity('error')
      setSnackOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  // ฟังก์ชันสร้างรายงาน
  const generateReport = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let endpoint
      let reqData = { classificationId: classification }

      // เลือก endpoint ตามประเภทรายงาน
      if (reportType === 'full') {
        endpoint = `${API_BASE_URL}/api/report/generate-full-report`
      } else if (reportType === 'clause') {
        endpoint = `${API_BASE_URL}/api/report/generate-clause${mainClause}-report`
      } else {
        endpoint = `${API_BASE_URL}/api/sub-clause-report/generate-sub-clause-report`
        reqData.subClauseNumber = subClause || mainClause
      }

      console.log('Sending request to:', endpoint, 'with data:', reqData)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData)
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.status}`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      // ตรวจสอบว่าเป็นรายงานแบบเต็มหรือไม่
      if (reportType === 'full' && data.allFilePaths && Array.isArray(data.allFilePaths)) {
        // กรณีเป็นรายงานแบบเต็ม และมี allFilePaths
        setSuccess(`รายงานทุกหมวดถูกสร้างเรียบร้อยแล้ว จำนวน ${data.allFilePaths.length} ไฟล์`)

        // หรือถ้าต้องการแสดงชื่อไฟล์ทั้งหมด
        // const fileNames = data.allFilePaths.map(path => path.split('/').pop()).join(', ');
        // setSuccess(`รายงานทุกหมวดถูกสร้างเรียบร้อยแล้ว: ${fileNames}`);
      } else {
        // กรณีไม่ใช่รายงานแบบเต็ม หรือไม่มี allFilePaths
        let filename = 'report.pdf'
        if (data.filePath && typeof data.filePath === 'string') {
          filename = data.filePath.split('/').pop()
        }
        setSuccess(`รายงานถูกสร้างเรียบร้อยแล้ว: ${filename}`)
      }

      // แสดง snackbar
      setSnackMessage('สร้างรายงานสำเร็จแล้ว')
      setSnackSeverity('success')
      setSnackOpen(true)

      fetchGeneratedReports() // โหลดรายการรายงานใหม่

      // เปลี่ยนไปที่แท็บรายงานหลังจากสร้างเสร็จ
      setTimeout(() => setTabValue(1), 1500)
    } catch (error) {
      console.error('Error generating report:', error)
      setError('เกิดข้อผิดพลาดในการสร้างรายงาน โปรดลองอีกครั้ง')

      // แสดง snackbar error
      setSnackMessage('เกิดข้อผิดพลาดในการสร้างรายงาน')
      setSnackSeverity('error')
      setSnackOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  // ฟังก์ชันดาวน์โหลดรายงาน
  const downloadReport = filename => {
    window.location.href = `${API_BASE_URL}/api/report/download/${filename}`
  }

  // ฟังก์ชันลบรายงาน
  const deleteReport = async filename => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/${filename}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete report')
      }

      // โหลดรายการรายงานใหม่
      fetchGeneratedReports()

      // แสดง snackbar
      setSnackMessage(`ลบรายงาน ${filename} เรียบร้อยแล้ว`)
      setSnackSeverity('success')
      setSnackOpen(true)
    } catch (error) {
      console.error('Error deleting report:', error)

      // แสดง snackbar error
      setSnackMessage('เกิดข้อผิดพลาดในการลบรายงาน')
      setSnackSeverity('error')
      setSnackOpen(true)
    }
  }

  // ฟังก์ชันหาชื่อ clause จาก ID
  const getClauseName = id => {
    const clause = clauses.find(c => c.number === id)
    return clause ? clause.title : ''
  }

  // แสดงชื่อรายงานตามประเภทที่เลือก
  const getReportName = () => {
    if (reportType === 'full') {
      return 'รายงาน ISMS แบบเต็ม'
    } else if (reportType === 'clause') {
      return `รายงานหมวด ${mainClause}: ${getClauseName(mainClause)}`
    } else {
      const clauseId = subClause || mainClause
      return `รายงานหมวดย่อย ${clauseId}: ${getClauseName(clauseId)}`
    }
  }

  // จัดการการเปลี่ยนแท็บ
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // ปิด Snackbar
  const handleSnackClose = () => {
    setSnackOpen(false)
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h4' component='h1' gutterBottom>
        ระบบสร้างรายงาน ISMS
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label='report tabs'>
          <Tab label='สร้างรายงาน' />
          <Tab label='รายงานที่สร้างแล้ว' />
        </Tabs>
      </Box>

      {/* แท็บสร้างรายงาน */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title='สร้างรายงานใหม่' />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id='report-type-label'>ประเภทรายงาน</InputLabel>
                      <Select
                        labelId='report-type-label'
                        id='report-type'
                        value={reportType}
                        label='ประเภทรายงาน'
                        onChange={e => setReportType(e.target.value)}
                      >
                        <MenuItem value='full'>รายงานแบบเต็ม (ทุกหมวด)</MenuItem>
                        <MenuItem value='clause'>รายงานตามหมวดหลัก</MenuItem>
                        <MenuItem value='sub-clause'>รายงานตามหมวดย่อย</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {reportType !== 'full' && (
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id='main-clause-label'>หมวดหลัก</InputLabel>
                        <Select
                          labelId='main-clause-label'
                          id='main-clause'
                          value={mainClause}
                          label='หมวดหลัก'
                          onChange={e => {
                            setMainClause(e.target.value)
                            setSubClause('')
                          }}
                        >
                          {Object.keys(groupedClauses).map(clause => (
                            <MenuItem key={clause} value={clause}>
                              {clause}: {getClauseName(clause)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {reportType === 'sub-clause' && groupedClauses[mainClause]?.length > 1 && (
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id='sub-clause-label'>หมวดย่อย</InputLabel>
                        <Select
                          labelId='sub-clause-label'
                          id='sub-clause'
                          value={subClause}
                          label='หมวดย่อย'
                          onChange={e => setSubClause(e.target.value)}
                        >
                          <MenuItem value=''>-- ทั้งหมดในหมวด {mainClause} --</MenuItem>
                          {groupedClauses[mainClause]
                            ?.filter(item => item.number !== mainClause)
                            .map(clause => (
                              <MenuItem key={clause.number} value={clause.number}>
                                {clause.number}: {clause.title}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id='classification-label'>การจัดประเภทเอกสาร</InputLabel>
                      <Select
                        labelId='classification-label'
                        id='classification'
                        value={classification}
                        label='การจัดประเภทเอกสาร'
                        onChange={e => setClassification(e.target.value)}
                      >
                        {classifications.map(c => (
                          <MenuItem key={c._id} value={c._id}>
                            {c.label} - {c.description}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {error && (
                    <Grid item xs={12}>
                      <Alert severity='error'>
                        <AlertTitle>ข้อผิดพลาด</AlertTitle>
                        {error}
                      </Alert>
                    </Grid>
                  )}

                  {success && (
                    <Grid item xs={12}>
                      <Alert severity='success'>
                        <AlertTitle>สำเร็จ</AlertTitle>
                        {success}
                      </Alert>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Button
                      variant='contained'
                      color='primary'
                      fullWidth
                      disabled={isLoading || !classification}
                      onClick={generateReport}
                      startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                      {isLoading ? 'กำลังสร้างรายงาน...' : 'สร้างรายงาน'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title='รายละเอียดรายงาน' />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    ชื่อรายงาน
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {getReportName()}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    การจัดประเภทเอกสาร
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {classifications.find(c => c._id === classification)?.label || 'ไม่ได้เลือก'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant='subtitle1' gutterBottom>
                    รายละเอียด
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {reportType === 'full' && 'รายงานแบบเต็มจะรวมทุกหมวดของมาตรฐาน ISO 27001 ไว้ในรายงานเดียว'}
                    {reportType === 'clause' && `รายงานหมวดหลักจะแสดงข้อมูลทั้งหมดที่เกี่ยวข้องกับหมวด ${mainClause}`}
                    {reportType === 'sub-clause' &&
                      `รายงานหมวดย่อยจะแสดงเฉพาะข้อมูลที่เกี่ยวข้องกับหมวด ${subClause || mainClause}`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* แท็บรายงานที่สร้างแล้ว */}
      {tabValue === 1 && (
        <Card>
          <CardHeader title='รายงานที่สร้างแล้ว' />
          <CardContent>
            {generatedReports.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant='h6' color='text.secondary'>
                  ยังไม่มีรายงานในระบบ
                </Typography>
              </Box>
            ) : (
              <List>
                {generatedReports.map((report, index) => (
                  <Paper key={index} sx={{ mb: 2 }}>
                    <ListItem>
                      <ListItemText
                        primary={report.name}
                        secondary={`สร้างเมื่อ: ${new Date(report.createdAt).toLocaleString('th-TH')}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge='end'
                          onClick={() => downloadReport(report.name)}
                          aria-label='download'
                          color='primary'
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          edge='end'
                          onClick={() => deleteReport(report.name)}
                          aria-label='delete'
                          color='error'
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Paper>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Snackbar สำหรับแจ้งเตือน */}
      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
