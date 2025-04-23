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
    riskAssessmentPlanRef: '',
    contextConsiderations: '',
    treatmentOption: 'Reduce',
    otherOption: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0], // กำหนดค่าเริ่มต้นเป็นวันที่ปัจจุบัน
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // กำหนดค่าเริ่มต้นเป็น 30 วันถัดไป
    responsible: '',
    residualRisk: {
      riskLevel: 1, // กำหนดค่าเริ่มต้น
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
  }, [
    treatmentFormData.residualRisk.confidentialityLevel,
    treatmentFormData.residualRisk.integrityLevel,
    treatmentFormData.residualRisk.availabilityLevel,
    treatmentFormData.residualRisk.likelihoodLevel,
    treatmentFormData.residualRisk.impactLevel,
    selectedRiskEntry
  ])

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
      setFilteredEntries(data.data || [])
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

    // ตรวจสอบค่า treatmentOption
    if (name === 'treatmentOption') {
      // ตรวจสอบว่าค่าอยู่ใน options ที่กำหนดไว้
      const isValidOption = treatmentOptions.some(opt => opt.value === value)
      if (!isValidOption) {
        return // ไม่อัปเดตค่าถ้าไม่ถูกต้อง
      }
    }

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
    setTreatmentFormData(prev => {
      // อัพเดตค่าที่เปลี่ยนแปลง (CIA หรือ Impact/Likelihood)
      const updatedResidualRisk = {
        ...prev.residualRisk,
        [name]: newValue
      }

      // เช็คค่า threshold จาก risk assessment
      const acceptableRiskThreshold =
        selectedRiskEntry?.acceptableRiskThreshold || riskAssessment?.acceptableRiskThreshold || 5

      // เช็คว่าความเสี่ยงที่เหลืออยู่เกินเกณฑ์หรือไม่
      const isAcceptable = updatedResidualRisk.riskLevel <= acceptableRiskThreshold

      return {
        ...prev,
        residualRisk: {
          ...updatedResidualRisk,
          isAcceptable
        }
      }
    })
  }

  const handleResidualRiskLevelChange = event => {
    const newRiskLevel = Number(event.target.value)

    setTreatmentFormData(prev => {
      const acceptableRiskThreshold =
        selectedRiskEntry?.acceptableRiskThreshold || riskAssessment?.acceptableRiskThreshold || 5

      // เปลี่ยนเงื่อนไขการเช็ค
      const isAcceptable = newRiskLevel <= acceptableRiskThreshold

      return {
        ...prev,
        residualRisk: {
          riskLevel: newRiskLevel,
          isAcceptable: isAcceptable
        }
      }
    })
  }

  const validateForm = data => {
    const errors = {}
    const isSpecialType = ['Internal Factor', 'External Factor', 'Other'].includes(data.riskType)

    // Basic validation
    if (!data.riskType) errors.riskType = 'กรุณาระบุประเภทความเสี่ยง'
    if (!data.riskIssue) errors.riskIssue = 'กรุณาระบุประเด็นความเสี่ยง'
    if (!data.threat) errors.threat = 'กรุณาระบุภัยคุกคาม'
    if (!data.vulnerability) errors.vulnerability = 'กรุณาระบุช่องโหว่/จุดอ่อน'

    // Asset validation for non-special types
    if (!isSpecialType && (!data.assetId || !data.assetName)) {
      errors.asset = 'กรุณาเลือกสินทรัพย์'
    }

    // Risk assessment validation
    if (isSpecialType) {
      if (!data.impactLevel) errors.impact = 'กรุณาระบุระดับผลกระทบ'
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
      impactLevel: entry.impactLevel || entry.impactScore || 5,
      likelihoodLevel: entry.likelihoodLevel,
      calculationMethod: entry.calculationMethod,
      acceptableRiskThreshold: entry.acceptableRiskThreshold
    }

    // Special risk types don't require asset information
    const specialRiskTypes = ['Internal Factor', 'External Factor', 'Other']
    const isSpecialRiskType = specialRiskTypes.includes(entry.riskType)

    if (!isSpecialRiskType && entry.assetId) {
      const selectedAsset = assets.find(asset => asset._id === (entry.assetId._id || entry.assetId))

      if (selectedAsset) {
        formData.assetId = selectedAsset._id
        formData.assetName = selectedAsset.resourceName

        // ใช้ค่าจาก backend โดยตรง
        setAssetCIAValues({
          confidentialityLevel: selectedAsset.confidentialityLevel || 1,
          integrityLevel: selectedAsset.integrityLevel || 1,
          availabilityLevel: selectedAsset.availabilityLevel || 1,
          isCriticalAsset: selectedAsset.isCriticalAsset, // ใช้ค่าจาก backend
          ciaScore: selectedAsset.ciaScore // ใช้ค่าจาก backend
        })

        // Debug logs
        console.log('Edit Mode - Selected Asset:', selectedAsset)
        console.log('Edit Mode - CIA Score from backend:', selectedAsset.ciaScore)
        console.log('Edit Mode - Is Critical from backend:', selectedAsset.isCriticalAsset)
      }
    } else {
      formData.assetId = null
      formData.assetName = ''

      setAssetCIAValues({
        confidentialityLevel: 1,
        integrityLevel: 1,
        availabilityLevel: 1,
        isCriticalAsset: false,
        ciaScore: 0
      })
    }

    setRiskFormData(formData)
    setIsEditMode(true)
    setOpenRiskDialog(true)
  }
  // View risk entry details
  const handleViewRiskEntry = entry => {
    setSelectedRiskEntry(entry)
  }

  const handleAssetChange = async (event, newValue) => {
    if (newValue) {
      const selectedAsset = assets.find(asset => asset._id === newValue._id)

      if (selectedAsset) {
        // ใช้ค่า isCriticalAsset จาก backend โดยตรง
        setRiskFormData(prev => ({
          ...prev,
          assetId: selectedAsset._id,
          assetName: selectedAsset.resourceName,
          confidentialityLevel: selectedAsset.confidentialityLevel || 1,
          integrityLevel: selectedAsset.integrityLevel || 1,
          availabilityLevel: selectedAsset.availabilityLevel || 1
        }))

        // อัพเดตค่า CIA จาก asset และใช้ค่า isCriticalAsset จาก backend
        setAssetCIAValues({
          confidentialityLevel: selectedAsset.confidentialityLevel || 1,
          integrityLevel: selectedAsset.integrityLevel || 1,
          availabilityLevel: selectedAsset.availabilityLevel || 1,
          isCriticalAsset: selectedAsset.isCriticalAsset, // ใช้ค่าจาก backend โดยตรง
          ciaScore: selectedAsset.ciaScore // เพิ่ม ciaScore จาก backend
        })

        // Debug logs
        console.log('Selected Asset:', selectedAsset)
        console.log('CIA Score from backend:', selectedAsset.ciaScore)
        console.log('Is Critical from backend:', selectedAsset.isCriticalAsset)
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
        isCriticalAsset: false,
        ciaScore: 0
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
    if (!selectedRiskEntry) {
      setSnackbar({
        open: true,
        message: 'กรุณาเลือกรายการความเสี่ยงก่อน',
        severity: 'error'
      })
      return
    }

    if (!riskAssessment) {
      setSnackbar({
        open: true,
        message: 'ไม่พบข้อมูลเกณฑ์การประเมินความเสี่ยง',
        severity: 'error'
      })
      return
    }

    // Reset form data with proper initial values
    setTreatmentFormData({
      riskAssessmentPlanRef: selectedRiskEntry._id, // อ้างอิงไปยัง risk entry แทน
      contextConsiderations: '',
      treatmentOption: 'Reduce', // ใช้ค่าเริ่มต้นที่ถูกต้อง
      otherOption: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      responsible: '',
      residualRisk: {
        riskLevel: selectedRiskEntry.riskLevel || 1, // ใช้ค่าความเสี่ยงปัจจุบัน
        isAcceptable: false
      },
      status: 'Planned',
      isFinal: false
    })

    setIsTreatmentEditMode(false)
    setOpenTreatmentDialog(true)
  }

  // Open treatment plan form dialog in edit mode
  const handleEditTreatmentPlan = plan => {
    if (!selectedRiskEntry || !riskAssessment) return

    setSelectedTreatmentPlan(plan)

    setTreatmentFormData({
      riskAssessmentPlanRef: plan.riskAssessmentPlanRef || riskAssessment._id,
      contextConsiderations: plan.contextConsiderations,
      treatmentOption: plan.treatmentOption,
      otherOption: plan.otherOption || '',
      description: plan.description,
      startDate: new Date(plan.startDate).toISOString().split('T')[0],
      endDate: new Date(plan.endDate).toISOString().split('T')[0],
      responsible: plan.responsible,
      residualRisk: {
        riskLevel: plan.residualRisk.riskLevel,
        isAcceptable:
          plan.residualRisk.isAcceptable || plan.residualRisk.riskLevel <= riskAssessment.acceptableRiskThreshold
      },
      status: plan.status,
      isFinal: plan.isFinal
    })

    setIsTreatmentEditMode(true)
    setOpenTreatmentDialog(true)
  }

  // Update handleSubmitTreatmentPlan
  const handleSubmitTreatmentPlan = async e => {
    e.preventDefault()

    try {
      // Validate required fields
      const requiredFields = {
        treatmentOption: treatmentFormData.treatmentOption,
        description: treatmentFormData.description,
        startDate: treatmentFormData.startDate,
        endDate: treatmentFormData.endDate,
        responsible: treatmentFormData.responsible,
        residualRisk: {
          riskLevel: treatmentFormData.residualRisk.riskLevel,
          isAcceptable: treatmentFormData.residualRisk.isAcceptable
        }
      }

      // Check if any required field is empty
      const emptyFields = Object.entries(requiredFields).filter(([key, value]) => {
        if (key === 'residualRisk') {
          return !value.riskLevel
        }
        return !value
      })

      if (emptyFields.length > 0) {
        setSnackbar({
          open: true,
          message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          severity: 'error'
        })
        return
      }

      // Validate dates
      const startDate = new Date(treatmentFormData.startDate)
      const endDate = new Date(treatmentFormData.endDate)
      if (endDate <= startDate) {
        setSnackbar({
          open: true,
          message: 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น',
          severity: 'error'
        })
        return
      }

      const payload = {
        treatmentOption: treatmentFormData.treatmentOption,
        otherOption: treatmentFormData.otherOption || '',
        description: treatmentFormData.description,
        startDate: treatmentFormData.startDate,
        endDate: treatmentFormData.endDate,
        responsible: treatmentFormData.responsible,
        contextConsiderations: treatmentFormData.contextConsiderations || '',
        residualRisk: {
          riskLevel: Number(treatmentFormData.residualRisk.riskLevel),
          isAcceptable: Boolean(treatmentFormData.residualRisk.isAcceptable)
        },
        status: treatmentFormData.status || 'Planned',
        isFinal: Boolean(treatmentFormData.isFinal)
      }

      setLoading(prev => ({ ...prev, submitting: true }))

      // Call API endpoint
      const url = isTreatmentEditMode
        ? `https://ismsp-backend.onrender.com/api/8OPER/risk-entry/${selectedRiskEntry._id}/treatment-plans/${selectedTreatmentPlan._id}`
        : `https://ismsp-backend.onrender.com/api/8OPER/risk-entry/${selectedRiskEntry._id}/treatment-plans`

      const response = await fetch(url, {
        method: isTreatmentEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'การบันทึกข้อมูลไม่สำเร็จ')
      }

      const data = await response.json()

      // Update UI
      if (isTreatmentEditMode) {
        setSelectedRiskEntry(prevEntry => ({
          ...prevEntry,
          riskTreatmentPlans: prevEntry.riskTreatmentPlans.map(plan =>
            plan._id === selectedTreatmentPlan._id ? data.data : plan
          )
        }))
      } else {
        setSelectedRiskEntry(data.data)
      }

      setOpenTreatmentDialog(false)
      setSnackbar({
        open: true,
        message: `${isTreatmentEditMode ? 'แก้ไข' : 'เพิ่ม'}แผนการจัดการความเสี่ยงสำเร็จ`,
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
    const threshold = riskAssessment?.acceptableRiskThreshold || 5
    if (riskLevel > threshold) return 'error'
    return 'success'
  }

  // Get impact level text
  const getImpactLevelText = (type, level) => {
    if (!riskCriteria || !level) return '-'

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
        return `ระดับ ${level || '-'}`
    }

    const levelText = levelTextMap.find(item => item.level === Number(level))
    return levelText ? `${level} - ${levelText.description}` : `ระดับ ${level || '-'}`
  }

  // Get likelihood level text
  const getLikelihoodLevelText = level => {
    if (!riskAssessment?.likelihoodLevels || !level) return '-'

    const levelText = riskAssessment.likelihoodLevels.find(item => item.level === Number(level))
    return levelText ? `${level} - ${levelText.description}` : `ระดับ ${level || '-'}`
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
                        <Typography variant='subtitle1'>ช่องโหว่/จุดอ่อน</Typography>
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
                          ความลับ:{' '}
                          {selectedRiskEntry?.assetId
                            ? getImpactLevelText('C', selectedRiskEntry.assetId.confidentialityLevel)
                            : getImpactLevelText('C', selectedRiskEntry?.confidentialityLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          ความถูกต้อง:{' '}
                          {selectedRiskEntry?.assetId
                            ? getImpactLevelText('I', selectedRiskEntry.assetId.integrityLevel)
                            : getImpactLevelText('I', selectedRiskEntry?.integrityLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          ความพร้อมใช้:{' '}
                          {selectedRiskEntry?.assetId
                            ? getImpactLevelText('A', selectedRiskEntry.assetId.availabilityLevel)
                            : getImpactLevelText('A', selectedRiskEntry?.availabilityLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          ความน่าจะเป็น: {getLikelihoodLevelText(selectedRiskEntry?.likelihoodLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          ผลกระทบรวม:{' '}
                          {selectedRiskEntry?.assetId ? selectedRiskEntry.assetId.ciaScore?.toFixed(1) || '-' : '-'}
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
                      {selectedRiskEntry?.riskTreatmentPlans?.length > 0 ? (
                        <TableContainer component={Paper} sx={{ mb: 2 }}>
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell>วิธีการจัดการ</TableCell>
                                <TableCell>รายละเอียด</TableCell>
                                <TableCell>ระยะเวลา</TableCell>
                                <TableCell>ความเสี่ยงที่เหลือ</TableCell>
                                <TableCell>สถานะ</TableCell>
                                <TableCell>การจัดการ</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedRiskEntry.riskTreatmentPlans.map(plan => (
                                <TableRow key={plan._id}>
                                  <TableCell>
                                    {treatmentOptions.find(option => option.value === plan.treatmentOption)?.label ||
                                      plan.treatmentOption}
                                    {plan.treatmentOption === 'Other' && plan.otherOption && (
                                      <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
                                        ({plan.otherOption})
                                      </Typography>
                                    )}
                                    {plan.isFinal && (
                                      <Chip size='small' color='success' label='แผนสุดท้าย' sx={{ ml: 1 }} />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip title={plan.description} arrow>
                                      <Typography
                                        sx={{
                                          maxWidth: 200,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {plan.description}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                                    <Typography variant='caption' display='block' color='textSecondary'>
                                      ผู้รับผิดชอบ: {plan.responsible}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography>{plan.residualRisk.riskLevel.toFixed(1)}</Typography>
                                      <Chip
                                        size='small'
                                        color={plan.residualRisk.isAcceptable ? 'success' : 'error'}
                                        label={plan.residualRisk.isAcceptable ? 'ยอมรับได้' : 'เกินเกณฑ์'}
                                      />
                                    </Box>
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
                      <Grid item xs={12}>
                        <Typography variant='body2'>CIA Score: {assetCIAValues.ciaScore}</Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}>
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
                  label='ช่องโหว่/จุดอ่อน'
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
              {/* เลือกแผนมาตรฐานจาก RiskAssessment */}
              <Grid item xs={12}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>เลือกแผนมาตรฐาน</InputLabel>
                  <Select
                    value={treatmentFormData.riskAssessmentPlanRef || ''} // กำหนดค่าเริ่มต้นเป็นสตริงว่าง
                    onChange={e => {
                      const selectedPlan = riskAssessment?.riskTreatmentPlans.find(plan => plan._id === e.target.value)
                      if (selectedPlan) {
                        const treatmentOption =
                          Object.entries(selectedPlan.riskTreatmentOptions)
                            .find(([_, value]) => value === true)?.[0]
                            ?.replace('Risk', '') || 'Reduce' // กำหนดค่าเริ่มต้นเป็น 'Reduce'

                        setTreatmentFormData(prev => ({
                          ...prev,
                          riskAssessmentPlanRef: e.target.value,
                          contextConsiderations: selectedPlan.contextConsiderations,
                          treatmentOption: treatmentOption
                        }))
                      }
                    }}
                    label='เลือกแผนมาตรฐาน'
                  >
                    <MenuItem value=''>
                      <em>เลือกแผนมาตรฐาน</em>
                    </MenuItem>
                    {riskAssessment?.riskTreatmentPlans.map(plan => (
                      <MenuItem key={plan._id} value={plan._id}>
                        {plan.contextConsiderations}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* ข้อมูลที่ดึงมาจาก RiskAssessment */}
              {treatmentFormData.contextConsiderations && (
                <Grid item xs={12}>
                  <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      ข้อพิจารณาจากแผนมาตรฐาน
                    </Typography>
                    <Typography variant='body2'>{treatmentFormData.contextConsiderations}</Typography>
                  </Paper>
                </Grid>
              )}
              {/* Treatment Plan Information */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>วิธีการจัดการความเสี่ยง</InputLabel>
                  <Select
                    name='treatmentOption'
                    value={treatmentFormData.treatmentOption || 'Reduce'} // กำหนดค่าเริ่มต้น
                    onChange={e => {
                      const selectedValue = e.target.value
                      const validOptions = ['Accept', 'Reduce', 'Transfer', 'Avoid', 'Other']

                      if (!validOptions.includes(selectedValue)) {
                        return // ไม่อัพเดตถ้าค่าไม่ถูกต้อง
                      }

                      setTreatmentFormData(prev => ({
                        ...prev,
                        treatmentOption: selectedValue
                      }))
                    }}
                    label='วิธีการจัดการความเสี่ยง'
                    required
                  >
                    <MenuItem value='Reduce'>ลดความเสี่ยง</MenuItem>
                    <MenuItem value='Accept'>ยอมรับความเสี่ยง</MenuItem>
                    <MenuItem value='Transfer'>ถ่ายโอนความเสี่ยง</MenuItem>
                    <MenuItem value='Avoid'>หลีกเลี่ยงความเสี่ยง</MenuItem>
                    <MenuItem value='Other'>อื่นๆ</MenuItem>
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

                {/* Risk Level Input */}
                <Grid item xs={12}>
                  <FormControl fullWidth margin='normal'>
                    <TextField
                      label='ระดับความเสี่ยงที่เหลืออยู่'
                      type='number'
                      value={treatmentFormData.residualRisk.riskLevel}
                      onChange={handleResidualRiskLevelChange}
                      inputProps={{
                        min: 1,
                        step: 0.5
                      }}
                      required
                    />
                  </FormControl>
                </Grid>

                {/* Result Display */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: 1,
                      borderColor: treatmentFormData.residualRisk.isAcceptable ? 'success.light' : 'error.light'
                    }}
                  >
                    <Typography variant='subtitle2' gutterBottom>
                      ผลการประเมินความเสี่ยงที่เหลืออยู่
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Chip
                          size='small'
                          color={treatmentFormData.residualRisk.isAcceptable ? 'success' : 'error'}
                          label={
                            treatmentFormData.residualRisk.isAcceptable
                              ? 'อยู่ในระดับที่ยอมรับได้'
                              : 'เกินระดับที่ยอมรับได้'
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
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
