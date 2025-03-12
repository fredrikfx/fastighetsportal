import Airtable from 'airtable';

// Konfigurera Airtable med Personal Access Token
Airtable.configure({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN,
  endpointUrl: 'https://api.airtable.com',
});

// Skapa en bas
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Funktion för att hämta alla fastigheter
export async function getFastigheter() {
  try {
    const records = await base('Fastigheter').select().all();
    
    console.log(`Hittade ${records.length} fastigheter från Airtable`);
    
    return records.map(record => ({
      id: record.id,
      namn: record.fields['Namn'] || '',
      beskrivning: record.fields['Beskrivning'] || '',
      adress: record.fields['Adress'] || '',
      pris: record.fields['Pris'] || 0,
      agare: record.fields['Ägare'] || '',
      status: record.fields['Status'] || '',
      utvald: record.fields['Utvald'] || false,
      skapad: record.fields['Skapad'],
      senastUppdaterad: record.fields['Senast uppdaterad'],
      bilder: record.fields['Bilder'] || [],
      bokningar: record.fields['Bokningar'] || []
    }));
  } catch (error) {
    console.error('Error fetching fastigheter: ', error);
    throw error;
  }
}

// Funktion för att hämta en specifik fastighet
export async function getFastighet(id) {
  try {
    const record = await base('Fastigheter').find(id);
    
    return {
      id: record.id,
      namn: record.fields['Namn'] || '',
      beskrivning: record.fields['Beskrivning'] || '',
      adress: record.fields['Adress'] || '',
      pris: record.fields['Pris'] || 0,
      agare: record.fields['Ägare'] || '',
      status: record.fields['Status'] || '',
      utvald: record.fields['Utvald'] || false,
      skapad: record.fields['Skapad'],
      senastUppdaterad: record.fields['Senast uppdaterad'],
      bilder: record.fields['Bilder'] || [],
      bokningar: record.fields['Bokningar'] || []
    };
  } catch (error) {
    console.error(`Error fetching fastighet with ID ${id}:`, error);
    throw error;
  }
}

// Funktion för att hämta alla bokningar
export async function getBokningar() {
  try {
    const records = await base('Bokningar').select().all();
    
    return records.map(record => ({
      id: record.id,
      namn: record.fields['Namn'] || '',
      fastighet: record.fields['Fastighet'] || [],
      startdatum: record.fields['Startdatum'],
      slutdatum: record.fields['Slutdatum'],
      gastnamn: record.fields['Gästnamn'] || '',
      gastEmail: record.fields['Gäst e-post'] || '',
      gastTelefon: record.fields['Gästtelefon'] || '',
      status: record.fields['Status'] || ''
    }));
  } catch (error) {
    console.error('Error fetching bokningar: ', error);
    throw error;
  }
}

// Funktion för att hämta bokningar för en specifik fastighet
export async function getBokningarForFastighet(fastighetId) {
  try {
    const records = await base('Bokningar').select({
      filterByFormula: `FIND("${fastighetId}", {Fastighet})`
    }).all();
    
    return records.map(record => ({
      id: record.id,
      namn: record.fields['Namn'] || '',
      fastighet: record.fields['Fastighet'] || [],
      startdatum: record.fields['Startdatum'],
      slutdatum: record.fields['Slutdatum'],
      gastnamn: record.fields['Gästnamn'] || '',
      gastEmail: record.fields['Gäst e-post'] || '',
      gastTelefon: record.fields['Gästtelefon'] || '',
      status: record.fields['Status'] || ''
    }));
  } catch (error) {
    console.error(`Error fetching bokningar for fastighet ${fastighetId}:`, error);
    throw error;
  }
}

// Funktion för att hämta alla bilder
export async function getBilder() {
  try {
    const records = await base('Bilder').select().all();
    
    return records.map(record => ({
      id: record.id,
      namn: record.fields['Namn'] || '',
      fastighet: record.fields['Fastighet'] || [],
      imageURL: record.fields['ImageURL'] || '',
      bildtext: record.fields['Bildtext'] || '',
      huvudbild: record.fields['Huvudbild'] || false,
      ordning: record.fields['Ordning'] || 0
    }));
  } catch (error) {
    console.error('Error fetching bilder: ', error);
    throw error;
  }
}

// Funktion för att hämta bilder för en specifik fastighet
export async function getBilderForFastighet(fastighetId) {
  try {
    const records = await base('Bilder').select({
      filterByFormula: `FIND("${fastighetId}", {Fastighet})`
    }).all();
    
    return records.map(record => ({
      id: record.id,
      namn: record.fields['Namn'] || '',
      fastighet: record.fields['Fastighet'] || [],
      imageURL: record.fields['ImageURL'] || '',
      bildtext: record.fields['Bildtext'] || '',
      huvudbild: record.fields['Huvudbild'] || false,
      ordning: record.fields['Ordning'] || 0
    }));
  } catch (error) {
    console.error(`Error fetching bilder for fastighet ${fastighetId}:`, error);
    throw error;
  }
}

// Funktion för att skapa en ny bokning
export async function createBokning(bokning) {
  try {
    const record = await base('Bokningar').create([
      {
        fields: {
          Namn: bokning.namn || `Bokning ${new Date().toISOString()}`,
          Fastighet: bokning.fastighet ? [bokning.fastighet] : [],
          Startdatum: bokning.startdatum,
          Slutdatum: bokning.slutdatum,
          'Gästnamn': bokning.gastnamn,
          'Gäst e-post': bokning.gastEmail,
          'Gästtelefon': bokning.gastTelefon,
          Status: bokning.status || 'Obekräftad'
        }
      }
    ]);
    
    return record[0];
  } catch (error) {
    console.error('Error creating booking: ', error);
    throw error;
  }
}

// Funktion för att uppdatera en bokning
export async function updateBokning(id, fields) {
  try {
    const mappedFields = {};
    
    // Mappa JavaScript-fältnamn till Airtable-fältnamn
    if (fields.namn !== undefined) mappedFields['Namn'] = fields.namn;
    if (fields.fastighet !== undefined) mappedFields['Fastighet'] = Array.isArray(fields.fastighet) ? fields.fastighet : [fields.fastighet];
    if (fields.startdatum !== undefined) mappedFields['Startdatum'] = fields.startdatum;
    if (fields.slutdatum !== undefined) mappedFields['Slutdatum'] = fields.slutdatum;
    if (fields.gastnamn !== undefined) mappedFields['Gästnamn'] = fields.gastnamn;
    if (fields.gastEmail !== undefined) mappedFields['Gäst e-post'] = fields.gastEmail;
    if (fields.gastTelefon !== undefined) mappedFields['Gästtelefon'] = fields.gastTelefon;
    if (fields.status !== undefined) mappedFields['Status'] = fields.status;
    
    const record = await base('Bokningar').update([
      {
        id: id,
        fields: mappedFields
      }
    ]);
    
    return record[0];
  } catch (error) {
    console.error('Error updating booking: ', error);
    throw error;
  }
}

// Funktion för att ladda upp en ny bild
export async function uploadBild(bild) {
  try {
    const record = await base('Bilder').create([
      {
        fields: {
          Namn: bild.namn || '',
          Fastighet: bild.fastighet ? [bild.fastighet] : [],
          ImageURL: bild.imageURL || '',
          Bildtext: bild.bildtext || '',
          Huvudbild: bild.huvudbild || false,
          Ordning: bild.ordning || 0
        }
      }
    ]);
    
    return record[0];
  } catch (error) {
    console.error('Error uploading image: ', error);
    throw error;
  }
}