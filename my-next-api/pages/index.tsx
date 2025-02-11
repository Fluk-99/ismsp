import { useEffect, useState } from 'react'
import { getOrganizations, createOrganization } from '../services/apiService'

// กำหนด Type ขององค์กร
interface Organization {
  id: string
  name: string
  businessType: string
}

export default function Home() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState('')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const data: Organization[] = await getOrganizations()
      setOrganizations(data)
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  const handleAddOrganization = async () => {
    if (!name || !businessType) return alert('กรุณากรอกข้อมูลให้ครบ')
    try {
      await createOrganization(name, businessType)
      setName('')
      setBusinessType('')
      fetchOrganizations() // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error creating organization:', error)
    }
  }

  return (
    <div>
      <h1>Organization List</h1>
      <ul>
        {organizations.map(org => (
          <li key={org.id}>
            {org.name} - {org.businessType}
          </li>
        ))}
      </ul>

      <h2>Add Organization</h2>
      <input type='text' placeholder='Organization Name' value={name} onChange={e => setName(e.target.value)} />
      <input
        type='text'
        placeholder='Business Type'
        value={businessType}
        onChange={e => setBusinessType(e.target.value)}
      />
      <button onClick={handleAddOrganization}>Add</button>
    </div>
  )
}
