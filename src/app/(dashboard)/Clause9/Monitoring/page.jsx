'use client'
import { useState, useEffect } from 'react'
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Checkbox,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Box
} from '@mui/material'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CancelIcon from '@mui/icons-material/Cancel'

export default function PerformanceEvaluation() {
  const [correctiveActions, setCorrectiveActions] = useState([])
  const [kpiFileName, setKpiFileName] = useState('')
  const [correctiveFileName, setCorrectiveFileName] = useState('')
  const [documentClassification, setDocumentClassification] = useState('')
  const [documentClassification1, setDocumentClassification1] = useState([])
  const [ismsKpi, setIsmsKpi] = useState([])
  const [measurementTools, setMeasurementTools] = useState([])
  const [additionalFiles, setAdditionalFiles] = useState([])
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const [forms, setForms] = useState([
    {
      documentClassification: '',
      documentClassification1: '',
      ismsKpi: [],
      measurementTools: [],
      latestResult: '',
      monitoringFrequency: '',
      kpiFileName: '',
      correctiveFileName: '',
      additionalFiles: [],
      correctiveActions: []
    }
  ])

  useEffect(() => {
    fetchAllData()
  }, [])

  // ปรับปรุงการ handleChange
  const handleChange = (index, field, value) => {
    setForms(prevForms =>
      prevForms.map((form, i) => {
        if (i === index) {
          // ไม่ต้อง stringify ค่า string ธรรมดา
          return { ...form, [field]: value === undefined ? '' : value }
        }
        return form
      })
    )
  }

  // ปรับปรุง handleSubmit
  const handleSubmit = async () => {
    const formData = new FormData()
    const newForm = forms[forms.length - 1] // ✅ บันทึกเฉพาะฟอร์มล่าสุด

    const dataToSend = {
      kpiIndicators: newForm.ismsKpi || [],
      evaluationTools: newForm.measurementTools || [],
      evaluationPeriod: newForm.documentClassification || '',
      latestEvaluationResult: newForm.latestResult || '',
      responsiblePerson: newForm.responsiblePerson || '',
      monitoringFrequency: newForm.documentClassification1 || '',
      evaluationSummary: newForm.evaluationSummary || '',
      correctiveActions: newForm.correctiveActions.map(action => ({
        problem: action.problem?.trim() || 'N/A',
        cause: action.cause?.trim() || 'N/A',
        solution: action.solution?.trim() || 'N/A',
        responsiblePerson: action.responsiblePerson?.trim() || 'N/A',
        dueDate: action.dueDate ? new Date(action.dueDate) : null
      }))
    }

    Object.keys(dataToSend).forEach(key => {
      if (Array.isArray(dataToSend[key])) {
        formData.append(key, JSON.stringify(dataToSend[key]))
      } else {
        formData.append(key, dataToSend[key])
      }
    })

    if (newForm.kpiFile) {
      formData.append('kpiReportFile', newForm.kpiFile)
    }
    if (newForm.correctiveFile) {
      formData.append('correctiveActionFile', newForm.correctiveFile)
    }

    try {
      const response = await fetch('http://192.168.0.119:3000/api/9PE/monitoring/create', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      console.log('Server response:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save data')
      }

      setOpenSnackbar(true)
      await fetchAllData() // ✅ โหลดข้อมูลใหม่หลังจากบันทึกเสร็จ
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // แก้ไขการแสดงผลข้อมูลที่โหลดมา
  const fetchAllData = async () => {
    try {
      const response = await fetch('http://192.168.0.119:3000/api/9PE/monitoring/')
      const result = await response.json()

      if (result.data) {
        const formattedData = result.data.map(record => ({
          _id: record._id, // ✅ เพิ่ม _id เพื่อให้อัปเดตข้อมูลได้
          ismsKpi: record.kpiIndicators || [],
          measurementTools: record.evaluationTools || [],
          documentClassification: record.evaluationPeriod || '',
          latestResult: record.latestEvaluationResult || '',
          responsiblePerson: record.responsiblePerson || '',
          documentClassification1: record.monitoringFrequency || '',
          evaluationSummary: record.evaluationSummary || '',
          correctiveActions: record.correctiveActions.map(action => ({
            problem: action.problem || 'N/A',
            cause: action.cause || 'N/A',
            solution: action.solution || 'N/A',
            responsiblePerson: action.responsiblePerson || 'N/A',
            dueDate: action.dueDate || null
          })),
          kpiFile: record.kpiReportFile ? { name: record.kpiReportFile.split('/').pop() } : null,
          correctiveFile: record.correctiveActionFile ? { name: record.correctiveActionFile.split('/').pop() } : null,
          kpiFileName: record.kpiReportFile || '',
          correctiveFileName: record.correctiveActionFile || ''
        }))

        setForms(formattedData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleAddForm = () => {
    setForms(prevForms => [
      ...prevForms,
      {
        _id: undefined,
        ismsKpi: [],
        measurementTools: [],
        latestResult: '',
        responsiblePerson: '',
        monitoringFrequency: '',
        evaluationSummary: '',
        documentClassification: '',
        documentClassification1: '',
        correctiveActions: [],
        kpiFile: null,
        correctiveFile: null,
        kpiFileName: '',
        correctiveFileName: ''
      }
    ])
  }

  const handleRemoveForm = index => {
    if (forms.length > 1) {
      setForms(forms.filter((_, i) => i !== index))
    }
  }

  const handleSave = async index => {
    console.log('Saving data...')

    const form = forms[index]
    const isEditing = form._id !== undefined // เช็คว่ามี _id ไหม ถ้ามีแปลว่ากำลัง "แก้ไข" ไม่ใช่ "สร้างใหม่"

    const formData = new FormData()

    // เตรียมข้อมูลที่ต้องส่ง
    const dataToSend = {
      kpiIndicators: form.ismsKpi || [],
      evaluationTools: form.measurementTools || [],
      evaluationPeriod: form.documentClassification || '',
      latestEvaluationResult: form.latestResult || '',
      responsiblePerson: form.responsiblePerson || '',
      monitoringFrequency: form.documentClassification1 || '',
      evaluationSummary: form.evaluationSummary || '',
      correctiveActions: form.correctiveActions.map(action => ({
        problem: action.problem?.trim() || 'N/A',
        cause: action.cause?.trim() || 'N/A',
        solution: action.solution?.trim() || 'N/A',
        responsiblePerson: action.responsiblePerson?.trim() || 'N/A',
        dueDate: action.dueDate ? new Date(action.dueDate) : null
      }))
    }
    console.log('📤 ข้อมูลที่ส่งไปยังเซิร์ฟเวอร์:', dataToSend)
    // เพิ่มข้อมูลลงใน FormData
    Object.keys(dataToSend).forEach(key => {
      if (Array.isArray(dataToSend[key])) {
        formData.append(key, JSON.stringify(dataToSend[key]))
      } else {
        formData.append(key, dataToSend[key])
      }
    })

    // จัดการไฟล์แนบ
    if (form.kpiFile) {
      formData.append('kpiReportFile', form.kpiFile)
    }
    if (form.correctiveFile) {
      formData.append('correctiveActionFile', form.correctiveFile)
    }

    try {
      // ✅ เลือก URL และ Method ตามกรณี (Create หรือ Update)
      const url = isEditing
        ? `http://192.168.0.119:3000/api/9PE/monitoring/update/${form._id}`
        : 'http://192.168.0.119:3000/api/9PE/monitoring/create'

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      const result = await response.json()
      console.log('Server response:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save data')
      }

      setOpenSnackbar(true)
      await fetchAllData() // โหลดข้อมูลใหม่หลังจากบันทึกเสร็จ
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleRemoveFile = (formIndex, fileIndex) => {
    setForms(prevForms =>
      prevForms.map((form, i) =>
        i === formIndex ? { ...form, additionalFiles: form.additionalFiles.filter((_, fi) => fi !== fileIndex) } : form
      )
    )
  }

  const handleAddFile = index => {
    setForms(prevForms =>
      prevForms.map((form, i) => (i === index ? { ...form, additionalFiles: [...form.additionalFiles, ''] } : form))
    )
  }

  {
    /*
const handleAdditionalFileChange = (formIndex, fileIndex, event) => {
  const file = event.target.files[0]?.name || "";
  setForms(prevForms =>
      prevForms.map((form, i) =>
          i === formIndex ? {
              ...form,
              additionalFiles: form.additionalFiles.map((f, fi) => fi === fileIndex ? file : f)
          } : form
      )
  );
};*/
  }

  const handleFileChange = (index, field, event) => {
    const file = event.target.files[0]

    if (file) {
      setForms(prevForms =>
        prevForms.map((form, i) =>
          i === index
            ? {
                ...form,
                [field]: file,
                [field === 'kpiFile' ? 'kpiFileName' : 'correctiveFileName']: file.name
              }
            : form
        )
      )
      console.log(`📂 [handleFileChange] ${field} updated:`, file.name)
    } else {
      console.log(`❌ [handleFileChange] No file selected for ${field}`)
    }
  }

  const handleCorrectiveChange = (formIndex, rowIndex, field, value) => {
    setForms(prevForms =>
      prevForms.map((form, i) =>
        i === formIndex
          ? {
              ...form,
              correctiveActions: form.correctiveActions.map((action, j) =>
                j === rowIndex
                  ? { ...action, [field]: value || '' } // ✅ ป้องกันค่า undefined
                  : action
              )
            }
          : form
      )
    )
  }

  const handleAddRow = index => {
    setForms(prevForms =>
      prevForms.map((form, i) =>
        i === index
          ? {
              ...form,
              correctiveActions: [
                ...form.correctiveActions,
                {
                  problem: '',
                  cause: '',
                  solution: '',
                  responsiblePerson: '',
                  dueDate: ''
                }
              ]
            }
          : form
      )
    )
  }

  const handleRemoveRow = (formIndex, rowIndex) => {
    setForms(prevForms =>
      prevForms.map((form, i) =>
        i === formIndex
          ? {
              ...form,
              correctiveActions: form.correctiveActions.filter((_, ri) => ri !== rowIndex)
            }
          : form
      )
    )
  }

  const handleDelete = async id => {
    if (!id) {
      console.error('❌ ไม่มี ID สำหรับลบข้อมูล')
      return
    }

    const confirmDelete = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`http://192.168.0.119:3000/api/9PE/monitoring/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      console.log('🗑 ผลลัพธ์จากเซิร์ฟเวอร์:', result)

      if (!response.ok) {
        throw new Error(result.message || 'ลบข้อมูลไม่สำเร็จ')
      }

      // ✅ อัปเดต state และโหลดข้อมูลใหม่หลังจากลบสำเร็จ
      setForms(prevForms => prevForms.filter(form => form._id !== id))
      setOpenSnackbar(true)
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการลบ:', error)
    }
  }

  return (
    <div className='p-10 max-w-4x5 mx-auto rounded-lg shadow-lg'>
      <h2 className='text-xl font-bold text-center'>Clause 9: Performance Evaluation</h2>
      <p className='text-center text-gray-600 mb-4'>การติดตาม, การวัดผล, การวิเคราะห์ และการประเมินผล</p>

      {forms.map((form, index) => {
        return (
          <Box
            key={index}
            sx={{
              border: '2px solid #888',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              position: 'relative',
              marginBottom: '100px',
              width: '100%'
            }}
          >
            {forms.length > 1 && (
              <IconButton
                onClick={() => handleDelete(form._id)}
                sx={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-15px',
                  fontSize: '1.5rem',
                  color: 'red',
                  backgroundColor: '#ddd',
                  padding: '5px',
                  '&:hover': { backgroundColor: 'error', color: 'error' }
                }}
                color='error'
              >
                <CancelIcon />
              </IconButton>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ตัวชี้วัด ISMS (ISMS KPI)
                  </InputLabel>
                  <Select
                    multiple
                    value={form.ismsKpi}
                    onChange={e => handleChange(index, 'ismsKpi', e.target.value)}
                    displayEmpty
                    renderValue={selected => selected.join(', ')}
                  >
                    {['Security Incident', 'Response Time', 'Audit Findings'].map(option => (
                      <MenuItem key={option} value={option}>
                        <Checkbox checked={ismsKpi.includes(option)} />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    เครื่องมือที่ใช้วัดผล
                  </InputLabel>
                  <Select
                    multiple
                    value={form.measurementTools}
                    onChange={e => handleChange(index, 'measurementTools', e.target.value)}
                    renderValue={selected => selected.join(', ')}
                  >
                    {['IEM', 'Log Monitoring', 'Security Audits'].map(option => (
                      <MenuItem key={option} value={option}>
                        <Checkbox checked={measurementTools.includes(option)} />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} className='mt-1'>
              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ระยะเวลาตรวจวัด
                  </InputLabel>
                  <Select
                    value={form.documentClassification || ''}
                    onChange={e => handleChange(index, 'documentClassification', e.target.value)}
                  >
                    <MenuItem value='รายเดือน'>รายเดือน</MenuItem>
                    <MenuItem value='รายไตรมาส'>รายไตรมาส</MenuItem>
                    <MenuItem value='รายปี'>รายปี</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='ผลการวัดตัวชี้วัดล่าสุด'
                  fullWidth
                  value={forms[index].latestResult || ''} // ✅ ผูกค่าให้ TextField
                  onChange={e => handleChange(index, 'latestResult', e.target.value)} // ✅ อัปเดตค่า
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='ผู้รับผิดชอบในการวัดผล'
                  fullWidth
                  value={forms[index].responsiblePerson || ''} // ✅ ผูกค่าให้ TextField
                  onChange={e => handleChange(index, 'responsiblePerson', e.target.value)} // ✅ อัปเดตค่า
                />
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ marginTop: -2.5 }}>
                    ความถี่ในการติดตามผล
                  </InputLabel>
                  <Select
                    value={form.documentClassification1 || ''}
                    onChange={e => handleChange(index, 'documentClassification1', e.target.value)}
                  >
                    <MenuItem value='3 เดือน'>3 เดือน</MenuItem>
                    <MenuItem value='6 เดือน'>6 เดือน</MenuItem>
                    <MenuItem value='12 เดือน'>12 เดือน</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} className='mt-5'>
                <TextField
                  label='สรุปผลการวิเคราะห์'
                  fullWidth
                  value={forms[index].evaluationSummary || ''} // ✅ ผูกค่าให้ TextField
                  onChange={e => handleChange(index, 'evaluationSummary', e.target.value)} // ✅ อัปเดตค่า
                />
              </Grid>
            </Grid>

            <h3 className='font-semibold mt-6'>การดำเนินการแก้ไข (Corrective Actions)</h3>
            <TableContainer component={Paper} className='mt-2'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ปัญหาที่พบ</TableCell>
                    <TableCell>สาเหตุของปัญหา</TableCell>
                    <TableCell>แนวทางแก้ไข</TableCell>
                    <TableCell>ผู้รับผิดชอบ</TableCell>
                    <TableCell>วันที่ครบกำหนด</TableCell>
                    <TableCell>ลบ</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {form.correctiveActions.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={row.problem || ''} // ✅ ผูกค่าให้ TextField
                          onChange={e => handleCorrectiveChange(index, rowIndex, 'problem', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={row.cause || ''}
                          onChange={e => handleCorrectiveChange(index, rowIndex, 'cause', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={row.solution || ''}
                          onChange={e => handleCorrectiveChange(index, rowIndex, 'solution', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={row.responsiblePerson || ''}
                          onChange={e => handleCorrectiveChange(index, rowIndex, 'responsiblePerson', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type='date'
                          value={row.dueDate ? row.dueDate.split('T')[0] : ''} // ป้องกันค่า null
                          onChange={e => handleCorrectiveChange(index, rowIndex, 'dueDate', e.target.value)}
                        />
                      </TableCell>

                      <TableCell>
                        <IconButton onClick={() => handleRemoveRow(index, rowIndex)} color='error'>
                          <RemoveCircleOutline />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              startIcon={<AddCircleOutline />}
              onClick={() => handleAddRow(index)}
              variant='contained'
              className='mt-2'
            >
              เพิ่ม
            </Button>

            <Grid container spacing={2} className='mt-4'>
              <Grid item xs={6}>
                <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                  อัปโหลดรายงานวัดผล KPI
                  <input type='file' hidden onChange={e => handleFileChange(index, 'kpiFile', e)} />
                </Button>
                <TextField fullWidth margin='dense' value={form.kpiFileName || ''} placeholder='ชื่อไฟล์' disabled />
              </Grid>

              <Grid item xs={6}>
                <Button variant='outlined' component='label' startIcon={<CloudUploadIcon />}>
                  อัปโหลดเอกสารการดำเนินการแก้ไข
                  <input type='file' hidden onChange={e => handleFileChange(index, 'correctiveFile', e)} />
                </Button>
                <TextField
                  fullWidth
                  margin='dense'
                  value={form.correctiveFileName || ''}
                  placeholder='ชื่อไฟล์'
                  disabled
                />
              </Grid>
            </Grid>

            <div className='flex justify-between mt-6'>
              <Button onClick={() => handleSave(index)} variant='contained' color='primary'>
                {form._id ? 'อัปเดต' : 'บันทึก'}
              </Button>
            </div>

            {/*
            {form.additionalFiles.map((file, fileIndex) => (
            <Grid container spacing={2} className="mt-2" key={fileIndex}>
              <Grid item xs={10}>
                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                  อัปโหลดไฟล์เพิ่มเติม
                  <input type="file" hidden onChange={(e) => handleAdditionalFileChange(index, fileIndex, e)} />
                </Button>
                <TextField fullWidth margin="dense" value={file} placeholder="ชื่อไฟล์" disabled />
              </Grid>

                <Grid item xs={2}>
                <IconButton onClick={() => handleRemoveFile(index, fileIndex)} color="error">
                    <RemoveCircleOutline />
                  </IconButton>
                </Grid>
              </Grid>))}
              <Button startIcon={<AddCircleOutline />} onClick={() => handleAddFile(index)} variant="contained" className="mt-2">เพิ่มไฟล์</Button>*/}
          </Box>
        )
      })}

      <Button startIcon={<AddCircleOutline />} onClick={handleAddForm} variant='contained' className='mt-2'>
        เพิ่มฟอร์ม
      </Button>
    </div>
  )
}
