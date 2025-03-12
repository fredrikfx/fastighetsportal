// pages/fastigheter/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamiskt importera komponenter
const ImageSlider = dynamic(() => import('../../components/ImageSlider'), {
  ssr: false,
  loading: () => (
    <div className="relative overflow-hidden rounded-lg h-96 bg-gray-200 flex items-center justify-center">
      <p>Laddar bildvisare...</p>
    </div>
  )
});

const BookingCalendar = dynamic(() => import('../../components/BookingCalendar'), {
  ssr: false,
  loading: () => (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Boka din vistelse</h2>
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  )
});

// Ikon-komponent baserad på bekvämlighetens id
function AmenityIcon({ id, finnsEj }) {
  const iconMap = {
    'garage': (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    'pool': (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    'luftkonditionering': (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    'default': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  };

  if (finnsEj) {
    return (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }

  return iconMap[id] || iconMap.default;
}

export default function PropertyDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [fastighet, setFastighet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      // Om id inte är tillgängligt än (pga. Next.js SSR), returnera tidigt
      if (!id) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("Hämtar fastighet med ID:", id);
        const response = await axios.get(`/api/fastigheter/${id}`);
        console.log("Hämtad fastighetsdata:", response.data);
        setFastighet(response.data);
        setLoading(false);
      } catch (apiError) {
        console.error("API-fel:", apiError);
        
        if (apiError.response) {
          const status = apiError.response.status;
          
          if (status === 404) {
            setError(`Fastigheten med ID "${id}" hittades inte.`);
          } else {
            setError(`Serverfel (${status}): ${apiError.response.data?.error || 'Okänt fel'}`);
          }
        } else if (apiError.request) {
          setError("Ingen respons från servern. Kontrollera din internetanslutning.");
        } else {
          setError(`Ett fel uppstod: ${apiError.message}`);
        }
        
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);
  
  // Förbereder bilddata för karusellen
  const getImages = () => {
    if (!fastighet) return [];
    
    // Om det finns en bilder-array
    if (fastighet.bilder && Array.isArray(fastighet.bilder) && fastighet.bilder.length > 0) {
      return fastighet.bilder;
    }
    
    // Om det bara finns en huvudbildUrl
    if (fastighet.huvudbildUrl) {
      return [{ imageURL: fastighet.huvudbildUrl, bildtext: fastighet.namn }];
    }
    
    // Fallback
    return [{ imageURL: '/images/placeholder.jpg', bildtext: 'Ingen bild tillgänglig' }];
  };

  // Hantera lyckad bokning
  const handleBookingSuccess = (booking) => {
    setBookingSuccess(true);
    
    // Visa meddelande i 5 sekunder
    setTimeout(() => {
      setBookingSuccess(false);
    }, 5000);
  };
  
  // Visa laddningsstatus
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Laddar fastighet...</h1>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Visa felmeddelande
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Fel: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <Link href="/" className="text-blue-500 hover:underline">
          Tillbaka till startsidan
        </Link>
      </div>
    );
  }
  
  // Visa fastighetsdetaljer
  if (!fastighet) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Ingen data hittades</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    );
  }
  
  // Huvudvisualisering av fastigheten
  return (
    <div className="container mx-auto p-4">
      {/* Tillbaka-knapp */}
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Tillbaka till alla fastigheter
        </Link>
      </div>
      
      {/* Meddelande om lyckad bokning */}
      {bookingSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Bokning skickad! </strong>
          <span className="block sm:inline">Din bokningsförfrågan har tagits emot och vi återkommer så snart som möjligt med en bekräftelse.</span>
        </div>
      )}
      
      {/* Fastighetstitel */}
      <h1 className="text-3xl font-bold mb-4">{fastighet.namn || 'Fastighet'}</h1>
      
      {/* Bildkarusell */}
      <div className="mb-6">
        <ImageSlider images={getImages()} />
      </div>
      
      {/* Nyckeldata rutor - 2x4 grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {fastighet.boyta && (
          <div className="text-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="text-gray-600 text-sm">Boyta</div>
            <div className="font-bold text-lg">{fastighet.boyta} m²</div>
          </div>
        )}
        {fastighet.antalRum && (
          <div className="text-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="text-gray-600 text-sm">Antal rum</div>
            <div className="font-bold text-lg">{fastighet.antalRum}</div>
          </div>
        )}
        {fastighet.antalBaddar && (
          <div className="text-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="text-gray-600 text-sm">Antal bäddar</div>
            <div className="font-bold text-lg">{fastighet.antalBaddar}</div>
          </div>
        )}
        {fastighet.land && (
          <div className="text-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="text-gray-600 text-sm">Land</div>
            <div className="font-bold text-lg">{fastighet.land}</div>
          </div>
        )}
        {fastighet.husdjurTillatet !== undefined && (
          <div className="text-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="text-gray-600 text-sm">Husdjur tillåtet</div>
            <div className="font-bold text-lg">{fastighet.husdjurTillatet ? 'Ja' : 'Nej'}</div>
          </div>
        )}
        {fastighet.rokfri !== undefined && (
          <div className="text-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="text-gray-600 text-sm">Rökfri</div>
            <div className="font-bold text-lg">{fastighet.rokfri ? 'Ja' : 'Nej'}</div>
          </div>
        )}
        {fastighet.uthyresMoblerad !== undefined && (
          <div className="text-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="text-gray-600 text-sm">Uthyres möblerad</div>
            <div className="font-bold text-lg">{fastighet.uthyresMoblerad ? 'Ja' : 'Nej'}</div>
          </div>
        )}
        {(fastighet.veckoavgiftLag || fastighet.veckoavgiftHog) && (
          <div className="text-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="text-gray-600 text-sm">Veckoavgift</div>
            <div className="font-bold text-lg">
              {(fastighet.veckoavgiftLag && fastighet.veckoavgiftHog && 
                fastighet.veckoavgiftLag !== fastighet.veckoavgiftHog) ? 
                `${fastighet.veckoavgiftLag} - ${fastighet.veckoavgiftHog} kr` : 
                `${fastighet.veckoavgiftLag || fastighet.veckoavgiftHog} kr`}
            </div>
          </div>
        )}
      </div>
      
      {/* Huvudinnehåll med två kolumner för detaljer och kalender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Vänster kolumn: Detaljer och beskrivning */}
        <div>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Detaljer</h2>
            <div className="space-y-2">
              {fastighet.adress && (
                <p><span className="font-medium">Adress:</span> {fastighet.adress}</p>
              )}
              {fastighet.pris !== undefined && (
                <p><span className="font-medium">Pris:</span> {new Intl.NumberFormat('sv-SE', { 
                  style: 'currency', 
                  currency: 'EUR',
                  maximumFractionDigits: 0 
                }).format(fastighet.pris)}</p>
              )}
              {fastighet.status && (
                <p><span className="font-medium">Status:</span> {fastighet.status}</p>
              )}
              {fastighet.agare && (
                <p><span className="font-medium">Kontaktperson:</span> {fastighet.agare}</p>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Beskrivning</h2>
            <p className="text-gray-700">{fastighet.beskrivning || 'Ingen beskrivning tillgänglig.'}</p>
          </div>
          
          {/* Bekvämligheter */}
          {fastighet.bekvamlighetLista && fastighet.bekvamlighetLista.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Bekvämligheter</h2>
              
              {/* Huvud-bekvämligheter med ikoner */}
              {fastighet.bekvamligheter?.Huvudbekvämligheter && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {fastighet.bekvamligheter.Huvudbekvämligheter.map(bek => (
                    <div key={bek.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="mr-3">
                        <AmenityIcon id={bek.id} finnsEj={bek.finnsEj} />
                      </div>
                      <span className={bek.finnsEj ? 'line-through text-gray-400' : ''}>
                        {bek.namn}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Alla bekvämligheter grupperade efter kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.keys(fastighet.bekvamligheter || {})
                  .filter(cat => cat !== 'Huvudbekvämligheter')
                  .sort((a, b) => a.localeCompare(b)) // Sortera kategorierna alfabetiskt
                  .map(kategori => (
                    <div key={kategori}>
                      <h3 className="font-medium text-lg mb-2">{kategori}</h3>
                      <ul className="space-y-2">
                        {fastighet.bekvamligheter[kategori]
                          .sort((a, b) => a.namn.localeCompare(b.namn)) // Sortera bekvämligheter alfabetiskt
                          .map(bek => (
                            <li key={bek.id} className="flex items-center">
                              <span className="mr-2">
                                <AmenityIcon id={bek.id} finnsEj={bek.finnsEj} />
                              </span>
                              <span className={bek.finnsEj ? 'line-through text-gray-400' : ''}>
                                {bek.namn}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Höger kolumn: Bokningskalender */}
        <div>
          <BookingCalendar fastighetId={id} onBookingSuccess={handleBookingSuccess} />
        </div>
      </div>
    </div>
  );
}