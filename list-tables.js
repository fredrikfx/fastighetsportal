require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

Airtable.configure({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN,
  endpointUrl: 'https://api.airtable.com',
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function listTablesAndFields() {
  try {
    console.log('Listar alla tabeller i basen...');
    const tables = await base.tables();
    
    console.log(`Hittade ${tables.length} tabeller:`);
    for (const table of tables) {
      console.log(`\nTabell: ${table.name}`);
      
      try {
        // Hämta ett exempelrekord för att se fälten
        const records = await base(table.name).select({
          maxRecords: 1
        }).firstPage();
        
        if (records.length > 0) {
          console.log('Fält i tabellen:');
          const fields = Object.keys(records[0].fields);
          fields.forEach(field => {
            console.log(`- ${field}`);
          });
          
          console.log('\nExempeldata:');
          console.log(records[0].fields);
        } else {
          console.log('Inga rekord i denna tabell');
        }
      } catch (recordError) {
        console.error(`Fel vid hämtning av rekord från ${table.name}:`, recordError);
      }
    }
  } catch (error) {
    console.error('Fel:', error);
  }
}

listTablesAndFields();