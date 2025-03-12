// lib/propertyMapper.js

/**
 * Konverterar bilddata till ett standardiserat format
 * @param {Array|Object|String} bilder - Bildinformation i olika format
 * @returns {Array} - Standardiserad array av bildobjekt
 */
function normalizeBilder(bilder) {
  if (!bilder) return [];
  
  // Om bilder redan är en array
  if (Array.isArray(bilder)) {
    return bilder.map(bild => {
      if (typeof bild === 'string') {
        return { imageURL: bild };
      } else if (typeof bild === 'object') {
        // Standardisera fältnamnen
        return {
          id: bild.id || bild.BildID || `img-${Math.random().toString(36).substr(2, 9)}`,
          imageURL: bild.imageURL || bild.url || bild.ImageURL || bild.src || '/images/placeholder.jpg',
          bildtext: bild.bildtext || bild.Bildtext || bild.alt || '',
          huvudbild: bild.huvudbild || bild.Huvudbild || false,
          ordning: bild.ordning || bild.Ordning || 0
        };
      }
      return { imageURL: '/images/placeholder.jpg' };
    });
  }
  
  // Om bilder är ett objekt (enstaka bild)
  if (typeof bilder === 'object') {
    return [{
      id: bilder.id || bilder.BildID || `img-${Math.random().toString(36).substr(2, 9)}`,
      imageURL: bilder.imageURL || bilder.url || bilder.ImageURL || bilder.src || '/images/placeholder.jpg',
      bildtext: bilder.bildtext || bilder.Bildtext || bilder.alt || '',
      huvudbild: bilder.huvudbild || bilder.Huvudbild || false,
      ordning: bilder.ordning || bilder.Ordning || 0
    }];
  }
  
  // Om bilder är en sträng (enstaka bild-URL)
  if (typeof bilder === 'string') {
    try {
      // Kontrollera om strängen är JSON
      const parsed = JSON.parse(bilder);
      return normalizeBilder(parsed);
    } catch (e) {
      // Om inte JSON, anta att det är en URL eller kommaseparerad lista
      if (bilder.includes(',')) {
        return bilder.split(',').map(url => ({ 
          imageURL: url.trim(),
          huvudbild: false
        }));
      }
      return [{ imageURL: bilder, huvudbild: true }];
    }
  }
  
  return [];
}

/**
 * Förbättrar ett enda fastighetsobjekt med ytterligare beräknade fält
 * @param {Object} property - Ett fastighetsobjekt från databasen
 * @returns {Object} Fastighetsobjektet med ytterligare fält
 */
export function enhanceProperty(property) {
  if (!property) {
    return null;
  }

  try {
    // Skapa en kopia för att undvika att ändra originalet
    const enhanced = { ...property };
    
    // Formatera datum om det finns
    if (enhanced.skapad) {
      try {
        enhanced.formattedDate = new Date(enhanced.skapad).toLocaleDateString('sv-SE');
      } catch (e) {
        console.warn('Kunde inte formatera datum:', e);
      }
    }
    
    // Generera displayName baserat på tillgänglig information
    enhanced.displayName = enhanced.namn || 
                          (enhanced.adress ? `Fastighet på ${enhanced.adress}` : 
                          `Fastighet ${enhanced.id}`);
    
    // Normalisera bilderna
    enhanced.bilder = normalizeBilder(enhanced.bilder);
    
    // Lägg till huvudbildUrl baserat på bilderna
    const huvudbild = enhanced.bilder.find(bild => bild.huvudbild);
    enhanced.huvudbildUrl = huvudbild ? huvudbild.imageURL : 
                           (enhanced.bilder.length > 0 ? enhanced.bilder[0].imageURL : 
                           '/images/placeholder.jpg');
    
    return enhanced;
  } catch (error) {
    console.error('Fel vid enhanceProperty:', error);
    // Returnera originalet vid fel
    return property;
  }
}

/**
 * Förbättrar en array av fastighetsobjekt
 * @param {Array} properties - Array av fastighetsobjekt
 * @returns {Array} Förbättrade fastighetsobjekt
 */
export function enhanceProperties(properties) {
  if (!properties) {
    console.warn('enhanceProperties anropades med null eller undefined');
    return [];
  }
  
  if (!Array.isArray(properties)) {
    console.warn('enhanceProperties anropades med något som inte är en array:', typeof properties);
    // Om det är ett enskilt objekt, behandla det som en array med ett element
    if (typeof properties === 'object') {
      return [enhanceProperty(properties)].filter(Boolean);
    }
    return [];
  }
  
  try {
    const enhanced = [];
    
    // Behandla varje fastighet individuellt för att undvika att hela processen kraschar
    for (let i = 0; i < properties.length; i++) {
      try {
        const enhancedProperty = enhanceProperty(properties[i]);
        if (enhancedProperty) {
          enhanced.push(enhancedProperty);
        }
      } catch (individualError) {
        console.error(`Fel vid förbättring av fastighet på index ${i}:`, individualError);
        // Lägg till originalet vid fel
        if (properties[i]) {
          enhanced.push(properties[i]);
        }
      }
    }
    
    return enhanced;
  } catch (error) {
    console.error('Generellt fel i enhanceProperties:', error);
    // Returnera originalen vid fel
    return properties;
  }
}