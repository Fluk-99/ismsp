'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, TextField, Typography, Container, Paper, CircularProgress } from '@mui/material'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '', companyName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('https://ismsp-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Login failed')

      localStorage.setItem('token', data.token)
      router.push('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth='xs'>
      <Paper sx={{ p: 4, mt: 10 }}>
        <Typography variant='h5' gutterBottom>
          Login
        </Typography>
        <TextField
          label='Username'
          name='username'
          fullWidth
          margin='normal'
          value={form.username}
          onChange={handleChange}
        />
        <TextField
          label='Password'
          name='password'
          type='password'
          fullWidth
          margin='normal'
          value={form.password}
          onChange={handleChange}
        />
        {error && (
          <Typography color='error' mt={1}>
            {error}
          </Typography>
        )}
        <Box mt={2}>
          <Button variant='contained' fullWidth onClick={handleLogin} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
