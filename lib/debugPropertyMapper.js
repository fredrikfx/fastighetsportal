// lib/debugPropertyMapper.js

/**
 * Loggar information om fastighetsobjekt för felsökning
 * @param {Object|Array} properties - Ett eller flera fastighetsobjekt
 * @returns {Object} Diagnostikinformation
 */
export function debugProperties(properties) {
    // Diagnostikresultat
    const result = {
      inputType: typeof properties,
      isArray: Array.isArray(properties),
      itemCount: Array.isArray(properties) ? properties.length : 0,
      sampleKeys: [],
      nullOrUndefined: !properties,
      diagnosticLog: []
    };
    
    // Logga information
    result.diagnosticLog.push(`Input type: ${result.inputType}`);
    
    if (result.nullOrUndefined) {
      result.diagnosticLog.push('Warning: Input is null or undefined');
      return result;
    }
    
    if (!result.isArray && result.inputType === 'object') {
      // Enskilt objekt
      result.sampleKeys = Object.keys(properties);
      result.diagnosticLog.push(`Single object with keys: ${result.sampleKeys.join(', ')}`);
      result.itemCount = 1;
    } else if (result.isArray) {
      // Array av objekt
      result.diagnosticLog.push(`Array with ${result.itemCount} items`);
      
      if (result.itemCount > 0) {
        const firstItem = properties[0];
        if (firstItem && typeof firstItem === 'object') {
          result.sampleKeys = Object.keys(firstItem);
          result.diagnosticLog.push(`First item keys: ${result.sampleKeys.join(', ')}`);
        } else {
          result.diagnosticLog.push(`Warning: First item is ${typeof firstItem}`);
        }
      }
    } else {
      result.diagnosticLog.push(`Warning: Unexpected input type: ${result.inputType}`);
    }
    
    return result;
  }
  
  /**
   * Säkert förbättrar ett fastighetsobjekt för felsökning
   * @param {Array|Object} properties - Ett eller flera fastighetsobjekt
   * @returns {Object} Förbättrade objekt och diagnostikinformation
   */
  export function safeEnhance(properties) {
    const result = {
      success: false,
      originalType: typeof properties,
      isArray: Array.isArray(properties),
      errors: [],
      enhancedData: null,
      debug: debugProperties(properties)
    };
    
    try {
      // Om null eller undefined
      if (!properties) {
        result.errors.push('Input is null or undefined');
        return result;
      }
      
      // Hantera både enskilta objekt och arrayer
      const toProcess = result.isArray ? properties : [properties];
      const enhanced = [];
      
      // Bearbeta varje objekt
      for (let i = 0; i < toProcess.length; i++) {
        try {
          const item = toProcess[i];
          // Enkel förbättring för felsökning
          const enhancedItem = {
            ...item,
            _debug_processed: true,
            _debug_index: i,
            _debug_timestamp: new Date().toISOString()
          };
          enhanced.push(enhancedItem);
        } catch (itemError) {
          result.errors.push(`Error enhancing item at index ${i}: ${itemError.message}`);
        }
      }
      
      // Sätt resultatet
      result.enhancedData = result.isArray ? enhanced : enhanced[0];
      result.success = true;
      
      return result;
    } catch (error) {
      result.errors.push(`General error: ${error.message}`);
      return result;
    }
  }