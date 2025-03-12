// lib/sql.js
const sql = require('mssql');

// Definierar konfigurationen för SQL-anslutningen
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Exportera globalt så att den är tillgänglig för alla funktioner
const pool = new sql.ConnectionPool(sqlConfig);

// Anslut till databasen när modulen laddas
const poolConnect = pool.connect();

/**
 * Testar databasanslutningen
 * @returns {Promise<Object>} Resultatet av testet
 */
export async function testConnection() {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    const result = await request.query('SELECT 1 as connectionTest');
    
    return {
      success: true,
      message: 'Anslutningen lyckades',
      data: result.recordset[0]
    };
  } catch (error) {
    console.error('Fel vid test av databasanslutning:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Hämtar alla fastigheter från databasen
 * @returns {Promise<Array>} Array av fastighetsobjekt
 */
export async function getFastigheter() {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    const result = await request.query('SELECT * FROM Fastigheter');
    
    return result.recordset.map(record => ({
      id: record.ID,
      namn: record.Namn || '',
      beskrivning: record.Beskrivning || '',
      adress: record.Adress || '',
      pris: record.Pris || 0,
      agare: record.Agare || '',
      status: record.Status || '',
      utvald: record.Utvald || false,
      skapad: record.Skapad,
      senastUppdaterad: record.SenastUppdaterad,
      
      // Nya egenskaper
      boyta: record.Boyta || null,
      antalRum: record.AntalRum || null,
      antalBaddar: record.AntalBaddar || null,
      land: record.Land || '',
      husdjurTillatet: record.HusdjurTillatet === true || record.HusdjurTillatet === 1,
      rokfri: record.Rokfri === true || record.Rokfri === 1,
      uthyresMoblerad: record.UthyresMoblerad === true || record.UthyresMoblerad === 1,
      veckoavgiftLag: record.VeckoavgiftLag || null,
      veckoavgiftHog: record.VeckoavgiftHog || null
    }));
  } catch (error) {
    console.error('Fel vid hämtning av fastigheter:', error);
    throw error;
  }
}

/**
 * Hämtar en specifik fastighet med ID
 * @param {string} id - Fastighetens ID
 * @returns {Promise<Object|null>} Fastighetsobjekt eller null om den inte hittas
 */
export async function getFastighet(id) {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    request.input('id', sql.NVarChar, id);
    
    // Hämta fastigheten
    const fastighetsResult = await request.query(`
      SELECT f.*, 
             b.ID as BildID, b.Namn as BildNamn, b.ImageURL, b.Bildtext, b.Huvudbild, b.Ordning
      FROM Fastigheter f
      LEFT JOIN Bilder b ON f.ID = b.FastighetID
      WHERE f.ID = @id
    `);
    
    if (fastighetsResult.recordset.length === 0) {
      return null;
    }
    
    // Gruppera bilder till fastigheten
    const firstRecord = fastighetsResult.recordset[0];
    const bilder = fastighetsResult.recordset
      .filter(record => record.BildID) // Filtrera bort null-värden
      .map(record => ({
        id: record.BildID,
        namn: record.BildNamn || '',
        fastighet: record.ID,
        imageURL: record.ImageURL || '',
        bildtext: record.Bildtext || '',
        huvudbild: record.Huvudbild || false,
        ordning: record.Ordning || 0
      }));
    
    // Försök hämta bekvämligheter
    let bekvamligheter = {};
    let bekvamlighetLista = [];
    try {
      const bekvamResult = await request.query(`
        SELECT b.ID, b.Namn, b.Kategori, b.Ikon, fb.FinnsEj
        FROM Bekvamligheter b
        JOIN FastighetBekvamligheter fb ON b.ID = fb.BekvamlighetsID
        WHERE fb.FastighetID = @id
        ORDER BY b.Kategori, b.Namn
      `);
      
      bekvamResult.recordset.forEach(bek => {
        bekvamlighetLista.push({
          id: bek.ID,
          namn: bek.Namn,
          kategori: bek.Kategori,
          ikon: bek.Ikon,
          finnsEj: bek.FinnsEj === true || bek.FinnsEj === 1
        });
        
        // Gruppera efter kategori för enklare hantering i frontend
        if (!bekvamligheter[bek.Kategori]) {
          bekvamligheter[bek.Kategori] = [];
        }
        bekvamligheter[bek.Kategori].push({
          id: bek.ID,
          namn: bek.Namn,
          ikon: bek.Ikon,
          finnsEj: bek.FinnsEj === true || bek.FinnsEj === 1
        });
      });
    } catch (bekvamError) {
      console.warn('Kunde inte hämta bekvämligheter, fortsätter ändå:', bekvamError.message);
    }
    
    return {
      id: firstRecord.ID,
      namn: firstRecord.Namn || '',
      beskrivning: firstRecord.Beskrivning || '',
      adress: firstRecord.Adress || '',
      pris: firstRecord.Pris || 0,
      agare: firstRecord.Agare || '',
      status: firstRecord.Status || '',
      utvald: firstRecord.Utvald || false,
      skapad: firstRecord.Skapad,
      senastUppdaterad: firstRecord.SenastUppdaterad,
      
      // Nya egenskaper
      boyta: firstRecord.Boyta || null,
      antalRum: firstRecord.AntalRum || null,
      antalBaddar: firstRecord.AntalBaddar || null,
      land: firstRecord.Land || '',
      husdjurTillatet: firstRecord.HusdjurTillatet === true || firstRecord.HusdjurTillatet === 1,
      rokfri: firstRecord.Rokfri === true || firstRecord.Rokfri === 1,
      uthyresMoblerad: firstRecord.UthyresMoblerad === true || firstRecord.UthyresMoblerad === 1,
      veckoavgiftLag: firstRecord.VeckoavgiftLag || null,
      veckoavgiftHog: firstRecord.VeckoavgiftHog || null,
      
      bilder: bilder,
      bekvamligheter: bekvamligheter,
      bekvamlighetLista: bekvamlighetLista
    };
  } catch (error) {
    console.error(`Fel vid hämtning av fastighet med ID ${id}:`, error);
    throw error;
  }
}

