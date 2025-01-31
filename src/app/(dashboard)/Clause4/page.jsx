'use client'
// React Imports
import { useState } from 'react'

// MUI Imports
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Styled component for section
const SectionContainer = styled('div')({
  marginBottom: '20px'
})

export default function Page() {
  const [isEditable, setIsEditable] = useState(false)
  const [swotFields, setSwotFields] = useState([{ id: 1, text: '' }])
  const [interestedParties, setInterestedParties] = useState([{ id: 1, name: '', needOrExpectation: 'Needs' }])
  const [scopeStatements, setScopeStatements] = useState([{ id: 1, text: '' }])

  // Functions for SWOT Analysis
  const handleAddSwot = () => {
    setSwotFields(prev => [...prev, { id: prev.length + 1, text: '' }])
  }

  const handleSwotChange = (id, value) => {
    setSwotFields(prev => prev.map(item => (item.id === id ? { ...item, text: value } : item)))
  }

  const handleRemoveSwot = id => {
    setSwotFields(prev => prev.filter(item => item.id !== id))
  }

  // Functions for Interested Parties
  const handleAddParty = () => {
    setInterestedParties(prev => [...prev, { id: prev.length + 1, name: '', needOrExpectation: 'Needs' }])
  }

  const handleRemoveParty = id => {
    setInterestedParties(prev => prev.filter(item => item.id !== id))
  }

  const handlePartyChange = (id, field, value) => {
    setInterestedParties(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)))
  }

  // Functions for Scope Statements
  const handleAddScope = () => {
    setScopeStatements(prev => [...prev, { id: prev.length + 1, text: '' }])
  }

  const handleScopeChange = (id, value) => {
    setScopeStatements(prev => prev.map(item => (item.id === id ? { ...item, text: value } : item)))
  }

  const handleRemoveScope = id => {
    setScopeStatements(prev => prev.filter(item => item.id !== id))
  }

  const toggleEdit = () => {
    setIsEditable(!isEditable)
  }

  const handleSave = () => {
    setIsEditable(false)
    alert('Data Saved Successfully!')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <Typography variant='h4' style={{ marginBottom: '20px', textAlign: 'center' }}>
        Clause 4
      </Typography>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button variant='contained' color='secondary' onClick={toggleEdit} style={{ marginRight: '10px' }}>
          {isEditable ? 'Cancel' : 'Edit'}
        </Button>
        <Button variant='contained' color='primary' onClick={handleSave} disabled={!isEditable}>
          Save
        </Button>
      </div>

      {/* SWOT Analysis Section */}
      <SectionContainer>
        <Typography variant='h6' style={{ marginBottom: '10px' }}>
          SWOT Analysis
        </Typography>
        {swotFields.map(swot => (
          <div key={swot.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <TextField
              fullWidth
              disabled={!isEditable}
              label={`SWOT ${swot.id}`}
              value={swot.text}
              onChange={e => handleSwotChange(swot.id, e.target.value)}
            />
            {isEditable && (
              <Button variant='contained' color='secondary' onClick={() => handleRemoveSwot(swot.id)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        {isEditable && (
          <Button variant='contained' color='primary' onClick={handleAddSwot}>
            Add SWOT
          </Button>
        )}
      </SectionContainer>

      {/* Interested Parties Section */}
      <SectionContainer>
        <Typography variant='h6' style={{ marginBottom: '10px' }}>
          Interested Parties
        </Typography>
        {interestedParties.map(party => (
          <div key={party.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <TextField
              fullWidth
              disabled={!isEditable}
              label={`Interested Party ${party.id}`}
              value={party.name}
              onChange={e => handlePartyChange(party.id, 'name', e.target.value)}
            />
            <Select
              disabled={!isEditable}
              value={party.needOrExpectation}
              onChange={e => handlePartyChange(party.id, 'needOrExpectation', e.target.value)}
            >
              <MenuItem value='Needs'>Needs</MenuItem>
              <MenuItem value='Expectations'>Expectations</MenuItem>
            </Select>
            {isEditable && (
              <Button variant='contained' color='secondary' onClick={() => handleRemoveParty(party.id)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        {isEditable && (
          <Button variant='contained' color='primary' onClick={handleAddParty}>
            Add Party
          </Button>
        )}
      </SectionContainer>

      {/* Scope Statement Section */}
      <SectionContainer>
        <Typography variant='h6' style={{ marginBottom: '10px' }}>
          Scope Statement
        </Typography>
        {scopeStatements.map(scope => (
          <div key={scope.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <TextField
              fullWidth
              disabled={!isEditable}
              label={`Scope Statement ${scope.id}`}
              value={scope.text}
              onChange={e => handleScopeChange(scope.id, e.target.value)}
            />
            {isEditable && (
              <Button variant='contained' color='secondary' onClick={() => handleRemoveScope(scope.id)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        {isEditable && (
          <Button variant='contained' color='primary' onClick={handleAddScope}>
            Add Scope Statement
          </Button>
        )}
      </SectionContainer>
    </div>
  )
}
