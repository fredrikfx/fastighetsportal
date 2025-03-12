import { getBilder, uploadBild } from '../../../lib/airtable';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const bilder = await getBilder();
      res.status(200).json(bilder);
    } catch (error) {
      res.status(500).json({ error: 'Något gick fel vid hämtning av bilder' });
    }
  } else if (req.method === 'POST') {
    try {
      const newBild = await uploadBild(req.body);
      res.status(201).json(newBild);
    } catch (error) {
      res.status(500).json({ error: 'Något gick fel vid uppladdning av bild' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}