/**
 * Hämtar alla bokningar för en specifik fastighet
 * @param {string} fastighetId - Fastighetens ID
 * @returns {Promise<Array>} Array av bokningsobjekt
 */
export async function getBokningarForFastighet(fastighetId) {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    request.input('fastighetId', sql.NVarChar, fastighetId);
    
    const result = await request.query(`
      SELECT * FROM Bokningar 
      WHERE FastighetID = @fastighetId
      ORDER BY StartDatum
    `);
    
    return result.recordset.map(record => ({
      id: record.ID,
      fastighetId: record.FastighetID,
      startDatum: record.StartDatum,
      slutDatum: record.SlutDatum,
      gastNamn: record.GastNamn,
      gastEmail: record.GastEmail,
      gastTelefon: record.GastTelefon,
      meddelande: record.Meddelande,
      status: record.Status,
      skapadDatum: record.SkapadDatum
    }));
  } catch (error) {
    console.error(`Fel vid hämtning av bokningar för fastighet ${fastighetId}:`, error);
    throw error;
  }
}

/**
 * Kontrollerar om ett datumintervall är tillgängligt för bokning
 * @param {string} fastighetId - Fastighetens ID
 * @param {Date} startDatum - Önskat startdatum
 * @param {Date} slutDatum - Önskat slutdatum
 * @returns {Promise<Object>} Resultat av tillgänglighetskontroll
 */
export async function checkTillganglighet(fastighetId, startDatum, slutDatum) {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    request.input('fastighetId', sql.NVarChar, fastighetId);
    request.input('startDatum', sql.Date, startDatum);
    request.input('slutDatum', sql.Date, slutDatum);
    
    const result = await request.query(`
      SELECT COUNT(*) AS overlapCount
      FROM Bokningar
      WHERE FastighetID = @fastighetId
      AND (
        (StartDatum <= @startDatum AND SlutDatum >= @startDatum) OR
        (StartDatum <= @slutDatum AND SlutDatum >= @slutDatum) OR
        (StartDatum >= @startDatum AND SlutDatum <= @slutDatum)
      )
    `);
    
    const available = result.recordset[0].overlapCount === 0;
    
    return { 
      available,
      message: available ? 'Datumen är tillgängliga' : 'Datumen är redan bokade'
    };
  } catch (error) {
    console.error('Fel vid kontroll av tillgänglighet:', error);
    throw error;
  }
}

/**
 * Skapar en ny bokning
 * @param {Object} bokning - Bokningsobjekt
 * @returns {Promise<Object>} Den skapade bokningen
 */
export async function createBokning(bokning) {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa ett unikt ID
    const uniqueId = `book${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    request.input('id', sql.NVarChar, uniqueId);
    request.input('fastighetId', sql.NVarChar, bokning.fastighetId);
    request.input('startDatum', sql.Date, new Date(bokning.startDatum));
    request.input('slutDatum', sql.Date, new Date(bokning.slutDatum));
    request.input('gastNamn', sql.NVarChar, bokning.gastNamn);
    request.input('gastEmail', sql.NVarChar, bokning.gastEmail);
    request.input('gastTelefon', sql.NVarChar, bokning.gastTelefon || null);
    request.input('meddelande', sql.NVarChar, bokning.meddelande || null);
    request.input('status', sql.NVarChar, bokning.status || 'Obekräftad');
    
    const result = await request.query(`
      INSERT INTO Bokningar (
        ID, FastighetID, StartDatum, SlutDatum, 
        GastNamn, GastEmail, GastTelefon, Meddelande, Status
      )
      VALUES (
        @id, @fastighetId, @startDatum, @slutDatum,
        @gastNamn, @gastEmail, @gastTelefon, @meddelande, @status
      );
      
      SELECT * FROM Bokningar WHERE ID = @id;
    `);
    
    if (result.recordset.length === 0) {
      throw new Error('Bokningen kunde inte skapas');
    }
    
    const record = result.recordset[0];
    return {
      id: record.ID,
      fastighetId: record.FastighetID,
      startDatum: record.StartDatum,
      slutDatum: record.SlutDatum,
      gastNamn: record.GastNamn,
      gastEmail: record.GastEmail,
      gastTelefon: record.GastTelefon,
      meddelande: record.Meddelande,
      status: record.Status,
      skapadDatum: record.SkapadDatum
    };
  } catch (error) {
    console.error('Fel vid skapande av bokning:', error);
    throw error;
  }
}

// Funktion för att stänga poolen vid applikationsavslutning
export async function closePool() {
  try {
    await pool.close();
    console.log('Databaspool stängd');
  } catch (err) {
    console.error('Fel vid stängning av pool:', err);
  }
}

// Exportera sql-biblioteket för att användas vid behov
export { sql };