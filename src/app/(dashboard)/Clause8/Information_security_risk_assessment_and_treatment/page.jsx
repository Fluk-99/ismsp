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
  Snackbar,
  Autocomplete
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

// Define constants
const riskTypes = [
  { value: 'Personnel', label: 'บุคลากร' },
  { value: 'Budget', label: 'เงินทุน' },
  { value: 'Information System', label: 'ระบบสารสนเทศ' },
  { value: 'Hardware', label: 'ฮาร์ดแวร์' },
  { value: 'Data', label: 'ข้อมูล' },
  { value: 'Service', label: 'บริการ' },
  { value: 'Internal Factor', label: 'ปัจจัยภายใน' },
  { value: 'External Factor', label: 'ปัจจัยภายนอก' },
  { value: 'Other', label: 'อื่นๆ' }
]

const treatmentOptions = [
  { value: 'Accept', label: 'ยอมรับความเสี่ยง (Accept)' },
  { value: 'Reduce', label: 'ลดความเสี่ยง (Reduce)' },
  { value: 'Transfer', label: 'ถ่ายโอนความเสี่ยง (Transfer)' },
  { value: 'Avoid', label: 'หลีกเลี่ยงความเสี่ยง (Avoid)' },
  { value: 'Other', label: 'อื่นๆ (Other)' }
]

const treatmentStatusOptions = [
  { value: 'Planned', label: 'วางแผนแล้ว' },
  { value: 'In Progress', label: 'กำลังดำเนินการ' },
  { value: 'Completed', label: 'เสร็จสิ้นแล้ว' },
  { value: 'Cancelled', label: 'ยกเลิก' }
]

const calculationMethods = [
  { value: 'addition', label: 'การบวก (Impact + Likelihood)' },
  { value: 'multiplication', label: 'การคูณ (Impact × Likelihood)' }
]

