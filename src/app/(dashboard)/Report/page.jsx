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
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'

// Update the base URL to match your deployment or use environment variable
const API_BASE_URL = 'https://ismsp-backend.onrender.com'

export default function ReportGenerator() {
  // State for report data
  const [reportType, setReportType] = useState('full')
  const [mainClause, setMainClause] = useState('4')
  const [subClause, setSubClause] = useState('')
  const [classification, setClassification] = useState('')

  // State for API loaded data
  const [classifications, setClassifications] = useState([])
  const [clauses, setClauses] = useState([])
  const [groupedClauses, setGroupedClauses] = useState({})

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [generatedReports, setGeneratedReports] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('success')

  // State for filtering
  const [filterText, setFilterText] = useState('')
  const [filterClause, setFilterClause] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  // Load data on component mount
  useEffect(() => {
    fetchClassifications()
    fetchAvailableClauses()
    fetchGeneratedReports()
  }, [])

  // Fetch document classifications
  const fetchClassifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/information-classification`)
      if (!response.ok) {
        throw new Error('Failed to fetch classifications')
      }
      const data = await response.json()
      setClassifications(data.data || [])

      // Set default if available
      if (data.data && data.data.length > 0) {
        setClassification(data.data[0]._id)
      }
    } catch (error) {
      console.error('Error fetching classifications:', error)
      setError('ไม่สามารถโหลดข้อมูลการจัดประเภทเอกสารได้')
    }
  }

  // Fetch available clauses and sub-clauses
  const fetchAvailableClauses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sub-clause-report/available-sub-clauses`)
      if (!response.ok) {
        throw new Error('Failed to fetch available clauses')
      }
      const data = await response.json()
      setClauses(data.clauses || [])
      setGroupedClauses(data.groupedClauses || {})

      // If no clauses are loaded, set up default structure
      if (!data.groupedClauses || Object.keys(data.groupedClauses).length === 0) {
        const defaultGroupedClauses = {
          4: [
            { number: '4', title: 'Context of the Organization' },
            { number: '4.1', title: 'Understanding the Organization and its Context' },
            { number: '4.2', title: 'Understanding the Needs and Expectations of Interested Parties' },
            { number: '4.3', title: 'Determining the Scope of the ISMS' },
            { number: '4.4', title: 'Information Security Management System' }
          ],
          5: [
            { number: '5', title: 'Leadership' },
            { number: '5.1', title: 'Leadership and Commitment' },
            { number: '5.2', title: 'Policy' },
            { number: '5.3', title: 'Organizational Roles, Responsibilities and Authorities' }
          ],
          6: [
            { number: '6', title: 'Planning' },
            { number: '6.1', title: 'Actions to Address Risks and Opportunities' },
            { number: '6.2', title: 'Information Security Objectives and Planning to Achieve Them' }
          ],
          7: [
            { number: '7', title: 'Support' },
            { number: '7.1', title: 'Resources' },
            { number: '7.2', title: 'Competence' },
            { number: '7.3', title: 'Awareness' },
            { number: '7.4', title: 'Communication' },
            { number: '7.5', title: 'Documented Information' }
          ],
          8: [
            { number: '8', title: 'Operation' },
            { number: '8.1', title: 'Operational Planning and Control' },
            { number: '8.2', title: 'Information Security Risk Assessment' },
            { number: '8.3', title: 'Information Security Risk Treatment' }
          ],
          9: [
            { number: '9', title: 'Performance Evaluation' },
            { number: '9.1', title: 'Monitoring, Measurement, Analysis and Evaluation' },
            { number: '9.2', title: 'Internal Audit' },
            { number: '9.3', title: 'Management Review' }
          ],
          10: [
            { number: '10', title: 'Improvement' },
            { number: '10.1', title: 'Nonconformity and Corrective Action' },
            { number: '10.2', title: 'Continual Improvement' }
          ]
        }
        setGroupedClauses(defaultGroupedClauses)

        // Create flat array of all clauses
        const allClauses = Object.values(defaultGroupedClauses).flat()
        setClauses(allClauses)
      }
    } catch (error) {
      console.error('Error fetching available clauses:', error)
      setError('ไม่สามารถโหลดข้อมูล clauses ได้')
    }
  }

  // Fetch list of generated reports
  const fetchGeneratedReports = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/report/list`)

      if (!response.ok) {
        throw new Error(`Failed to fetch generated reports: ${response.status}`)
      }

      const data = await response.json()
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

  // Generate report based on selected options
  const generateReport = async () => {
    if (!classification) {
      setSnackMessage('กรุณาเลือกการจัดประเภทเอกสาร')
      setSnackSeverity('warning')
      setSnackOpen(true)
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let endpoint
      let reqData = { classificationId: classification }

      // Select appropriate endpoint based on report type
      if (reportType === 'full') {
        endpoint = `${API_BASE_URL}/api/report/generate-full-report`
      } else if (reportType === 'clause') {
        endpoint = `${API_BASE_URL}/api/report/generate-clause${mainClause}-report`
      } else {
        // sub-clause
        endpoint = `${API_BASE_URL}/api/sub-clause-report/generate-sub-clause-report`
        reqData.subClauseNumber = subClause || mainClause
      }

      console.log('Sending request to:', endpoint, 'with data:', reqData)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to generate report: ${response.status}`)
      }

      const data = await response.json()
      console.log('Report generation response:', data)

      // Handle response
      if (data.filePath) {
        const filename = data.filePath.split('/').pop()
        setSuccess(`รายงานถูกสร้างเรียบร้อยแล้ว: ${filename}`)
      } else {
        setSuccess('รายงานถูกสร้างเรียบร้อยแล้ว')
      }

      // Show notification
      setSnackMessage('สร้างรายงานสำเร็จแล้ว')
      setSnackSeverity('success')
      setSnackOpen(true)

      // Refresh report list
      fetchGeneratedReports()

      // Switch to reports tab
      setTimeout(() => setTabValue(1), 1500)
    } catch (error) {
      console.error('Error generating report:', error)
      setError('เกิดข้อผิดพลาดในการสร้างรายงาน: ' + error.message)

      setSnackMessage('เกิดข้อผิดพลาดในการสร้างรายงาน')
      setSnackSeverity('error')
      setSnackOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Download a report
  const downloadReport = filename => {
    window.open(`${API_BASE_URL}/api/report/download/${filename}`, '_blank')
  }

  // Delete a report
  const deleteReport = async filename => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/${filename}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete report')
      }

      fetchGeneratedReports()

      setSnackMessage(`ลบรายงาน ${filename} เรียบร้อยแล้ว`)
      setSnackSeverity('success')
      setSnackOpen(true)
    } catch (error) {
      console.error('Error deleting report:', error)
      setSnackMessage('เกิดข้อผิดพลาดในการลบรายงาน')
      setSnackSeverity('error')
      setSnackOpen(true)
    }
  }

  // Get clause name from ID
  const getClauseName = id => {
    const clause = clauses.find(c => c.number === id)
    return clause ? clause.title : ''
  }

  // Get report name based on selected options
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    if (newValue === 1) {
      fetchGeneratedReports()
    }
  }

  // Close snackbar
  const handleSnackClose = () => {
    setSnackOpen(false)
  }

  const filteredReports = generatedReports
    .filter(report => {
      // Text filter
      const matchesText = filterText === '' || report.name.toLowerCase().includes(filterText.toLowerCase())

      // Clause filter
      const matchesClause = filterClause === 'all' || report.name.toLowerCase().includes(`clause${filterClause}`)

      return matchesText && matchesClause
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
    })

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

      {/* Create Report Tab */}
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

      {/* Generated Reports Tab */}
      {tabValue === 1 && (
        <Card>
          <CardHeader
            title='รายงานที่สร้างแล้ว'
            action={
              <IconButton onClick={fetchGeneratedReports} disabled={isLoading} aria-label='refresh'>
                <RefreshIcon />
              </IconButton>
            }
          />
          <CardContent>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : generatedReports.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant='h6' color='text.secondary'>
                  ยังไม่มีรายงานในระบบ
                </Typography>
              </Box>
            ) : (
              <>
                {/* ใส่ส่วน filter ตรงนี้ */}
                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={2} alignItems='center'>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='ค้นหาชื่อรายงาน'
                        variant='outlined'
                        size='small'
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <FormControl fullWidth size='small'>
                        <InputLabel>กรองตามหมวด</InputLabel>
                        <Select
                          value={filterClause}
                          label='กรองตามหมวด'
                          onChange={e => setFilterClause(e.target.value)}
                        >
                          <MenuItem value='all'>ทั้งหมด</MenuItem>
                          {[...Array(7)].map((_, i) => (
                            <MenuItem key={i + 4} value={(i + 4).toString()}>
                              หมวด {i + 4}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <FormControl fullWidth size='small'>
                        <InputLabel>เรียงตาม</InputLabel>
                        <Select value={sortOrder} label='เรียงตาม' onChange={e => setSortOrder(e.target.value)}>
                          <MenuItem value='newest'>ล่าสุดก่อน</MenuItem>
                          <MenuItem value='oldest'>เก่าสุดก่อน</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button
                        fullWidth
                        variant='outlined'
                        onClick={() => {
                          setFilterText('')
                          setFilterClause('all')
                          setSortOrder('newest')
                        }}
                      >
                        ล้างตัวกรอง
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* รายการรายงาน (ใช้ filteredReports แทน generatedReports) */}
                <List>
                  {filteredReports.map((report, index) => (
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
              </>
            )}
          </CardContent>
        </Card>
      )}
      {/* Notification Snackbar */}
      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
