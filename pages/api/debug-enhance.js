// pages/api/debug-enhance.js
import { getFastigheter } from '../../lib/sql';
import { safeEnhance, debugProperties } from '../../lib/debugPropertyMapper';
import { enhanceProperties } from '../../lib/propertyMapper';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Hämta fastigheter
      console.log('Hämtar fastigheter för felsökning...');
      let fastigheter;
      try {
        fastigheter = await getFastigheter();
        console.log(`Lyckades hämta ${fastigheter?.length || 0} fastigheter`);
      } catch (fetchError) {
        console.error('Fel vid hämtning av fastigheter:', fetchError);
        return res.status(500).json({
          error: 'Database error',
          message: fetchError.message,
          stack: process.env.NODE_ENV === 'development' ? fetchError.stack : undefined
        });
      }
      
      // Kör diagnostik
      console.log('Kör diagnostik på fastighetsdata...');
      const diagnostics = debugProperties(fastigheter);
      
      // Försök förbättra med säker metod
      console.log('Försöker förbättra fastigheter med säker metod...');
      const safeResult = safeEnhance(fastigheter);
      
      // Försök förbättra med vanliga enhanceProperties
      console.log('Försöker förbättra fastigheter med vanlig enhanceProperties...');
      let standardEnhanceResult = {
        success: false,
        error: null
      };
      
      try {
        const enhanced = enhanceProperties(fastigheter);
        standardEnhanceResult.success = true;
        standardEnhanceResult.count = enhanced?.length || 0;
        standardEnhanceResult.sample = enhanced?.length ? enhanced[0] : null;
      } catch (enhanceError) {
        standardEnhanceResult.error = {
          message: enhanceError.message,
          stack: process.env.NODE_ENV === 'development' ? enhanceError.stack : undefined
        };
      }
      
      // Returnera komplett diagnosresultat
      return res.status(200).json({
        timestamp: new Date().toISOString(),
        diagnostics,
        safeEnhanceResult: {
          success: safeResult.success,
          errors: safeResult.errors,
          sampleData: safeResult.enhancedData && safeResult.isArray ? 
                     safeResult.enhancedData.slice(0, 1) : safeResult.enhancedData
        },
        standardEnhanceResult,
        rawDataSample: fastigheter?.length ? [fastigheter[0]] : []
      });
    } catch (error) {
      console.error('Generellt fel i debug-API:', error);
      return res.status(500).json({
        error: 'General error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}