export default function RiskAssessmentAndTreatment() {
  // State for risk entries list and filtering
  const [riskEntries, setRiskEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRiskType, setFilterRiskType] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState({
    entries: false,
    assets: false,
    assessment: false,
    submitting: false
  })
  const [error, setError] = useState(null)
  const [assets, setAssets] = useState([])

  // State for risk criteria and assessment
  const [riskCriteria, setRiskCriteria] = useState(null)
  const [riskAssessment, setRiskAssessment] = useState(null)

  // State for risk entry form
  const [openRiskDialog, setOpenRiskDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedRiskEntry, setSelectedRiskEntry] = useState(null)
  const [riskFormData, setRiskFormData] = useState({
    riskType: '',
    assetId: '',
    assetName: '',
    riskIssue: '',
    threat: '',
    vulnerability: '',
    existingControls: '',
    newControl: '',
    // กำหนดค่าเริ่มต้นสำหรับระดับความเสี่ยง
    confidentialityLevel: 1,
    integrityLevel: 1,
    availabilityLevel: 1,
    impactLevel: 1,
    likelihoodLevel: 1, // กำหนดค่าเริ่มต้นเป็น 1
    calculationMethod: 'addition',
    riskThreshold: null
  })

  // State for calculation preview
  const [calculatedValues, setCalculatedValues] = useState({
    impactScore: 0,
    riskLevel: 0,
    exceedsThreshold: false,
    impactSeverity: ''
  })

  // State for risk treatment plan
  const [openTreatmentDialog, setOpenTreatmentDialog] = useState(false)
  const [selectedTreatmentPlan, setSelectedTreatmentPlan] = useState(null)
  const [isTreatmentEditMode, setIsTreatmentEditMode] = useState(false)
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
      likelihoodLevel: 1, // กำหนดค่าเริ่มต้นเป็น 1
      calculatedImpact: 0,
      riskLevel: 0,
      isAcceptable: false
    },
    status: 'Planned',
    isFinal: false
  })

  // State for feedback messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // เพิ่ม state สำหรับวิธีการคำนวณแยกกัน
  const [ciaCalculationMethod, setCIACalculationMethod] = useState('multiplication')
  const [riskCalculationMethod, setRiskCalculationMethod] = useState('multiplication')

  // แยก state สำหรับ CIA calculation
  const [assetCIAValues, setAssetCIAValues] = useState({
    confidentialityLevel: 1,
    integrityLevel: 1,
    availabilityLevel: 1,
    isCriticalAsset: false
  })

  // Fetch risk entries and assets when component mounts
  useEffect(() => {
    fetchRiskEntries()
    fetchAssets()
    fetchRiskCriteria()
    fetchRiskAssessment()
  }, [])

  // คำนวณความเสี่ยงเมื่อค่าใน form เปลี่ยน
  useEffect(() => {
    if (!riskFormData || !riskAssessment) return

    const { impactLevel, likelihoodLevel } = riskFormData

    // คำนวณ risk level ตามวิธีที่เลือก
    const riskLevel =
      riskCalculationMethod === 'multiplication' ? impactLevel * likelihoodLevel : impactLevel + likelihoodLevel

    // เช็ค threshold
    const exceedsThreshold = riskLevel > (riskAssessment.acceptableRiskThreshold || 0)

    setCalculatedValues({
      riskLevel,
      exceedsThreshold
    })
  }, [
    riskFormData.impactLevel,
    riskFormData.likelihoodLevel,
    riskCalculationMethod,
    riskAssessment?.acceptableRiskThreshold
  ])

  useEffect(() => {
    if (!treatmentFormData || !selectedRiskEntry) return

    const { confidentialityLevel, integrityLevel, availabilityLevel, likelihoodLevel } = treatmentFormData.residualRisk
    const calculationMethod = selectedRiskEntry.calculationMethod || 'addition'
    const acceptableRiskThreshold = selectedRiskEntry.acceptableRiskThreshold || 5

    // คำนวณผลกระทบด้วยวิธีเดียวกับความเสี่ยงต้นทาง
    let calculatedImpact = 0

    // สำหรับความเสี่ยงประเภทพิเศษ
    const specialRiskTypes = ['Internal Factor', 'External Factor', 'Other']
    const isSpecialRiskType = specialRiskTypes.includes(selectedRiskEntry.riskType)

    if (isSpecialRiskType && treatmentFormData.residualRisk.impactLevel) {
      calculatedImpact = treatmentFormData.residualRisk.impactLevel
    } else {
      if (calculationMethod === 'addition') {
        calculatedImpact = (confidentialityLevel || 0) + (integrityLevel || 0) + (availabilityLevel || 0)
      } else {
        calculatedImpact = (confidentialityLevel || 1) * (integrityLevel || 1) * (availabilityLevel || 1)
      }
    }

    // คำนวณระดับความเสี่ยง
    const riskLevel = calculatedImpact * (likelihoodLevel || 1)

    // ตรวจสอบว่าอยู่ในเกณฑ์ที่ยอมรับได้หรือไม่
    const isAcceptable = riskLevel <= acceptableRiskThreshold

    // อัปเดตข้อมูลฟอร์มด้วยค่าที่คำนวณได้
    setTreatmentFormData(prev => ({
      ...prev,
      residualRisk: {
        ...prev.residualRisk,
        calculatedImpact,
        riskLevel,
        isAcceptable
      }
    }))
  }, [treatmentFormData.residualRisk, selectedRiskEntry])

  // Filter risk entries when tab changes or search term changes
  useEffect(() => {
    filterRiskEntries()
  }, [riskEntries, tabValue, searchTerm, filterRiskType])

  // Fetch risk entries from API
  const fetchRiskEntries = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/8OPER/risk-entry')

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลรายการความเสี่ยงได้')
      }

      const data = await response.json()
      setRiskEntries(data.data || [])
    } catch (error) {
      console.error('Error fetching risk entries:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/7SUPP/resource/files')

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลสินทรัพย์ได้')
      }

      const data = await response.json()
      console.log('Asset data:', data) // Log asset data to check structure

      const formattedAssets = data.data.map(asset => ({
        _id: asset._id,
        resourceName: asset.resourceName,
        category: asset.category || asset.resourceType // ใช้ category หรือ resourceType
      }))

      setAssets(data.data || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
      // Not setting error here to avoid blocking the UI
    }
  }

  // Fetch risk criteria from API
  const fetchRiskCriteria = async () => {
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/6PLAN/risk-criteria')
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลเกณฑ์ความเสี่ยงได้')
      }
      const data = await response.json()
      console.log('Risk criteria data:', data)
      // ใช้ค่าแรกหรือค่าล่าสุด ขึ้นอยู่กับว่าคุณต้องการใช้ค่าไหน
      setRiskCriteria(data.data[0] || null)
    } catch (error) {
      console.error('Error fetching risk criteria:', error)
    }
  }

  // Fetch risk assessment from API
  const fetchRiskAssessment = async () => {
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/6PLAN/risk-assessment')
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลการประเมินความเสี่ยงได้')
      }
      const data = await response.json()
      console.log('Risk assessment data:', data)
      // ใช้ค่าแรกหรือค่าล่าสุด ขึ้นอยู่กับว่าคุณต้องการใช้ค่าไหน
      setRiskAssessment(data.data[0] || null)
    } catch (error) {
      console.error('Error fetching risk assessment:', error)
    }
  }

  // Filter risk entries based on tab, search term, and asset type
  const filterRiskEntries = () => {
    let filtered = [...riskEntries]

    // Filter by tab value
    switch (tabValue) {
      case 1: // High risks
        filtered = filtered.filter(entry => entry.exceedsThreshold)
        break
      case 2: // Completed
        filtered = filtered.filter(entry => entry.isCompleted)
        break
      case 3: // Unmitigated high risks
        filtered = filtered.filter(entry => entry.exceedsThreshold && !entry.isCompleted)
        break
      default:
        // No filter for "All" tab
        break
    }

    // Filter by risk type if selected
    if (filterRiskType) {
      filtered = filtered.filter(entry => entry.riskType === filterRiskType)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        entry =>
          entry.riskIssue.toLowerCase().includes(term) ||
          entry.assetName.toLowerCase().includes(term) ||
          entry.threat.toLowerCase().includes(term)
      )
    }

    setFilteredEntries(filtered)
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Handle risk type filter change
  const handleRiskTypeFilter = riskType => {
    setFilterRiskType(riskType)
  }

  // Handle risk entry form input change
  const handleRiskFormChange = e => {
    const { name, value } = e.target

    // ถ้ากำลังเปลี่ยนประเภทความเสี่ยงเป็นประเภทพิเศษ ให้ล้างข้อมูลสินทรัพย์
    if (name === 'riskType') {
      const specialRiskTypes = ['Internal Factor', 'External Factor', 'Other']
      const isSpecialRiskType = specialRiskTypes.includes(value)

      if (isSpecialRiskType) {
        setRiskFormData(prev => ({
          ...prev,
          [name]: value,
          assetId: null,
          assetName: ''
        }))
        return
      }
    }

    setRiskFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // ถ้าเลือกสินทรัพย์ ให้อัปเดตชื่อสินทรัพย์
    if (name === 'assetId') {
      const selectedAsset = assets.find(asset => asset._id === value)
      if (selectedAsset) {
        setRiskFormData(prev => ({
          ...prev,
          assetName: selectedAsset.resourceName
        }))
      }
    }
  }

  // Handle slider change in risk form
  const handleSliderChange = name => (event, newValue) => {
    setRiskFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
  }

  // Handle treatment form input change
  const handleTreatmentFormChange = e => {
    const { name, value } = e.target

    if (name.startsWith('residualRisk.')) {
      const field = name.split('.')[1]
      setTreatmentFormData(prev => ({
        ...prev,
        residualRisk: {
          ...prev.residualRisk,
          [field]: value
        }
      }))
    } else {
      setTreatmentFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Handle slider change in treatment form
  const handleResidualRiskSliderChange = name => (event, newValue) => {
    setTreatmentFormData(prev => ({
      ...prev,
      residualRisk: {
        ...prev.residualRisk,
        [name]: newValue
      }
    }))
  }

  const validateForm = data => {
    const errors = {}
    const isSpecialType = ['Internal Factor', 'External Factor', 'Other'].includes(data.riskType)

    // Basic validation
    if (!data.riskType) errors.riskType = 'กรุณาระบุประเภทความเสี่ยง'
    if (!data.riskIssue) errors.riskIssue = 'กรุณาระบุประเด็นความเสี่ยง'
    if (!data.threat) errors.threat = 'กรุณาระบุภัยคุกคาม'
    if (!data.vulnerability) errors.vulnerability = 'กรุณาระบุจุดอ่อน'

    // Asset validation for non-special types
    if (!isSpecialType && (!data.assetId || !data.assetName)) {
      errors.asset = 'กรุณาเลือกสินทรัพย์'
    }

    // Risk assessment validation
    if (isSpecialType) {
      if (!data.impactLevel) errors.impact = 'กรุณาระบุระดับผลกระทบ'
    } else {
      if (!data.confidentialityLevel || !data.integrityLevel || !data.availabilityLevel) {
        errors.cia = 'กรุณาระบุระดับผลกระทบให้ครบทุกด้าน'
      }
    }

    // Likelihood validation - เพิ่มการ validate
    if (!data.likelihoodLevel) {
      errors.likelihood = 'กรุณาระบุระดับโอกาสเกิด'
    } else if (data.likelihoodLevel < 1) {
      errors.likelihood = 'ระดับโอกาสเกิดต้องมีค่าอย่างน้อย 1'
    }

    return Object.keys(errors).length > 0 ? errors : null
  }

  const validateTreatmentPlan = data => {
    const errors = {}

    if (!data.treatmentOption) errors.treatmentOption = 'กรุณาเลือกวิธีการจัดการ'
    if (data.treatmentOption === 'Other' && !data.otherOption) {
      errors.otherOption = 'กรุณาระบุวิธีการจัดการอื่นๆ'
    }
    if (!data.description) errors.description = 'กรุณาระบุรายละเอียด'
    if (!data.startDate) errors.startDate = 'กรุณาระบุวันที่เริ่ม'
    if (!data.endDate) errors.endDate = 'กรุณาระบุวันที่สิ้นสุด'
    if (!data.responsible) errors.responsible = 'กรุณาระบุผู้รับผิดชอบ'

    // Validate residual risk
    if (!data.residualRisk.confidentialityLevel) errors['residualRisk.confidentialityLevel'] = 'กรุณาระบุระดับความลับ'
    if (!data.residualRisk.integrityLevel) errors['residualRisk.integrityLevel'] = 'กรุณาระบุระดับความถูกต้อง'
    if (!data.residualRisk.availabilityLevel) errors['residualRisk.availabilityLevel'] = 'กรุณาระบุระดับความพร้อมใช้'
    if (!data.residualRisk.likelihoodLevel) errors['residualRisk.likelihoodLevel'] = 'กรุณาระบุระดับโอกาสเกิด'

    return Object.keys(errors).length > 0 ? errors : null
  }
  // Improved error handling
  const handleError = error => {
    console.error('Error:', error)
    let message = 'เกิดข้อผิดพลาด'

    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }

    setSnackbar({
      open: true,
      message,
      severity: 'error'
    })
  }

  // Open risk entry form dialog
  const handleAddRiskEntry = () => {
    // Default impact level from risk assessment if available
    const defaultImpactLevel =
      riskAssessment?.impactLevels?.length > 0 ? Math.ceil(riskAssessment.impactLevels.length / 2) : 5

    if (!riskAssessment?.acceptableRiskThreshold) {
      setSnackbar({
        open: true,
        message: 'กรุณากำหนดค่าระดับความเสี่ยงที่ยอมรับได้ใน Risk Assessment ก่อน',
        severity: 'error'
      })
      return
    }

    setRiskFormData({
      riskType: '',
      assetId: null,
      assetName: '',
      riskIssue: '',
      threat: '',
      vulnerability: '',
      existingControls: '',
      newControl: '',
      // CIA fields
      confidentialityLevel:
        riskCriteria?.confidentialityLevels?.length > 0 ? Math.ceil(riskCriteria.confidentialityLevels.length / 2) : 3,
      integrityLevel:
        riskCriteria?.integrityLevels?.length > 0 ? Math.ceil(riskCriteria.integrityLevels.length / 2) : 3,
      availabilityLevel:
        riskCriteria?.availabilityLevels?.length > 0 ? Math.ceil(riskCriteria.availabilityLevels.length / 2) : 3,
      // Direct impact field for special risk types
      impactLevel: defaultImpactLevel,
      // Likelihood and other fields
      likelihoodLevel:
        riskAssessment?.likelihoodLevels?.length > 0 ? Math.ceil(riskAssessment.likelihoodLevels.length / 2) : 3,
      calculationMethod: riskCriteria?.calculationMethod || 'addition',
      acceptableRiskThreshold: riskAssessment.acceptableRiskThreshold // ใช้ค่าจาก riskAssessment เท่านั้น
    })
    setIsEditMode(false)
    setOpenRiskDialog(true)
  }

  // Open risk entry form dialog in edit mode
  const handleEditRiskEntry = entry => {
    setSelectedRiskEntry(entry)

    // Create base form data
    const formData = {
      riskType: entry.riskType,
      riskIssue: entry.riskIssue,
      threat: entry.threat,
      vulnerability: entry.vulnerability,
      existingControls: entry.existingControls || '',
      newControl: entry.newControl || '',
      confidentialityLevel: entry.confidentialityLevel,
      integrityLevel: entry.integrityLevel,
      availabilityLevel: entry.availabilityLevel,
      // Add direct impact level - if not in entry, derive from impactScore
      impactLevel: entry.impactLevel || entry.impactScore || 5,
      likelihoodLevel: entry.likelihoodLevel,
      calculationMethod: entry.calculationMethod,
      acceptableRiskThreshold: entry.acceptableRiskThreshold
    }

    // Special risk types don't require asset information
    const specialRiskTypes = ['Internal Factor', 'External Factor', 'Other']
    const isSpecialRiskType = specialRiskTypes.includes(entry.riskType)

    // Only include asset information if it exists and it's not a special risk type
    if (!isSpecialRiskType && entry.assetId) {
      formData.assetId = entry.assetId._id || entry.assetId
      formData.assetName = entry.assetName || ''
    } else {
      // Initialize with empty values for special risk types
      formData.assetId = null
      formData.assetName = ''
    }

    setRiskFormData(formData)
    setIsEditMode(true)
    setOpenRiskDialog(true)
  }

  // View risk entry details
  const handleViewRiskEntry = entry => {
    setSelectedRiskEntry(entry)
  }

  // Load selected asset's CIA levels
  const fetchAssetDetails = async assetId => {
    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/7SUPP/resource/files/${assetId}`)
      const data = await response.json()

      if (data.success) {
        setAssetCIAValues({
          confidentialityLevel: data.data.confidentialityLevel,
          integrityLevel: data.data.integrityLevel,
          availabilityLevel: data.data.availabilityLevel,
          isCriticalAsset: data.data.isCriticalAsset
        })

        setRiskFormData(prev => ({
          ...prev,
          assetId: data.data._id,
          assetName: data.data.resourceName
        }))
      }
    } catch (error) {
      console.error('Error fetching asset details:', error)
    }
  }

  const handleAssetChange = async (event, newValue) => {
    if (newValue) {
      const selectedAsset = assets.find(asset => asset._id === newValue._id)

      if (selectedAsset) {
        // อัพเดท form data
        setRiskFormData(prev => ({
          ...prev,
          assetId: selectedAsset._id,
          assetName: selectedAsset.resourceName
        }))

        // อัพเดตค่า CIA จาก asset โดยตรง
        setAssetCIAValues({
          confidentialityLevel: selectedAsset.confidentialityLevel || 1,
          integrityLevel: selectedAsset.integrityLevel || 1,
          availabilityLevel: selectedAsset.availabilityLevel || 1,
          isCriticalAsset: selectedAsset.isCriticalAsset
        })

        console.log('Selected Asset:', selectedAsset)
        console.log('CIA Score:', ciaScore)
        console.log('Critical Asset Threshold:', riskCriteria?.criticalAssetThreshold)
        console.log('Is Critical:', isCritical)
      }
    } else {
      // Reset values
      setRiskFormData(prev => ({
        ...prev,
        assetId: null,
        assetName: ''
      }))

      setAssetCIAValues({
        confidentialityLevel: 1,
        integrityLevel: 1,
        availabilityLevel: 1,
        isCriticalAsset: false
      })
    }
  }

  // Submit risk entry form
  const handleSubmitRiskEntry = async e => {
    e.preventDefault()

    // Validate form first
    const errors = validateForm(riskFormData)
    if (errors) {
      setSnackbar({
        open: true,
        message: Object.values(errors)[0],
        severity: 'error'
      })
      return
    }

    try {
      setLoading(prev => ({ ...prev, submitting: true }))

      if (!riskFormData.riskType || !riskFormData.riskIssue) {
        throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน')
      }

      const payload = {
        riskType: riskFormData.riskType,
        riskIssue: riskFormData.riskIssue,
        threat: riskFormData.threat,
        vulnerability: riskFormData.vulnerability,
        existingControls: riskFormData.existingControls || '',
        newControl: riskFormData.newControl || '',
        impactLevel: riskFormData.impactLevel,
        likelihoodLevel: riskFormData.likelihoodLevel,
        riskLevel: calculatedValues.riskLevel,
        exceedsThreshold: calculatedValues.exceedsThreshold,
        calculationMethod: riskCalculationMethod
      }

      // Only include asset info for non-special types
      if (!['Internal Factor', 'External Factor', 'Other'].includes(riskFormData.riskType)) {
        payload.assetId = riskFormData.assetId
        payload.assetName = riskFormData.assetName
      }

      console.log('Sending payload:', payload) // Log for debugging

      let response
      if (isEditMode) {
        response = await fetch(`https://ismsp-backend.onrender.com/api/8OPER/risk-entry/${selectedRiskEntry._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('https://ismsp-backend.onrender.com/api/8OPER/risk-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'การบันทึกข้อมูลไม่สำเร็จ')
      }

      const data = await response.json()

      await fetchRiskEntries() // รอให้ fetch ข้อมูลใหม่เสร็จก่อน

      if (isEditMode) {
        setSelectedRiskEntry(data.data)
      }

      setOpenRiskDialog(false)
      setSnackbar({
        open: true,
        message: `${isEditMode ? 'แก้ไข' : 'เพิ่ม'}รายการความเสี่ยงสำเร็จ`,
        severity: 'success'
      })
    } catch (error) {
      console.error('Submit error:', error)
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      })
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }

  // Delete risk entry
  const handleDeleteRiskEntry = async id => {
    if (!window.confirm('คุณต้องการลบรายการประเมินความเสี่ยงนี้ใช่หรือไม่?')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`https://ismsp-backend.onrender.com/api/8OPER/risk-entry/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'การลบรายการไม่สำเร็จ')
      }

      // If we were viewing the deleted entry, clear it
      if (selectedRiskEntry && selectedRiskEntry._id === id) {
        setSelectedRiskEntry(null)
      }

      // Refresh risk entries list
      fetchRiskEntries()

      // Show success message
      setSnackbar({
        open: true,
        message: 'ลบรายการประเมินความเสี่ยงสำเร็จ',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error deleting risk entry:', error)
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Open treatment plan form dialog
  const handleAddTreatmentPlan = () => {
    if (!selectedRiskEntry) return

    setTreatmentFormData({
      treatmentOption: 'Reduce',
      otherOption: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
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
    setIsTreatmentEditMode(false)
    setOpenTreatmentDialog(true)

    // Initialize residual risk with current levels
    setTimeout(() => {
      setTreatmentFormData(prev => ({
        ...prev,
        residualRisk: {
          ...prev.residualRisk,
          confidentialityLevel: selectedRiskEntry.confidentialityLevel,
          integrityLevel: selectedRiskEntry.integrityLevel,
          availabilityLevel: selectedRiskEntry.availabilityLevel,
          likelihoodLevel: selectedRiskEntry.likelihoodLevel
        }
      }))
    }, 0)
  }

  // Open treatment plan form dialog in edit mode
  const handleEditTreatmentPlan = plan => {
    if (!selectedRiskEntry) return

    setSelectedTreatmentPlan(plan)
    setTreatmentFormData({
      treatmentOption: plan.treatmentOption,
      otherOption: plan.otherOption || '',
      description: plan.description,
      startDate: new Date(plan.startDate).toISOString().split('T')[0],
      endDate: new Date(plan.endDate).toISOString().split('T')[0],
      responsible: plan.responsible,
      residualRisk: {
        confidentialityLevel: plan.residualRisk.confidentialityLevel,
        integrityLevel: plan.integrityLevel,
        availabilityLevel: plan.availabilityLevel,
        likelihoodLevel: plan.residualRisk.likelihoodLevel || selectedRiskEntry.likelihoodLevel,
        calculatedImpact: plan.residualRisk.calculatedImpact,
        riskLevel: plan.residualRisk.riskLevel,
        isAcceptable: plan.residualRisk.isAcceptable
      },
      status: plan.status,
      isFinal: plan.isFinal
    })
    setIsTreatmentEditMode(true)
    setOpenTreatmentDialog(true)
  }

  // Submit treatment plan form
  const handleSubmitTreatmentPlan = async e => {
    e.preventDefault()

    const errors = validateTreatmentPlan(treatmentFormData)
    if (errors) {
      setSnackbar({
        open: true,
        message: Object.values(errors)[0],
        severity: 'error'
      })
      return
    }

    setLoading(prev => ({ ...prev, submitting: true }))

    try {
      const url = isTreatmentEditMode
        ? `https://ismsp-backend.onrender.com/api/8OPER/risk-entry/${selectedRiskEntry._id}/treatment-plans/${selectedTreatmentPlan._id}`
        : `https://ismsp-backend.onrender.com/api/8OPER/risk-entry/${selectedRiskEntry._id}/treatment-plans`

      const response = await fetch(url, {
        method: isTreatmentEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentFormData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      const data = await response.json()
      setSelectedRiskEntry(data.data)
      await fetchRiskEntries()

      setOpenTreatmentDialog(false)
      setSnackbar({
        open: true,
        message: `${isTreatmentEditMode ? 'อัปเดต' : 'เพิ่ม'}แผนจัดการความเสี่ยงสำเร็จ`,
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      })
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }
  // Delete treatment plan
  const handleDeleteTreatmentPlan = async planId => {
    if (!selectedRiskEntry) return

    if (!window.confirm('คุณต้องการลบแผนการจัดการความเสี่ยงนี้ใช่หรือไม่?')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `https://ismsp-backend.onrender.com/api/8OPER/risk-entry/${selectedRiskEntry._id}/treatment-plans/${planId}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'การลบแผนการจัดการไม่สำเร็จ')
      }

      const data = await response.json()

      // Update the selected risk entry
      setSelectedRiskEntry(data.data)

      // Refresh risk entries list
      fetchRiskEntries()

      // Show success message
      setSnackbar({
        open: true,
        message: 'ลบแผนการจัดการความเสี่ยงสำเร็จ',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error deleting treatment plan:', error)
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Get risk level color
  const getRiskLevelColor = riskLevel => {
    const threshold = riskFormData.acceptableRiskThreshold || 15
    if (riskLevel > threshold * 1.5) return 'error'
    if (riskLevel > threshold) return 'warning'
    return 'success'
  }

  // Get impact level text
  const getImpactLevelText = (type, level) => {
    if (!riskCriteria) return `ระดับ ${level}`

    let levelTextMap = []

    switch (type) {
      case 'C':
        levelTextMap = riskCriteria.confidentialityLevels || []
        break
      case 'I':
        levelTextMap = riskCriteria.integrityLevels || []
        break
      case 'A':
        levelTextMap = riskCriteria.availabilityLevels || []
        break
      default:
        return `ระดับ ${level}`
    }

    const levelText = levelTextMap.find(item => item.level === level)
    return levelText ? `${level} - ${levelText.description}` : `ระดับ ${level}`
  }

  // Get likelihood level text
  const getLikelihoodLevelText = level => {
    if (!riskAssessment?.likelihoodLevels) return `ระดับ ${level}`

    const levelText = riskAssessment.likelihoodLevels.find(item => item.level === level)
    return levelText ? `${level} - ${levelText.description}` : `ระดับ ${level}`
  }

  // Format date
  const formatDate = dateString => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Render loading indicator
  if (loading && !riskEntries.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Get maximum levels from criteria
  const getMaxLevels = () => {
    const result = {
      confidentiality: 5,
      integrity: 5,
      availability: 5,
      likelihood: 5
    }

    if (riskCriteria) {
      result.confidentiality = riskCriteria.confidentialityLevels?.length || 5
      result.integrity = riskCriteria.integrityLevels?.length || 5
      result.availability = riskCriteria.availabilityLevels?.length || 5
    }

    if (riskAssessment) {
      result.likelihood = riskAssessment.likelihoodLevels?.length || 5
    }

    return result
  }

  const maxLevels = getMaxLevels()

  return (
    <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
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
              {/* Search bar */}
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

              {/* Add risk entry button */}
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddIcon />}
                onClick={handleAddRiskEntry}
                sx={{ whiteSpace: 'nowrap' }}
              >
                เพิ่มรายการ
              </Button>

              {/* Refresh button */}
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
                      <React.Fragment key={`risk-entry-${entry._id}`}>
                        <ListItem
                          onClick={() => handleViewRiskEntry(entry)}
                          selected={selectedRiskEntry && selectedRiskEntry._id === entry._id}
                          sx={{ cursor: 'pointer' }}
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
                                  label={`${entry.riskLevel?.toFixed(1)}`}
                                />
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
                          <Box>
                            <IconButton
                              onClick={e => {
                                e.stopPropagation() // ป้องกันการ trigger onClick ของ ListItem
                                handleEditRiskEntry(entry)
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={e => {
                                e.stopPropagation() // ป้องกันการ trigger onClick ของ ListItem
                                handleDeleteRiskEntry(entry._id)
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
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
                        ประเภท:{' '}
                        {riskTypes.find(t => t.value === selectedRiskEntry.riskType)?.label ||
                          selectedRiskEntry.riskType}
                      </Typography>

                      {/* Only show asset name if it exists */}
                      {selectedRiskEntry.assetName && (
                        <Typography variant='subtitle2' color='text.secondary'>
                          สินทรัพย์: {selectedRiskEntry.assetName}
                        </Typography>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle1'>ภัยคุกคาม</Typography>
                        <Typography variant='body2' sx={{ mb: 1 }}>
                          {selectedRiskEntry.threat || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle1'>จุดอ่อน</Typography>
                        <Typography variant='body2' sx={{ mb: 1 }}>
                          {selectedRiskEntry.vulnerability || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant='subtitle1'>การควบคุมที่มีอยู่</Typography>
                        <Typography variant='body2' sx={{ mb: 1 }}>
                          {selectedRiskEntry.existingControls || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant='subtitle1'>การควบคุมที่ควรเพิ่ม</Typography>
                        <Typography variant='body2' sx={{ mb: 1 }}>
                          {selectedRiskEntry.newControl || '-'}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Risk assessment scores */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          ความลับ: {getImpactLevelText('C', selectedRiskEntry.confidentialityLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          ความถูกต้อง: {getImpactLevelText('I', selectedRiskEntry.integrityLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          ความพร้อมใช้: {getImpactLevelText('A', selectedRiskEntry.availabilityLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          ความน่าจะเป็น: {getLikelihoodLevelText(selectedRiskEntry.likelihoodLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          ผลกระทบรวม: {selectedRiskEntry.impactLevel?.toFixed(1) || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          วิธีคำนวณ:{' '}
                          {calculationMethods.find(method => method.value === selectedRiskEntry.calculationMethod)
                            ?.label || selectedRiskEntry.calculationMethod}
                        </Typography>
                      </Grid>
                    </Grid>
                    {/* Treatment plans section */}
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant='subtitle1'>แผนการจัดการความเสี่ยง</Typography>
                        <Button size='small' startIcon={<PlaylistAddIcon />} onClick={handleAddTreatmentPlan}>
                          เพิ่มแผน
                        </Button>
                      </Box>

                      {/* Display treatment plans */}
                      {selectedRiskEntry.treatmentPlans && selectedRiskEntry.treatmentPlans.length > 0 ? (
                        <TableContainer component={Paper} sx={{ mb: 2 }}>
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell>วิธีการจัดการ</TableCell>
                                <TableCell>รายละเอียด</TableCell>
                                <TableCell>ระยะเวลา</TableCell>
                                <TableCell>สถานะ</TableCell>
                                <TableCell>การจัดการ</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedRiskEntry.treatmentPlans.map(plan => (
                                <TableRow key={plan._id}>
                                  <TableCell>
                                    {treatmentOptions.find(option => option.value === plan.treatmentOption)?.label ||
                                      plan.treatmentOption}
                                    {plan.isFinal && (
                                      <Chip size='small' color='success' label='แผนสุดท้าย' sx={{ ml: 1 }} />
                                    )}
                                  </TableCell>
                                  <TableCell>{plan.description}</TableCell>
                                  <TableCell>
                                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                                  </TableCell>
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
                                        treatmentStatusOptions.find(status => status.value === plan.status)?.label ||
                                        plan.status
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip title='แก้ไข'>
                                      <IconButton size='small' onClick={() => handleEditTreatmentPlan(plan)}>
                                        <EditIcon fontSize='small' />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title='ลบ'>
                                      <IconButton size='small' onClick={() => handleDeleteTreatmentPlan(plan._id)}>
                                        <DeleteIcon fontSize='small' />
                                      </IconButton>
                                    </Tooltip>
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
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Risk Entry Dialog */}
      <Dialog open={openRiskDialog} onClose={() => setOpenRiskDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>{isEditMode ? 'แก้ไขรายการความเสี่ยง' : 'เพิ่มรายการความเสี่ยง'}</DialogTitle>
        <form onSubmit={handleSubmitRiskEntry}>
          <DialogContent sx={{ pt: 1 }}>
            {' '}
            {/* เพิ่ม padding-top */}
            <Grid container spacing={3}>
              {' '}
              {/* เพิ่ม spacing ระหว่าง Grid items */}
              {/* Asset Information */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
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
              {!['Internal Factor', 'External Factor', 'Other'].includes(riskFormData.riskType) && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Autocomplete
                      id={`asset-select-${riskFormData.riskType}`}
                      value={assets.find(asset => asset._id === riskFormData.assetId) || null}
                      onChange={handleAssetChange}
                      options={assets.filter(asset => asset.category === riskFormData.riskType)}
                      getOptionLabel={option => option.resourceName || ''}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label='เลือกสินทรัพย์'
                          required
                          error={!riskFormData.assetId}
                          helperText={!riskFormData.assetId ? 'กรุณาเลือกสินทรัพย์' : ''}
                        />
                      )}
                      noOptionsText='ไม่พบสินทรัพย์'
                    />
                  </FormControl>
                </Grid>
              )}
              {/* CIA Values Display */}
              {riskFormData.assetId && (
                <Grid item xs={12}>
                  <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='subtitle1' gutterBottom>
                      Asset CIA Levels
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='body2'>Confidentiality: {assetCIAValues.confidentialityLevel}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='body2'>Integrity: {assetCIAValues.integrityLevel}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='body2'>Availability: {assetCIAValues.availabilityLevel}</Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}>
                      {/* ดึงค่า isCriticalAsset จากสินทรัพย์ที่เลือก */}
                      <Chip
                        size='small'
                        color={assetCIAValues.isCriticalAsset ? 'error' : 'default'}
                        label={assetCIAValues.isCriticalAsset ? 'Critical Asset' : 'Non-Critical Asset'}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )}
              {/* Risk Information */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='ประเด็นความเสี่ยง'
                  name='riskIssue'
                  value={riskFormData.riskIssue}
                  onChange={handleRiskFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='ภัยคุกคาม'
                  name='threat'
                  value={riskFormData.threat}
                  onChange={handleRiskFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='จุดอ่อน'
                  name='vulnerability'
                  value={riskFormData.vulnerability}
                  onChange={handleRiskFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='การควบคุมที่มีอยู่'
                  name='existingControls'
                  value={riskFormData.existingControls}
                  onChange={handleRiskFormChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='การควบคุมที่ควรเพิ่ม'
                  name='newControl'
                  value={riskFormData.newControl}
                  onChange={handleRiskFormChange}
                  multiline
                  rows={2}
                />
              </Grid>
              {/* Risk Assessment */}
              <Grid item xs={12}>
                <Typography variant='subtitle1' sx={{ mb: 2 }}>
                  การประเมินความเสี่ยง
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>วิธีการคำนวณความเสี่ยง</InputLabel>
                  <Select
                    value={riskCalculationMethod}
                    onChange={e => setRiskCalculationMethod(e.target.value)}
                    label='วิธีการคำนวณความเสี่ยง'
                  >
                    <MenuItem value='addition'>การบวก (Impact + Likelihood)</MenuItem>
                    <MenuItem value='multiplication'>การคูณ (Impact × Likelihood)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ระดับผลกระทบ (Impact)</InputLabel>
                  <Select
                    value={riskFormData.impactLevel}
                    onChange={e => {
                      setRiskFormData(prev => ({
                        ...prev,
                        impactLevel: e.target.value
                      }))
                    }}
                    label='ระดับผลกระทบ (Impact)'
                  >
                    {riskAssessment?.impactLevels?.map(level => (
                      <MenuItem key={level.level} value={level.level}>
                        {level.level} - {level.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ระดับความน่าจะเป็น (Likelihood)</InputLabel>
                  <Select
                    value={riskFormData.likelihoodLevel}
                    onChange={e => {
                      setRiskFormData(prev => ({
                        ...prev,
                        likelihoodLevel: e.target.value
                      }))
                    }}
                    label='ระดับความน่าจะเป็น (Likelihood)'
                  >
                    {riskAssessment?.likelihoodLevels?.map(level => (
                      <MenuItem key={level.level} value={level.level}>
                        {level.level} - {level.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Risk Calculation Preview */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant='subtitle2' gutterBottom>
                    ผลการประเมิน
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='body2'>
                        ระดับความเสี่ยง: <strong>{calculatedValues.riskLevel?.toFixed(1)}</strong>
                        {calculatedValues.exceedsThreshold && (
                          <Chip size='small' color='error' label='เกินที่ยอมรับได้' sx={{ ml: 1 }} />
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            {' '}
            {/* เพิ่ม padding */}
            <Button onClick={() => setOpenRiskDialog(false)}>ยกเลิก</Button>
            <Button type='submit' variant='contained' startIcon={<SaveIcon />}>
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
              {/* Treatment Plan Information */}
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
                        setTreatmentFormData(prev => ({
                          ...prev,
                          isFinal: e.target.checked
                        }))
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
                // สำหรับ Special Risk Types แสดงเพียง single impact slider
                <Grid item xs={12}>
                  <FormControl fullWidth margin='normal'>
                    <FormLabel>ระดับผลกระทบ (Impact) ที่เหลืออยู่</FormLabel>
                    <Slider
                      name='residualRisk.impactLevel'
                      value={
                        treatmentFormData.residualRisk.impactLevel ||
                        Math.round(
                          treatmentFormData.residualRisk.confidentialityLevel +
                            treatmentFormData.residualRisk.integrityLevel +
                            treatmentFormData.residualRisk.availabilityLevel
                        )
                      }
                      onChange={(event, newValue) => {
                        setTreatmentFormData(prev => ({
                          ...prev,
                          residualRisk: {
                            impactLevel: newValue,
                            // ตั้งค่า CIA ให้เท่ากับค่า impactLevel เพื่อความสะดวกในการคำนวณ
                            confidentialityLevel: newValue,
                            integrityLevel: newValue,
                            availabilityLevel: newValue
                          }
                        }))
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
                  <Grid container spacing={10}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin='normal'>
                        <FormLabel>ระดับผลกระทบด้านความลับ (C) ที่เหลืออยู่</FormLabel>
                        <Slider
                          name='residualRisk.confidentialityLevel'
                          value={treatmentFormData.residualRisk.confidentialityLevel}
                          onChange={handleResidualRiskSliderChange('confidentialityLevel')}
                          step={1}
                          marks
                          min={1}
                          max={maxLevels.confidentiality}
                          valueLabelDisplay='auto'
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={10} sm={6}>
                      <FormControl fullWidth margin='normal'>
                        <FormLabel>ระดับผลกระทบด้านความถูกต้อง (I) ที่เหลืออยู่</FormLabel>
                        <Slider
                          name='residualRisk.integrityLevel'
                          value={treatmentFormData.residualRisk.integrityLevel}
                          onChange={handleResidualRiskSliderChange('integrityLevel')}
                          step={1}
                          marks
                          min={1}
                          max={maxLevels.integrity}
                          valueLabelDisplay='auto'
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={10} sm={6}>
                      <FormControl fullWidth margin='normal'>
                        <FormLabel>ระดับผลกระทบด้านความพร้อมใช้ (A) ที่เหลืออยู่</FormLabel>
                        <Slider
                          name='residualRisk.availabilityLevel'
                          value={treatmentFormData.residualRisk.availabilityLevel}
                          onChange={handleResidualRiskSliderChange('availabilityLevel')}
                          step={1}
                          marks
                          min={1}
                          max={maxLevels.availability}
                          valueLabelDisplay='auto'
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin='normal'>
                        <FormLabel>ระดับความน่าจะเป็น (Likelihood) ที่เหลืออยู่</FormLabel>
                        <Slider
                          name='residualRisk.likelihoodLevel'
                          value={treatmentFormData.residualRisk.likelihoodLevel}
                          onChange={handleResidualRiskSliderChange('likelihoodLevel')}
                          step={1}
                          marks
                          min={1}
                          max={maxLevels.likelihood}
                          valueLabelDisplay='auto'
                        />
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Residual Risk Calculation Preview */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant='subtitle2' gutterBottom>
                        ผลการคำนวณความเสี่ยงที่เหลืออยู่
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant='body2'>
                            ระดับผลกระทบรวมที่เหลืออยู่:{' '}
                            <strong>{treatmentFormData.residualRisk.calculatedImpact.toFixed(1)}</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant='body2'>
                            ระดับความเสี่ยงที่เหลืออยู่:{' '}
                            <strong>{treatmentFormData.residualRisk.riskLevel.toFixed(1)}</strong>
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
                </>
              )}
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

      {/* Snackbar for feedback messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
