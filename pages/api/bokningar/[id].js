import { updateBokning } from '../../../lib/airtable';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'PUT') {
    try {
      const updatedBokning = await updateBokning(id, req.body);
      res.status(200).json(updatedBokning);
    } catch (error) {
      res.status(500).json({ error: 'Något gick fel vid uppdatering av bokning' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}