require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

Airtable.configure({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN,
  endpointUrl: 'https://api.airtable.com',
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testFastigheter() {
  try {
    console.log('Hämtar alla fastigheter...');
    const records = await base('Fastigheter').select().all();
    
    console.log(`Hittade ${records.length} fastigheter`);
    
    if (records.length > 0) {
      // Skriv ut detaljerad information om varje fastighet
      records.forEach((record, index) => {
        console.log(`\nFastighet ${index + 1} (ID: ${record.id}):`);
        console.log('Fält i denna fastighet:');
        console.log(record.fields);
        
        // Inspektera också record-objektet för att se vilka metoder som finns
        console.log('\nMetoder på record-objektet:');
        console.log('Has get method:', typeof record.get === 'function');
      });
    }
  } catch (error) {
    console.error('Fel vid hämtning av fastigheter:', error);
  }
}

testFastigheter();