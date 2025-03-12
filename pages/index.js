// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function Home() {
  const [fastigheter, setFastigheter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Funktion för att välja rätt bild baserat på index
  const getImageForIndex = (index) => {
    if (index === 0) {
      return '/images/casa-muheve-1.JPG';
    } else if (index === 1) {
      return '/images/villa-solsken-1.JPG';
    } else {
      return '/images/apartment-marina-1.JPG';
    }
  };
  
  useEffect(() => {
    const fetchFastigheter = async () => {
      try {
        const response = await axios.get('/api/fastigheter');
        setFastigheter(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Det gick inte att hämta fastigheter. Försök igen senare.');
        setLoading(false);
      }
    };
    
    fetchFastigheter();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Laddar fastigheter...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md max-w-md">
          <p className="font-bold">Ett fel har uppstått</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Försök igen
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Våra Fastigheter</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Upptäck vårt utbud av premium fastigheter på attraktiva platser.</p>
        </header>
        
        {fastigheter.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fastigheter.map((fastighet, index) => (
              <Link 
                href={`/fastigheter/${fastighet.id}`} 
                key={fastighet.id}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 transform group-hover:scale-[1.02] group-hover:shadow-lg h-full flex flex-col">
                  {/* Bild - visar olika bilder baserat på index */}
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    <img 
                      src={getImageForIndex(index)} 
                      alt={fastighet.namn || 'Fastighet'} 
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    />
                    
                    {/* Pris */}
                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white px-4 py-2 font-bold">
                      {fastighet.pris ? fastighet.pris.toLocaleString() : '0'} kr
                    </div>
                  </div>
                  
                  {/* Information */}
                  <div className="p-6 flex-grow">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {fastighet.namn}
                    </h2>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p>{fastighet.adress || fastighet.location || 'Plats ej angiven'}</p>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center mt-4">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        fastighet.status === 'Tillgänglig' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <p className={`text-sm ${
                        fastighet.status === 'Tillgänglig' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {fastighet.status || 'Status ej angiven'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-xl text-gray-700">Inga fastigheter tillgängliga för tillfället.</p>
            <p className="text-gray-500 mt-2">Vänligen återkom senare för att se vårt uppdaterade utbud.</p>
          </div>
        )}
      </div>
    </div>
  );
}