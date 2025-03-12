// pages/api/bokningar/check-tillganglighet.js
import { checkTillganglighet } from '../../../lib/sql';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { fastighetId, startDatum, slutDatum } = req.body;
      
      // Validera indata
      if (!fastighetId || !startDatum || !slutDatum) {
        return res.status(400).json({ error: 'Alla fält måste fyllas i' });
      }
      
      // Kontrollera tillgänglighet
      const availability = await checkTillganglighet(
        fastighetId, 
        new Date(startDatum), 
        new Date(slutDatum)
      );
      
      // Returnera tillgänglighetsresultat
      res.status(200).json(availability);
    } catch (error) {
      console.error('API Error (bokningar/check-tillganglighet):', error);
      res.status(500).json({ error: 'Något gick fel vid kontroll av tillgänglighet' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}