// pages/api/bokningar/index.js
import { createBokning, checkTillganglighet } from '../../../lib/sql';

export default async function handler(req, res) {
  // Hantera olika HTTP-metoder
  if (req.method === 'POST') {
    try {
      const bokning = req.body;
      
      // Validera indata
      if (!bokning.fastighetId || !bokning.startDatum || !bokning.slutDatum || 
          !bokning.gastNamn || !bokning.gastEmail) {
        return res.status(400).json({ error: 'Alla obligatoriska fält måste fyllas i' });
      }
      
      // Kontrollera tillgänglighet först
      const availability = await checkTillganglighet(
        bokning.fastighetId, 
        new Date(bokning.startDatum), 
        new Date(bokning.slutDatum)
      );
      
      if (!availability.available) {
        return res.status(409).json({ error: 'Valda datum är inte tillgängliga', availability });
      }
      
      // Skapa bokningen
      const newBokning = await createBokning(bokning);
      
      // Skicka tillbaka den skapade bokningen
      res.status(201).json(newBokning);
    } catch (error) {
      console.error('API Error (bokningar/create):', error);
      res.status(500).json({ error: 'Något gick fel vid skapande av bokning' });
    }
  } else {
    // Metoden tillåts inte
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}