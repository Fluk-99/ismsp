'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Rating,
  Slider,
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Snackbar
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PlaylistAdd as PlaylistAddIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import React, { Fragment } from 'react'

// Define asset types
// Define risk types (formerly asset types)
const riskTypes = [
  { value: 'Personnel', label: 'บุคลากร' },
  { value: 'Information System', label: 'ระบบสารสนเทศ' },
  { value: 'Hardware', label: 'ฮาร์ดแวร์' },
  { value: 'Data', label: 'ข้อมูล' },
  { value: 'Service', label: 'บริการ' },
  { value: 'Internal Factor', label: 'ปัจจัยภายใน' },
  { value: 'External Factor', label: 'ปัจจัยภายนอก' },
  { value: 'Other', label: 'อื่นๆ' }
]

// Define treatment options
const treatmentOptions = [
  { value: 'Accept', label: 'ยอมรับความเสี่ยง (Accept)' },
  { value: 'Reduce', label: 'ลดความเสี่ยง (Reduce)' },
  { value: 'Transfer', label: 'ถ่ายโอนความเสี่ยง (Transfer)' },
  { value: 'Avoid', label: 'หลีกเลี่ยงความเสี่ยง (Avoid)' },
  { value: 'Other', label: 'อื่นๆ (Other)' }
]

// Define calculation methods
const calculationMethods = [
  { value: 'addition', label: 'การบวก (C+I+A)' },
  { value: 'multiplication', label: 'การคูณ (C×I×A)' }
]

// Define treatment plan statuses
const treatmentStatusOptions = [
  { value: 'Planned', label: 'วางแผนแล้ว' },
  { value: 'In Progress', label: 'กำลังดำเนินการ' },
  { value: 'Completed', label: 'เสร็จสิ้นแล้ว' },
  { value: 'Cancelled', label: 'ยกเลิก' }
]

