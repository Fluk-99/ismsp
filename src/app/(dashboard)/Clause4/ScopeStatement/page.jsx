'use client'
import { useState, useEffect } from 'react'
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function ScopeStatementManagement() {
  const [scopeStatements, setScopeStatements] = useState([])
  const [soaOptions, setSoaOptions] = useState([])
  const [form, setForm] = useState({ scopeInput: '', soaReference: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const API_BASE_URL = 'http://192.168.0.119:3000/api/4COTO/scope-statement'

  useEffect(() => {
    fetchScopeStatements()
    fetchSOAOptions()
  }, [])

  // 🔹 ดึง Scope Statements
  const fetchScopeStatements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`)
      const data = await response.json()
      console.log('Fetched Scope Statements:', data.data)
      setScopeStatements(data.data || [])
    } catch (error) {
      console.error('Error fetching Scope Statements:', error)
    }
  }

  // 🔹 ดึงตัวเลือก SOA
  const fetchSOAOptions = async () => {
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

  // 🔹 บันทึกข้อมูล Scope Statement
  const handleSave = async () => {
    if (!form.scopeInput || !form.soaReference) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    try {
      const method = isEditing ? 'PUT' : 'POST'
      const endpoint = isEditing ? `${API_BASE_URL}/${selectedId}` : `${API_BASE_URL}/create`

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      setForm({ scopeInput: '', soaReference: '' })
      setIsEditing(false)
      fetchScopeStatements()
    } catch (error) {
      console.error('Error saving Scope Statement:', error)
    }
  }

  // 🔹 แก้ไข Scope Statement
  const handleEdit = statement => {
    setForm({ scopeInput: statement.scopeInput, soaReference: statement.soaReference._id })
    setSelectedId(statement._id)
    setIsEditing(true)
  }

  // 🔹 ลบ Scope Statement
  const handleDelete = async id => {
    if (!window.confirm('คุณต้องการลบ Scope Statement นี้ใช่หรือไม่?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`Error: ${response.status}`)
      fetchScopeStatements()
    } catch (error) {
      console.error('Error deleting Scope Statement:', error)
    }
  }

  return (
    <div className='p-10 max-w-3xl mx-auto bg-white rounded-lg shadow-lg'>
      <h2 className='text-xl font-bold text-center mb-6'>Scope Statement Management</h2>

      {/* 🔹 ฟอร์มเพิ่ม Scope Statement */}
      <div className='p-4 border rounded-lg bg-gray-50 mb-6'>
        <h3 className='text-lg font-semibold mb-4'>{isEditing ? 'แก้ไข' : 'เพิ่ม'} Scope Statement</h3>

        <TextField
          fullWidth
          label='Scope Input'
          variant='outlined'
          className='mb-4'
          value={form.scopeInput}
          onChange={e => setForm({ ...form, scopeInput: e.target.value })}
        />

        <FormControl fullWidth variant='outlined' className='mb-4'>
          <InputLabel>เลือก SOA</InputLabel>
          <Select value={form.soaReference} onChange={e => setForm({ ...form, soaReference: e.target.value })}>
            {soaOptions.map(soa => (
              <MenuItem key={soa._id} value={soa._id}>
                {soa.controlId} {soa.controlName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant='contained' color='primary' onClick={handleSave}>
          {isEditing ? 'อัปเดต' : 'บันทึก'}
        </Button>
      </div>

      {/* 🔹 รายการ Scope Statement */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Scope Input</TableCell>
              <TableCell>SOA Reference</TableCell>
              <TableCell align='center'>จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scopeStatements.map(statement => (
              <TableRow key={statement._id}>
                <TableCell>{statement.scopeInput}</TableCell>
                <TableCell>
                  {statement.soaReference
                    ? `${statement.soaReference.controlId} - ${statement.soaReference.controlName}`
                    : 'No SOA Assigned'}
                </TableCell>
                <TableCell align='center'>
                  <IconButton color='primary' onClick={() => handleEdit(statement)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color='secondary' onClick={() => handleDelete(statement._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
