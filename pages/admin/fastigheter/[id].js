// pages/fastigheter/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

// Enkel bildgalleri-komponent som är inbyggd (ingen extern import behövs)
const SimpleImageGallery = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Kontrollera om det finns giltiga bilder, annars visa platshållare
  if (!images || !Array.isArray(images) || images.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Ingen bild tillgänglig</p>
        </div>
      </div>
    );
  }
  
  // Debug - visa bilddata i konsolen
  console.log("Bilddata i galleriet:", images);
  
  // Navigeringsfunktioner
  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  // Hämta korrekt bildURL från olika möjliga format
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // Om bilden är en sträng, använd den direkt
    if (typeof image === 'string') return image;
    
    // Om bilden är ett objekt, försök hitta URL-egenskapen
    if (image.url) return image.url;
    if (image.src) return image.src;
    if (image.path) return image.path;
    
    return null;
  };
  
  // Aktuell bild som ska visas
  const currentImage = images[activeIndex];
  const currentImageUrl = getImageUrl(currentImage);
  
  console.log("Aktuell bildURL:", currentImageUrl);
  
  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
      {currentImageUrl ? (
        <img 
          src={currentImageUrl} 
          alt={`Fastighetsbild ${activeIndex + 1}`} 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("Fel vid laddning av bild:", currentImageUrl);
            e.target.onerror = null; // Förhindra oändlig loop
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' alignment-baseline='middle' fill='%23CBD5E1'%3EKunde inte ladda bild%3C/text%3E%3C/svg%3E";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">Bilden kunde inte visas</p>
          </div>
        </div>
      )}
      
      {/* Navigeringsknappar - endast om det finns mer än en bild */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrevious}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-3 shadow-md focus:outline-none transition-all duration-200"
            aria-label="Föregående bild"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-3 shadow-md focus:outline-none transition-all duration-200"
            aria-label="Nästa bild"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Bildräknare */}
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default function PropertyDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [fastighet, setFastighet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        // Hämta fastighetsdata
        console.log("Hämtar fastighet med ID:", id);
        const response = await axios.get(`/api/fastigheter/${id}`);
        console.log("Hämtad fastighetsdata:", response.data);
        setFastighet(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property data: ', error);
        setError('Det gick inte att hämta data för fastigheten. Försök igen senare.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Prepare images array from property data
  const prepareImages = (property) => {
    if (!property) return [];
    
    // Debug - visa bilddata i konsolen
    console.log("Bilddata från fastighet:", property.bilder);
    
    if (property.bilder && Array.isArray(property.bilder) && property.bilder.length > 0) {
      return property.bilder;
    }
    
    return [];
  };
  
  // Laddar-indikator med animation
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Laddar fastighetsdata...</p>
      </div>
    );
  }
  
  // Felhantering
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md max-w-md">
          <p className="font-bold">Ett fel har uppstått</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Tillbaka till startsidan
        </button>
      </div>
    );
  }
  
  // Om fastigheten inte hittas
  if (!fastighet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md max-w-md">
          <p className="font-bold">Fastigheten kunde inte hittas</p>
          <p>Fastigheten du söker finns inte eller har tagits bort.</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Tillbaka till startsidan
        </button>
      </div>
    );
  }
  
  // Förbereda bilderna från fastighetsdata
  const images = prepareImages(fastighet);
  console.log("Förberedd bildarray:", images);
  
  // Lägg till dessa hårdkodade testbilder
  const testImages = [
    './images/casa-muheve-1.JPG',
  './images/casa-muheve-2.JPG',
  './images/casa-muheve-3.JPG'
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Tillbaka-knapp */}
        <Link 
          href="/"
          className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Tillbaka till fastigheter
        </Link>
        
        {/* Huvudinnehåll */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Rubrik */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800">{fastighet.namn}</h1>
            <p className="text-xl text-gray-600 mt-1">{fastighet.adress}</p>
          </div>
          
          {/* Bildgalleri - använd testImages istället för images */}
          <div className="p-6 bg-gray-50">
            <SimpleImageGallery images={testImages} />
          </div>
          
          {/* Fastighetsinformation och bokning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Information */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information</h2>
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                {/* Pris */}
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">Pris</p>
                  <p className="text-2xl font-bold text-gray-900">{fastighet.pris ? fastighet.pris.toLocaleString() : 0} kr</p>
                </div>
                
                {/* Status */}
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">Status</p>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${fastighet.status === 'Tillgänglig' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className="text-lg text-gray-900">{fastighet.status}</p>
                  </div>
                </div>
                
                {/* Ägare */}
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">Ägare</p>
                  <p className="text-lg text-gray-900">{fastighet.agare}</p>
                </div>
                
                {/* Referenskod */}
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">Referenskod</p>
                  <p className="text-lg text-gray-900">{fastighet.referenskod || 'N/A'}</p>
                </div>
                
                {/* Senast uppdaterad */}
                <div>
                  <p className="text-gray-500 text-sm mb-1">Senast uppdaterad</p>
                  <p className="text-lg text-gray-900">
                    {new Date(fastighet.senastUppdaterad).toLocaleDateString('sv-SE')}
                  </p>
                </div>
              </div>
              
              {/* Beskrivning */}
              {fastighet.beskrivning && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Om fastigheten</h3>
                  <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                    <p className="text-gray-700 whitespace-pre-line">{fastighet.beskrivning}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bokning */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Boka</h2>
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <p className="text-gray-700 mb-6">Bokningskalender tillfälligt otillgänglig. Kontakta oss för att boka en visning av denna fastighet.</p>
                
                <div className="space-y-4">
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Kontakta oss för bokning
                  </button>
                  
                  <button 
                    className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Skicka e-post
                  </button>
                </div>
              </div>
              
              {/* Plats/karta */}
              {fastighet.adress && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Plats</h3>
                  <div className="bg-gray-50 rounded-lg p-6 shadow-sm h-60 flex items-center justify-center">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-600">{fastighet.adress}</p>
                      <p className="text-gray-500 text-sm mt-1">Kartan är tillfälligt otillgänglig</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}