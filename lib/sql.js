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
      veckoavgiftHog: record.VeckoavgiftHog || null,
      referenskod: record.Referenskod || ''
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
      referenskod: firstRecord.Referenskod || '',
      
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
 * Hämtar alla bokningar från databasen
 * @returns {Promise<Array>} Array av bokningsobjekt
 */
export async function getBokningar() {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    
    // Kontrollera om tabellen finns
    const tableCheck = await request.query(`
      SELECT CASE WHEN EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'Bokningar'
      ) THEN 1 ELSE 0 END AS TableExists
    `);
    
    if (!tableCheck.recordset[0].TableExists) {
      console.log('Bokningar-tabellen finns inte, returnerar tom array');
      return [];
    }
    
    const result = await request.query('SELECT * FROM Bokningar');
    
    return result.recordset.map(record => ({
      id: record.ID,
      fastighet: record.FastighetID,
      startdatum: record.StartDatum,
      slutdatum: record.SlutDatum,
      gastnamn: record.GastNamn,
      gastEmail: record.GastEmail,
      gastTelefon: record.GastTelefon,
      meddelande: record.Meddelande,
      status: record.Status,
      skapadDatum: record.SkapadDatum
    }));
  } catch (error) {
    console.error('Fel vid hämtning av bokningar:', error);
    // Om tabellen inte finns eller andra databasfel, returnera tom array
    console.log('Returnerar tom array på grund av fel');
    return [];
  }
}

/**
 * Hämtar en specifik bokning med ID
 * @param {string} id - Bokningens ID
 * @returns {Promise<Object|null>} Bokningsobjekt eller null om den inte hittas
 */
export async function getBokning(id) {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    request.input('id', sql.NVarChar, id);
    
    // Kontrollera om tabellen finns
    const tableCheck = await request.query(`
      SELECT CASE WHEN EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'Bokningar'
      ) THEN 1 ELSE 0 END AS TableExists
    `);
    
    if (!tableCheck.recordset[0].TableExists) {
      console.log('Bokningar-tabellen finns inte, returnerar null');
      return null;
    }
    
    const result = await request.query('SELECT * FROM Bokningar WHERE ID = @id');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    const record = result.recordset[0];
    return {
      id: record.ID,
      fastighet: record.FastighetID,
      startdatum: record.StartDatum,
      slutdatum: record.SlutDatum,
      gastnamn: record.GastNamn,
      gastEmail: record.GastEmail,
      gastTelefon: record.GastTelefon,
      meddelande: record.Meddelande,
      status: record.Status,
      skapadDatum: record.SkapadDatum
    };
  } catch (error) {
    console.error(`Fel vid hämtning av bokning med ID ${id}:`, error);
    return null;
  }
}

/**
 * Hämtar alla bilder från databasen
 * @returns {Promise<Array>} Array av bildobjekt
 */
export async function getBilder() {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    
    // Kontrollera om tabellen finns
    const tableCheck = await request.query(`
      SELECT CASE WHEN EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'Bilder'
      ) THEN 1 ELSE 0 END AS TableExists
    `);
    
    if (!tableCheck.recordset[0].TableExists) {
      console.log('Bilder-tabellen finns inte, returnerar tom array');
      return [];
    }
    
    const result = await request.query('SELECT * FROM Bilder');
    
    return result.recordset.map(record => ({
      id: record.ID,
      namn: record.Namn || '',
      fastighet: record.FastighetID,
      imageURL: record.ImageURL || '',
      bildtext: record.Bildtext || '',
      huvudbild: record.Huvudbild || false,
      ordning: record.Ordning || 0
    }));
  } catch (error) {
    console.error('Fel vid hämtning av bilder:', error);
    // Om tabellen inte finns eller andra databasfel, returnera tom array
    console.log('Returnerar tom array på grund av fel');
    return [];
  }
}

/**
 * Skapar en ny fastighet
 * @param {Object} fastighetData - Fastighetsobjekt med alla egenskaper
 * @returns {Promise<Object>} Den skapade fastigheten
 */
