import axios from 'axios'

const API_URL = '/api/organization'

export const getOrganizations = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

export const createOrganization = async (name: string, businessType: string) => {
  const response = await axios.post(API_URL, { name, businessType })
  return response.data
}