export default function RiskManagementPage() {
  const [riskEntries, setRiskEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRiskType, setFilterRiskType] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assets, setAssets] = useState([])
  const [riskAssessment, setRiskAssessment] = useState(null)

  // Updated risk form data
  const [riskFormData, setRiskFormData] = useState({
    riskType: '',
    assetId: '',
    assetName: '',
    riskIssue: '',
    threat: '',
    vulnerability: '',
    existingControls: '',
    newControl: '',
    confidentialityLevel: 3,
    integrityLevel: 3,
    availabilityLevel: 3,
    impactLevel: 3,
    likelihoodLevel: 3,
    calculationMethod: 'addition',
    riskThreshold: null
  })

  // Updated treatment form data
  const [treatmentFormData, setTreatmentFormData] = useState({
    treatmentOption: 'Reduce',
    otherOption: '',
    description: '',
    startDate: '',
    endDate: '',
    responsible: '',
    residualRisk: {
      confidentialityLevel: 1,
      integrityLevel: 1,
      availabilityLevel: 1,
      likelihoodLevel: 1,
      calculatedImpact: 0,
      riskLevel: 0,
      isAcceptable: false
    },
    status: 'Planned',
    isFinal: false
  })

  // Remove fetchRiskCriteria call
  useEffect(() => {
    fetchRiskEntries()
    fetchAssets()
    fetchRiskAssessment()
  }, [])

  // Update calculateImpactAndRisk
  const calculateImpactAndRisk = () => {
    if (!riskAssessment) return

    let impactScore
    const isSpecialRiskType = ['Internal Factor', 'External Factor', 'Other'].includes(riskFormData.riskType)

    if (isSpecialRiskType) {
      impactScore = Number(riskFormData.impactLevel)
    } else {
      if (riskFormData.calculationMethod === 'addition') {
        impactScore =
          Number(riskFormData.confidentialityLevel) +
          Number(riskFormData.integrityLevel) +
          Number(riskFormData.availabilityLevel)
      } else {
        impactScore =
          (Number(riskFormData.confidentialityLevel) *
            Number(riskFormData.integrityLevel) *
            Number(riskFormData.availabilityLevel)) /
          10
      }
    }

    // Find impact threshold
    const impactThreshold = findMatchingThreshold(impactScore, riskAssessment.impactThresholds)
    if (!impactThreshold) return

    // Calculate risk level
    const riskLevel = impactThreshold.level * Number(riskFormData.likelihoodLevel)

    // Find risk threshold
    const riskThreshold = findMatchingThreshold(riskLevel, riskAssessment.riskThresholds)
    if (!riskThreshold) return

    setCalculatedValues({
      impactScore,
      riskLevel,
      exceedsThreshold: riskLevel > riskThreshold.max,
      impactSeverity: impactThreshold.name
    })

    // Update form data with thresholds
    setRiskFormData(prev => ({
      ...prev,
      riskThreshold
    }))
  }

  // Add helper function
  const findMatchingThreshold = (value, thresholds) => {
    return thresholds?.find(t => value >= t.min && value <= t.max)
  }

  // Update handleSubmitRiskEntry
  const handleSubmitRiskEntry = async e => {
    e.preventDefault()

    const isSpecialRiskType = ['Internal Factor', 'External Factor', 'Other'].includes(riskFormData.riskType)

    if (!isSpecialRiskType && (!riskFormData.assetId || !riskFormData.assetName)) {
      setSnackbar({
        open: true,
        message: 'กรุณาเลือกสินทรัพย์',
        severity: 'error'
      })
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...riskFormData,
        impactScore: calculatedValues.impactScore,
        impactLevel: calculatedValues.impactLevel,
        riskLevel: calculatedValues.riskLevel,
        exceedsThreshold: calculatedValues.exceedsThreshold,
        riskThreshold: riskFormData.riskThreshold
      }

      // Rest of the submission code...
    } catch (error) {
      console.error('Error submitting risk entry:', error)
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Update calculateResidualRisk
  const calculateResidualRisk = () => {
    if (!selectedRiskEntry || !riskAssessment) return

    const { confidentialityLevel, integrityLevel, availabilityLevel } = treatmentFormData.residualRisk
    let calculatedImpact

    if (['Internal Factor', 'External Factor', 'Other'].includes(selectedRiskEntry.riskType)) {
      calculatedImpact = Math.round(Number(confidentialityLevel) + Number(integrityLevel) + Number(availabilityLevel))
    } else {
      if (selectedRiskEntry.calculationMethod === 'addition') {
        calculatedImpact = Number(confidentialityLevel) + Number(integrityLevel) + Number(availabilityLevel)
      } else {
        calculatedImpact = Number(confidentialityLevel) * Number(integrityLevel) * Number(availabilityLevel)
      }
    }

    // Find impact threshold
    const impactThreshold = findMatchingThreshold(calculatedImpact, riskAssessment.impactThresholds)
    if (!impactThreshold) return

    // Calculate risk level
    const riskLevel = impactThreshold.level * Number(treatmentFormData.residualRisk.likelihoodLevel)

    // Find risk threshold
    const riskThreshold = findMatchingThreshold(riskLevel, riskAssessment.riskThresholds)
    if (!riskThreshold) return

    setTreatmentFormData(prev => ({
      ...prev,
      residualRisk: {
        ...prev.residualRisk,
        calculatedImpact,
        riskLevel,
        isAcceptable: riskLevel <= riskThreshold.max
      }
    }))
  }

  // Update handleAddTreatmentPlan
  const handleAddTreatmentPlan = () => {
    if (!selectedRiskEntry || !riskAssessment) return

    setTreatmentFormData({
      treatmentOption: 'Reduce',
      otherOption: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      responsible: '',
      residualRisk: {
        confidentialityLevel: selectedRiskEntry.confidentialityLevel,
        integrityLevel: selectedRiskEntry.integrityLevel,
        availabilityLevel: selectedRiskEntry.availabilityLevel,
        likelihoodLevel: selectedRiskEntry.likelihoodLevel,
        calculatedImpact: 0,
        riskLevel: 0,
        isAcceptable: false
      },
      status: 'Planned',
      isFinal: false
    })

    setIsTreatmentEditMode(false)
    setOpenTreatmentDialog(true)
  }

  // Update handleSubmitTreatmentPlan
  const handleSubmitTreatmentPlan = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        isTreatmentEditMode
          ? `https://ismsp-backend.onrender.com/api/8OPER/risk-entry/${selectedRiskEntry._id}/treatment-plans/${selectedTreatmentPlan._id}`
          : `https://ismsp-backend.onrender.com/api/8OPER/risk-entry/${selectedRiskEntry._id}/treatment-plans`,
        {
          method: isTreatmentEditMode ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(treatmentFormData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'การดำเนินการไม่สำเร็จ')
      }

      const data = await response.json()
      setSelectedRiskEntry(data.data)
      fetchRiskEntries()
      setOpenTreatmentDialog(false)

      setSnackbar({
        open: true,
        message: isTreatmentEditMode ? 'อัปเดตแผนการจัดการความเสี่ยงสำเร็จ' : 'เพิ่มแผนการจัดการความเสี่ยงสำเร็จ',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error submitting treatment plan:', error)
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Inside return statement, before the dialogs
  ;<Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label='ทั้งหมด' />
              <Tab label='ความเสี่ยงสูง' />
              <Tab label='วางแผนแล้ว' />
              <Tab label='รอดำเนินการ' />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            {/* Controls */}
            <TextField
              label='ค้นหา'
              variant='outlined'
              size='small'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: '200px' }}
            />

            <FormControl size='small' sx={{ minWidth: '200px' }}>
              <InputLabel>ประเภทความเสี่ยง</InputLabel>
              <Select
                value={filterRiskType}
                onChange={e => handleRiskTypeFilter(e.target.value)}
                label='ประเภทความเสี่ยง'
              >
                <MenuItem value=''>ทั้งหมด</MenuItem>
                {riskTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleAddRiskEntry}
              sx={{ whiteSpace: 'nowrap' }}
            >
              เพิ่มรายการ
            </Button>

            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={fetchRiskEntries}
              sx={{ whiteSpace: 'nowrap' }}
            >
              รีเฟรช
            </Button>
          </Box>

          {/* Error message */}
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Risk entries list */}
          <Grid container spacing={2}>
            {/* Left panel - List of risk entries */}
            <Grid item xs={12} md={selectedRiskEntry ? 6 : 12}>
              <List component={Paper} sx={{ mb: 2 }}>
                {filteredEntries.length === 0 ? (
                  <ListItem>
                    <ListItemText primary='ไม่พบรายการ' />
                  </ListItem>
                ) : (
                  filteredEntries.map(entry => (
                    <Fragment key={entry._id}>
                      <ListItem
                        button
                        onClick={() => handleViewRiskEntry(entry)}
                        selected={selectedRiskEntry && selectedRiskEntry._id === entry._id}
                        secondaryAction={
                          <Box>
                            <IconButton
                              edge='end'
                              onClick={e => {
                                e.stopPropagation()
                                handleEditRiskEntry(entry)
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge='end'
                              onClick={e => {
                                e.stopPropagation()
                                handleDeleteRiskEntry(entry._id)
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon>
                          {entry.exceedsThreshold ? (
                            entry.isCompleted ? (
                              <CheckCircleIcon color='success' />
                            ) : (
                              <WarningIcon color='error' />
                            )
                          ) : (
                            <InfoIcon color='info' />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {entry.riskIssue}
                              <Chip
                                size='small'
                                color={getRiskLevelColor(entry.riskLevel)}
                                label={`${entry.riskLevel.toFixed(1)}`}
                              />
                              {entry.riskThreshold && (
                                <Typography variant='caption' color='text.secondary'>
                                  ({entry.riskThreshold.name})
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant='body2' component='span' color='text.primary'>
                                {entry.assetName || 'ไม่ระบุสินทรัพย์'}
                              </Typography>
                              {' — '}
                              <Typography variant='body2' component='span'>
                                {entry.threat || 'ไม่ระบุภัยคุกคาม'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </Fragment>
                  ))
                )}
              </List>
            </Grid>

            {/* Right panel - Risk entry details */}
            {selectedRiskEntry && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  {/* Risk entry details */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {selectedRiskEntry.riskIssue}
                      <Chip
                        size='small'
                        color={getRiskLevelColor(selectedRiskEntry.riskLevel)}
                        label={`คะแนนความเสี่ยง: ${selectedRiskEntry.riskLevel.toFixed(1)}`}
                      />
                    </Typography>

                    <Typography variant='subtitle2' color='text.secondary'>
                      {selectedRiskEntry.riskThreshold?.name || 'ไม่พบระดับความเสี่ยง'}
                      {selectedRiskEntry.exceedsThreshold ? ' (เกินเกณฑ์ยอมรับ)' : ' (อยู่ในเกณฑ์ยอมรับ)'}
                    </Typography>

                    <Typography variant='subtitle2' color='text.secondary'>
                      ประเภท:{' '}
                      {riskTypes.find(t => t.value === selectedRiskEntry.riskType)?.label || selectedRiskEntry.riskType}
                    </Typography>

                    {selectedRiskEntry.assetName && (
                      <Typography variant='subtitle2' color='text.secondary'>
                        สินทรัพย์: {selectedRiskEntry.assetName}
                      </Typography>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    {/* Risk Details */}
                    <Grid item xs={12}>
                      <Typography variant='subtitle1'>รายละเอียดความเสี่ยง</Typography>
                      <TableContainer component={Paper} variant='outlined'>
                        <Table size='small'>
                          <TableBody>
                            <TableRow>
                              <TableCell component='th' sx={{ width: '30%' }}>
                                ภัยคุกคาม
                              </TableCell>
                              <TableCell>{selectedRiskEntry.threat || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component='th'>จุดอ่อน</TableCell>
                              <TableCell>{selectedRiskEntry.vulnerability || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component='th'>การควบคุมที่มีอยู่</TableCell>
                              <TableCell>{selectedRiskEntry.existingControls || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component='th'>การควบคุมที่ควรเพิ่ม</TableCell>
                              <TableCell>{selectedRiskEntry.newControl || '-'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    {/* Risk Assessment Scores */}
                    <Grid item xs={12}>
                      <Typography variant='subtitle1'>ผลการประเมินความเสี่ยง</Typography>
                      <TableContainer component={Paper} variant='outlined'>
                        <Table size='small'>
                          <TableBody>
                            {!['Internal Factor', 'External Factor', 'Other'].includes(selectedRiskEntry.riskType) ? (
                              <>
                                <TableRow>
                                  <TableCell component='th' sx={{ width: '30%' }}>
                                    ด้านความลับ (C)
                                  </TableCell>
                                  <TableCell>{selectedRiskEntry.confidentialityLevel}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component='th'>ด้านความถูกต้อง (I)</TableCell>
                                  <TableCell>{selectedRiskEntry.integrityLevel}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component='th'>ด้านความพร้อมใช้ (A)</TableCell>
                                  <TableCell>{selectedRiskEntry.availabilityLevel}</TableCell>
                                </TableRow>
                              </>
                            ) : (
                              <TableRow>
                                <TableCell component='th' sx={{ width: '30%' }}>
                                  ระดับผลกระทบ
                                </TableCell>
                                <TableCell>{selectedRiskEntry.impactLevel}</TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell component='th'>ระดับโอกาสเกิด</TableCell>
                              <TableCell>{selectedRiskEntry.likelihoodLevel}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component='th'>วิธีการคำนวณ</TableCell>
                              <TableCell>
                                {calculationMethods.find(m => m.value === selectedRiskEntry.calculationMethod)?.label ||
                                  selectedRiskEntry.calculationMethod}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component='th'>ผลกระทบรวม</TableCell>
                              <TableCell>{selectedRiskEntry.impactScore.toFixed(1)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component='th'>ระดับความเสี่ยง</TableCell>
                              <TableCell>{selectedRiskEntry.riskLevel.toFixed(1)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    {/* Treatment Plans */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant='subtitle1'>แผนการจัดการความเสี่ยง</Typography>
                        <Button size='small' startIcon={<PlaylistAddIcon />} onClick={handleAddTreatmentPlan}>
                          เพิ่มแผน
                        </Button>
                      </Box>

                      {selectedRiskEntry.treatmentPlans && selectedRiskEntry.treatmentPlans.length > 0 ? (
                        <TableContainer component={Paper} variant='outlined'>
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell>วิธีการจัดการ</TableCell>
                                <TableCell>รายละเอียด</TableCell>
                                <TableCell>ระยะเวลา</TableCell>
                                <TableCell>ผู้รับผิดชอบ</TableCell>
                                <TableCell>สถานะ</TableCell>
                                <TableCell>การจัดการ</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedRiskEntry.treatmentPlans.map(plan => (
                                <TableRow key={plan._id}>
                                  <TableCell>
                                    {treatmentOptions.find(opt => opt.value === plan.treatmentOption)?.label ||
                                      plan.treatmentOption}
                                    {plan.isFinal && (
                                      <Chip size='small' color='success' label='แผนสุดท้าย' sx={{ ml: 1 }} />
                                    )}
                                  </TableCell>
                                  <TableCell>{plan.description}</TableCell>
                                  <TableCell>
                                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                                  </TableCell>
                                  <TableCell>{plan.responsible}</TableCell>
                                  <TableCell>
                                    <Chip
                                      size='small'
                                      color={
                                        plan.status === 'Completed'
                                          ? 'success'
                                          : plan.status === 'In Progress'
                                            ? 'info'
                                            : plan.status === 'Cancelled'
                                              ? 'error'
                                              : 'default'
                                      }
                                      label={
                                        treatmentStatusOptions.find(s => s.value === plan.status)?.label || plan.status
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <IconButton size='small' onClick={() => handleEditTreatmentPlan(plan)}>
                                      <EditIcon fontSize='small' />
                                    </IconButton>
                                    <IconButton size='small' onClick={() => handleDeleteTreatmentPlan(plan._id)}>
                                      <DeleteIcon fontSize='small' />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          ยังไม่มีแผนการจัดการความเสี่ยง
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  </Container>

  // Inside return statement, update Risk Entry Dialog
  return (
    <>
      <Dialog open={openRiskDialog} onClose={() => setOpenRiskDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>{isEditMode ? 'แก้ไขรายการความเสี่ยง' : 'เพิ่มรายการความเสี่ยง'}</DialogTitle>
        <form onSubmit={handleSubmitRiskEntry}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Asset Information */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>ประเภทความเสี่ยง</InputLabel>
                  <Select
                    name='riskType'
                    value={riskFormData.riskType}
                    onChange={handleRiskFormChange}
                    label='ประเภทความเสี่ยง'
                    required
                  >
                    {riskTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Show asset selection only for non-special risk types */}
              {!['Internal Factor', 'External Factor', 'Other'].includes(riskFormData.riskType) && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin='normal'>
                    <InputLabel>สินทรัพย์</InputLabel>
                    <Select
                      name='assetId'
                      value={riskFormData.assetId || ''}
                      onChange={handleRiskFormChange}
                      label='สินทรัพย์'
                      required
                    >
                      {assets
                        .filter(asset => !riskFormData.riskType || asset.category === riskFormData.riskType)
                        .map(asset => (
                          <MenuItem key={asset._id} value={asset._id}>
                            {asset.resourceName}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {/* Rest of risk information fields */}
              {/* Risk Assessment section */}
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  การประเมินความเสี่ยง
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>วิธีการคำนวณ</InputLabel>
                  <Select
                    name='calculationMethod'
                    value={riskFormData.calculationMethod}
                    onChange={handleRiskFormChange}
                    label='วิธีการคำนวณ'
                    disabled={['Internal Factor', 'External Factor', 'Other'].includes(riskFormData.riskType)}
                  >
                    {calculationMethods.map(method => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Risk Assessment sliders */}
              {['Internal Factor', 'External Factor', 'Other'].includes(riskFormData.riskType) ? (
                <Grid item xs={12}>
                  <FormControl fullWidth margin='normal'>
                    <FormLabel>ระดับผลกระทบ (Impact)</FormLabel>
                    <Slider
                      name='impactLevel'
                      value={riskFormData.impactLevel}
                      onChange={handleSliderChange('impactLevel')}
                      step={1}
                      marks
                      min={1}
                      max={riskAssessment?.impactLevels?.length || 5}
                      valueLabelDisplay='auto'
                    />
                    <Typography variant='caption' color='text.secondary'>
                      {riskAssessment?.impactLevels?.find(l => l.level === riskFormData.impactLevel)?.name ||
                        `ระดับ ${riskFormData.impactLevel}`}
                    </Typography>
                  </FormControl>
                </Grid>
              ) : (
                <>{/* CIA sliders */}</>
              )}
              {/* Risk Calculation Preview */}
              <Grid item xs={12}>
                <Box
                  sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}
                >
                  <Typography variant='subtitle2' gutterBottom>
                    ผลการคำนวณ
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant='body2'>
                        ระดับผลกระทบรวม: <strong>{calculatedValues.impactScore.toFixed(1)}</strong>
                        {calculatedValues.impactSeverity && ` (${calculatedValues.impactSeverity})`}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant='body2'>
                        ระดับความเสี่ยง: <strong>{calculatedValues.riskLevel.toFixed(1)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant='body2'>
                        <Chip
                          size='small'
                          color={
                            riskFormData.riskThreshold && calculatedValues.riskLevel > riskFormData.riskThreshold.max
                              ? 'error'
                              : 'success'
                          }
                          label={
                            riskFormData.riskThreshold
                              ? `${riskFormData.riskThreshold.name} (${riskFormData.riskThreshold.min}-${riskFormData.riskThreshold.max})`
                              : 'รอการประเมิน'
                          }
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRiskDialog(false)}>ยกเลิก</Button>
            <Button type='submit' variant='contained' startIcon={<SaveIcon />} disabled={!riskFormData.riskThreshold}>
              บันทึก
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Treatment Plan Dialog */}
      <Dialog open={openTreatmentDialog} onClose={() => setOpenTreatmentDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>{isTreatmentEditMode ? 'แก้ไขแผนการจัดการความเสี่ยง' : 'เพิ่มแผนการจัดการความเสี่ยง'}</DialogTitle>
        <form onSubmit={handleSubmitTreatmentPlan}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>วิธีการจัดการความเสี่ยง</InputLabel>
                  <Select
                    name='treatmentOption'
                    value={treatmentFormData.treatmentOption}
                    onChange={handleTreatmentFormChange}
                    label='วิธีการจัดการความเสี่ยง'
                    required
                  >
                    {treatmentOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {treatmentFormData.treatmentOption === 'Other' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin='normal'
                    label='ระบุวิธีการจัดการอื่นๆ'
                    name='otherOption'
                    value={treatmentFormData.otherOption}
                    onChange={handleTreatmentFormChange}
                    required
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin='normal'
                  label='รายละเอียด'
                  name='description'
                  value={treatmentFormData.description}
                  onChange={handleTreatmentFormChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin='normal'
                  label='วันที่เริ่ม'
                  name='startDate'
                  type='date'
                  value={treatmentFormData.startDate}
                  onChange={handleTreatmentFormChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin='normal'
                  label='วันที่สิ้นสุด'
                  name='endDate'
                  type='date'
                  value={treatmentFormData.endDate}
                  onChange={handleTreatmentFormChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin='normal'
                  label='ผู้รับผิดชอบ'
                  name='responsible'
                  value={treatmentFormData.responsible}
                  onChange={handleTreatmentFormChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>สถานะ</InputLabel>
                  <Select
                    name='status'
                    value={treatmentFormData.status}
                    onChange={handleTreatmentFormChange}
                    label='สถานะ'
                    required
                  >
                    {treatmentStatusOptions.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={treatmentFormData.isFinal}
                      onChange={e =>
                        handleTreatmentFormChange({
                          target: { name: 'isFinal', value: e.target.checked }
                        })
                      }
                      name='isFinal'
                    />
                  }
                  label='เป็นแผนจัดการความเสี่ยงสุดท้าย (Final)'
                />
              </Grid>

              {/* Residual Risk Assessment */}
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  การประเมินความเสี่ยงที่เหลืออยู่ (Residual Risk)
                </Typography>
              </Grid>

              {['Internal Factor', 'External Factor', 'Other'].includes(selectedRiskEntry?.riskType) ? (
                <Grid item xs={12}>
                  <FormControl fullWidth margin='normal'>
                    <FormLabel>ระดับผลกระทบ (Impact) ที่เหลืออยู่</FormLabel>
                    <Slider
                      value={Math.round(
                        (treatmentFormData.residualRisk.confidentialityLevel +
                          treatmentFormData.residualRisk.integrityLevel +
                          treatmentFormData.residualRisk.availabilityLevel) /
                          3
                      )}
                      onChange={(event, newValue) => {
                        handleTreatmentFormChange({
                          target: {
                            name: 'residualRisk.confidentialityLevel',
                            value: newValue
                          }
                        })
                        handleTreatmentFormChange({
                          target: {
                            name: 'residualRisk.integrityLevel',
                            value: newValue
                          }
                        })
                        handleTreatmentFormChange({
                          target: {
                            name: 'residualRisk.availabilityLevel',
                            value: newValue
                          }
                        })
                      }}
                      step={1}
                      marks
                      min={1}
                      max={5}
                      valueLabelDisplay='auto'
                    />
                  </FormControl>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin='normal'>
                      <FormLabel>ผลกระทบด้านความลับ (C)</FormLabel>
                      <Slider
                        name='residualRisk.confidentialityLevel'
                        value={treatmentFormData.residualRisk.confidentialityLevel}
                        onChange={handleResidualRiskSliderChange('confidentialityLevel')}
                        step={1}
                        marks
                        min={1}
                        max={riskAssessment?.impactLevels?.length || 5}
                        valueLabelDisplay='auto'
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin='normal'>
                      <FormLabel>ผลกระทบด้านความถูกต้อง (I)</FormLabel>
                      <Slider
                        name='residualRisk.integrityLevel'
                        value={treatmentFormData.residualRisk.integrityLevel}
                        onChange={handleResidualRiskSliderChange('integrityLevel')}
                        step={1}
                        marks
                        min={1}
                        max={riskAssessment?.impactLevels?.length || 5}
                        valueLabelDisplay='auto'
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin='normal'>
                      <FormLabel>ผลกระทบด้านความพร้อมใช้ (A)</FormLabel>
                      <Slider
                        name='residualRisk.availabilityLevel'
                        value={treatmentFormData.residualRisk.availabilityLevel}
                        onChange={handleResidualRiskSliderChange('availabilityLevel')}
                        step={1}
                        marks
                        min={1}
                        max={riskAssessment?.impactLevels?.length || 5}
                        valueLabelDisplay='auto'
                      />
                    </FormControl>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth margin='normal'>
                  <FormLabel>ความน่าจะเป็น (Likelihood) ที่เหลืออยู่</FormLabel>
                  <Slider
                    name='residualRisk.likelihoodLevel'
                    value={treatmentFormData.residualRisk.likelihoodLevel}
                    onChange={handleResidualRiskSliderChange('likelihoodLevel')}
                    step={1}
                    marks
                    min={1}
                    max={riskAssessment?.likelihoodLevels?.length || 5}
                    valueLabelDisplay='auto'
                  />
                </FormControl>
              </Grid>

              {/* Residual Risk Calculation Preview */}
              <Grid item xs={12}>
                <Box
                  sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}
                >
                  <Typography variant='subtitle2' gutterBottom>
                    ผลการคำนวณความเสี่ยงที่เหลืออยู่
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant='body2'>
                        ผลกระทบรวม: <strong>{treatmentFormData.residualRisk.calculatedImpact.toFixed(1)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant='body2'>
                        ระดับความเสี่ยง: <strong>{treatmentFormData.residualRisk.riskLevel.toFixed(1)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant='body2'>
                        <Chip
                          size='small'
                          color={treatmentFormData.residualRisk.isAcceptable ? 'success' : 'error'}
                          label={
                            treatmentFormData.residualRisk.isAcceptable
                              ? 'อยู่ในระดับที่ยอมรับได้'
                              : 'เกินระดับที่ยอมรับได้'
                          }
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTreatmentDialog(false)}>ยกเลิก</Button>
            <Button type='submit' variant='contained' startIcon={<SaveIcon />}>
              บันทึก
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
