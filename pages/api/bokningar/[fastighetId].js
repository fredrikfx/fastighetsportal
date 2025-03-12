// pages/api/bokningar/[fastighetId].js
import { getBokningarForFastighet } from '../../../lib/sql';

export default async function handler(req, res) {
  const { fastighetId } = req.query;
  
  if (req.method === 'GET') {
    try {
      // Validera indata
      if (!fastighetId) {
        return res.status(400).json({ error: 'FastighetID måste anges' });
      }
      
      try {
        // Försök hämta bokningar för fastigheten
        const bokningar = await getBokningarForFastighet(fastighetId);
        
        // Returnera bokningarna - även om de är tomma
        return res.status(200).json(bokningar || []);
      } catch (sqlError) {
        console.error(`API bokningar/${fastighetId}: SQL-fel:`, sqlError);
        
        // Om tabellen Bokningar inte finns, eller någon annan databasrelaterat fel
        // Vi returnerar en tom array och status 200 (OK) 
        // Det viktigaste är att API:et svarar så att frontend kan fortsätta fungera
        return res.status(200).json([]);
      }
    } catch (error) {
      console.error(`API bokningar/${fastighetId}: Serverfel:`, error);
      return res.status(500).json({ 
        error: 'Något gick fel vid hämtning av bokningar',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}