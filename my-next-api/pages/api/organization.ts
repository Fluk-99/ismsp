import { NextApiRequest, NextApiResponse } from 'next';

// ข้อมูลจำลอง (Mock Data)
let organizations = [
  { id: '1', name: 'Company A', businessType: 'Technology' },
  { id: '2', name: 'Company B', businessType: 'Finance' },
];

// ฟังก์ชัน API Handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(organizations);
  } else if (req.method === 'POST') {
    const { name, businessType } = req.body;
    if (!name || !businessType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newOrg = { id: String(organizations.length + 1), name, businessType };
    organizations.push(newOrg);
    res.status(201).json({ message: 'Organization created', data: newOrg });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