export async function createFastighet(fastighetData) {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa ett unikt ID
    const uniqueId = `prop${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    request.input('id', sql.NVarChar, uniqueId);
    request.input('namn', sql.NVarChar, fastighetData.name);
    request.input('beskrivning', sql.NVarChar, fastighetData.description);
    request.input('adress', sql.NVarChar, fastighetData.address);
    request.input('pris', sql.Float, fastighetData.price);
    request.input('status', sql.NVarChar, fastighetData.status || 'available');
    request.input('utvald', sql.Bit, fastighetData.utvald || false);
    request.input('referenskod', sql.NVarChar, fastighetData.referenskod || '');
    
    // Extra fält som är specifika för din databas
    request.input('boyta', sql.Float, fastighetData.area);
    request.input('antalRum', sql.Float, fastighetData.rooms);
    request.input('antalBaddar', sql.Int, fastighetData.antalBaddar || null);
    request.input('land', sql.NVarChar, fastighetData.land || 'Sverige');
    request.input('husdjurTillatet', sql.Bit, fastighetData.husdjurTillatet || false);
    request.input('rokfri', sql.Bit, fastighetData.rokfri || false);
    request.input('uthyresMoblerad', sql.Bit, fastighetData.uthyresMoblerad || false);
    request.input('veckoavgiftLag', sql.Float, fastighetData.veckoavgiftLag || fastighetData.monthlyFee);
    request.input('veckoavgiftHog', sql.Float, fastighetData.veckoavgiftHog || fastighetData.monthlyFee);
    
    const result = await request.query(`
      INSERT INTO Fastigheter (
        ID, Namn, Beskrivning, Adress, Pris, Status, Utvald, Referenskod,
        Boyta, AntalRum, AntalBaddar, Land, 
        HusdjurTillatet, Rokfri, UthyresMoblerad,
        VeckoavgiftLag, VeckoavgiftHog, Skapad, SenastUppdaterad
      )
      OUTPUT INSERTED.*
      VALUES (
        @id, @namn, @beskrivning, @adress, @pris, @status, @utvald, @referenskod,
        @boyta, @antalRum, @antalBaddar, @land,
        @husdjurTillatet, @rokfri, @uthyresMoblerad,
        @veckoavgiftLag, @veckoavgiftHog, GETDATE(), GETDATE()
      );
    `);
    
    if (result.recordset.length === 0) {
      throw new Error('Fastigheten kunde inte skapas');
    }
    
    // Konvertera till admin-format för konsistent respons
    const record = result.recordset[0];
    return {
      id: record.ID,
      name: record.Namn,
      description: record.Beskrivning,
      address: record.Adress,
      price: record.Pris,
      status: record.Status,
      referenskod: record.Referenskod,
      area: record.Boyta,
      rooms: record.AntalRum,
      monthlyFee: record.VeckoavgiftLag,
      antalBaddar: record.AntalBaddar,
      land: record.Land,
      husdjurTillatet: record.HusdjurTillatet === true || record.HusdjurTillatet === 1,
      rokfri: record.Rokfri === true || record.Rokfri === 1,
      uthyresMoblerad: record.UthyresMoblerad === true || record.UthyresMoblerad === 1,
      veckoavgiftLag: record.VeckoavgiftLag,
      veckoavgiftHog: record.VeckoavgiftHog,
      utvald: record.Utvald === true || record.Utvald === 1
    };
  } catch (error) {
    console.error('Fel vid skapande av fastighet:', error);
    throw error;
  }
}

/**
 * Uppdaterar en befintlig fastighet
 * @param {string} id - Fastighetens ID
 * @param {Object} fastighetData - Uppdaterad fastighetsdata
 * @returns {Promise<Object>} Den uppdaterade fastigheten
 */
export async function updateFastighet(id, fastighetData) {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    request.input('id', sql.NVarChar, id);
    request.input('namn', sql.NVarChar, fastighetData.name);
    request.input('beskrivning', sql.NVarChar, fastighetData.description);
    request.input('adress', sql.NVarChar, fastighetData.address);
    request.input('pris', sql.Float, fastighetData.price);
    request.input('status', sql.NVarChar, fastighetData.status || 'available');
    request.input('utvald', sql.Bit, fastighetData.utvald || false);
    request.input('referenskod', sql.NVarChar, fastighetData.referenskod || '');
    
    // Extra fält som är specifika för din databas
    request.input('boyta', sql.Float, fastighetData.area);
    request.input('antalRum', sql.Float, fastighetData.rooms);
    request.input('antalBaddar', sql.Int, fastighetData.antalBaddar || null);
    request.input('land', sql.NVarChar, fastighetData.land || 'Sverige');
    request.input('husdjurTillatet', sql.Bit, fastighetData.husdjurTillatet || false);
    request.input('rokfri', sql.Bit, fastighetData.rokfri || false);
    request.input('uthyresMoblerad', sql.Bit, fastighetData.uthyresMoblerad || false);
    request.input('veckoavgiftLag', sql.Float, fastighetData.veckoavgiftLag || fastighetData.monthlyFee);
    request.input('veckoavgiftHog', sql.Float, fastighetData.veckoavgiftHog || fastighetData.monthlyFee);
    
    const result = await request.query(`
      UPDATE Fastigheter 
      SET Namn = @namn, 
          Beskrivning = @beskrivning, 
          Adress = @adress, 
          Pris = @pris, 
          Status = @status, 
          Utvald = @utvald,
          Referenskod = @referenskod,
          Boyta = @boyta, 
          AntalRum = @antalRum, 
          AntalBaddar = @antalBaddar, 
          Land = @land, 
          HusdjurTillatet = @husdjurTillatet, 
          Rokfri = @rokfri, 
          UthyresMoblerad = @uthyresMoblerad, 
          VeckoavgiftLag = @veckoavgiftLag, 
          VeckoavgiftHog = @veckoavgiftHog, 
          SenastUppdaterad = GETDATE()
      OUTPUT INSERTED.*
      WHERE ID = @id;
    `);
    
    if (result.recordset.length === 0) {
      throw new Error('Fastigheten hittades inte eller kunde inte uppdateras');
    }
    
    // Konvertera till admin-format för konsistent respons
    const record = result.recordset[0];
    return {
      id: record.ID,
      name: record.Namn,
      description: record.Beskrivning,
      address: record.Adress,
      price: record.Pris,
      status: record.Status,
      referenskod: record.Referenskod,
      area: record.Boyta,
      rooms: record.AntalRum,
      monthlyFee: record.VeckoavgiftLag,
      antalBaddar: record.AntalBaddar,
      land: record.Land,
      husdjurTillatet: record.HusdjurTillatet === true || record.HusdjurTillatet === 1,
      rokfri: record.Rokfri === true || record.Rokfri === 1,
      uthyresMoblerad: record.UthyresMoblerad === true || record.UthyresMoblerad === 1,
      veckoavgiftLag: record.VeckoavgiftLag,
      veckoavgiftHog: record.VeckoavgiftHog,
      utvald: record.Utvald === true || record.Utvald === 1
    };
  } catch (error) {
    console.error(`Fel vid uppdatering av fastighet med ID ${id}:`, error);
    throw error;
  }
}

/**
 * Raderar en fastighet
 * @param {string} id - Fastighetens ID
 * @returns {Promise<boolean>} Om raderingen lyckades
 */
export async function deleteFastighet(id) {
  try {
    // Vänta på att poolen är ansluten
    await poolConnect;
    
    // Skapa en ny request
    const request = new sql.Request(pool);
    request.input('id', sql.NVarChar, id);
    
    // Transaktionsstart
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      const requestWithTransaction = new sql.Request(transaction);
      requestWithTransaction.input('id', sql.NVarChar, id);
      
      // Kontrollera om tabellerna finns innan radering
      
      // Kontrollera Bokningar
      const bokningarExists = await requestWithTransaction.query(`
        SELECT CASE WHEN EXISTS (
          SELECT * FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_NAME = 'Bokningar'
        ) THEN 1 ELSE 0 END AS TableExists
      `);
      
      if (bokningarExists.recordset[0].TableExists) {
        // Radera bokningar för denna fastighet
        await requestWithTransaction.query(`DELETE FROM Bokningar WHERE FastighetID = @id`);
      }
      
      // Kontrollera FastighetBekvamligheter
      const bekvamlighetExists = await requestWithTransaction.query(`
        SELECT CASE WHEN EXISTS (
          SELECT * FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_NAME = 'FastighetBekvamligheter'
        ) THEN 1 ELSE 0 END AS TableExists
      `);
      
      if (bekvamlighetExists.recordset[0].TableExists) {
        // Radera bekvämligheter för denna fastighet
        await requestWithTransaction.query(`DELETE FROM FastighetBekvamligheter WHERE FastighetID = @id`);
      }
      
      // Kontrollera Bilder
      const bilderExists = await requestWithTransaction.query(`
        SELECT CASE WHEN EXISTS (
          SELECT * FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_NAME = 'Bilder'
        ) THEN 1 ELSE 0 END AS TableExists
      `);
      
      if (bilderExists.recordset[0].TableExists) {
        // Radera bilder för denna fastighet
        await requestWithTransaction.query(`DELETE FROM Bilder WHERE FastighetID = @id`);
      }
      
      // Till sist, radera själva fastigheten
      const result = await requestWithTransaction.query(`DELETE FROM Fastigheter WHERE ID = @id`);
      
      // Commit transaktion
      await transaction.commit();
      
      return result.rowsAffected[0] > 0;
    } catch (transactionError) {
      // Rollback vid fel
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error(`Fel vid radering av fastighet med ID ${id}:`, error);
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