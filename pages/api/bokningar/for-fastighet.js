// pages/api/bokningar/for-fastighet.js
import { getBokningarForFastighet } from '../../../lib/sql';

export default async function handler(req, res) {
  const { fastighetId } = req.query;
  
  if (req.method === 'GET') {
    try {
      // Validera indata
      if (!fastighetId) {
        return res.status(400).json({ error: 'FastighetID måste anges' });
      }
      
      // Hämta bokningar för fastigheten
      const bokningar = await getBokningarForFastighet(fastighetId);
      
      // Returnera bokningarna
      res.status(200).json(bokningar);
    } catch (error) {
      console.error(`API Error (bokningar/for-fastighet):`, error);
      res.status(500).json({ error: 'Något gick fel vid hämtning av bokningar' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}