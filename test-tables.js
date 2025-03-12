require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

Airtable.configure({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN,
  endpointUrl: 'https://api.airtable.com',
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Lista över tabeller att testa
const tableNames = [
  'Fastigheter',
  'Bokningar',
  'Bilder',
  // Lägg till eventuella andra tabellnamn du misstänker kan finnas
];

async function testTables() {
  try {
    console.log('Testar anslutning till specifika tabeller...');
    
    for (const tableName of tableNames) {
      try {
        console.log(`\nProvar att hämta data från tabell: ${tableName}`);
        const records = await base(tableName).select({
          maxRecords: 1
        }).firstPage();
        
        if (records.length > 0) {
          console.log(`✅ Tabell '${tableName}' hittades och innehåller data.`);
          console.log('Fält i tabellen:');
          const fields = Object.keys(records[0].fields);
          fields.forEach(field => {
            console.log(`- ${field}`);
          });
          
          console.log('\nExempeldata:');
          console.log(records[0].fields);
        } else {
          console.log(`❗ Tabell '${tableName}' hittades men innehåller ingen data.`);
        }
      } catch (error) {
        console.error(`❌ Kunde inte hämta data från tabell '${tableName}':`, error.message);
      }
    }
    
    // Fråga specifikt efter Fastigheter-tabellen med alla poster
    try {
      console.log('\n\nHämtar alla poster från Fastigheter...');
      const allRecords = await base('Fastigheter').select().all();
      console.log(`Hittade totalt ${allRecords.length} fastigheter.`);
      
      if (allRecords.length > 0) {
        console.log('ID för första fastigheten:', allRecords[0].id);
      }
    } catch (error) {
      console.error('Fel vid hämtning av alla fastigheter:', error.message);
    }
    
  } catch (error) {
    console.error('Allmänt fel:', error);
  }
}

testTables();