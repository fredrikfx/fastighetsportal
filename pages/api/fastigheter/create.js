// pages/api/fastigheter/create.js
import { createFastighet, testConnection } from '../../../lib/sql';

export default async function handler(req, res) {
  // Endast tillåt POST-förfrågningar
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('API: Börjar skapa fastighet');
    
    // Kontrollera databasanslutningen först
    try {
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        console.error('API: Databasanslutningstest misslyckades:', connectionTest.error);
        return res.status(500).json({ 
          error: 'Databasfel',
          message: 'Kunde inte ansluta till databasen',
          details: process.env.NODE_ENV === 'development' ? connectionTest.error : undefined
        });
      }
    } catch (connError) {
      console.error('API: Fel vid test av databasanslutning:', connError);
      return res.status(500).json({ 
        error: 'Anslutningsfel',
        message: 'Kunde inte testa databasanslutningen',
        details: process.env.NODE_ENV === 'development' ? connError.message : undefined
      });
    }
    
    // Validera indata (enkel validering, kan utökas)
    const { name, address } = req.body;
    if (!name || !address) {
      return res.status(400).json({ 
        error: 'Ogiltig indata', 
        message: 'Namn och adress krävs' 
      });
    }
    
    // Skapa fastigheten
    try {
      const newFastighet = await createFastighet(req.body);
      console.log('API: Ny fastighet skapad:', newFastighet);
      return res.status(201).json(newFastighet);
    } catch (dbError) {
      console.error('API: Databasfel vid skapande av fastighet:', dbError);
      return res.status(500).json({ 
        error: 'Databasfel',
        message: 'Kunde inte skapa fastigheten',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
  } catch (error) {
    console.error('API: Okänt fel vid hantering av begäran:', error);
    return res.status(500).json({ 
      error: 'Internt serverfel', 
      message: 'Något gick fel vid bearbetning av begäran',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}