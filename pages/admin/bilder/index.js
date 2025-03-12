// pages/admin/bilder/index.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

export default function AdminBilder() {
  const [bilder, setBilder] = useState([]);
  const [fastigheter, setFastigheter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterFastighet, setFilterFastighet] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hämta alla bilder
        const bilderResponse = await axios.get('/api/bilder');
        
        // Hämta alla fastigheter för att kunna visa namn istället för ID
        const fastigheterResponse = await axios.get('/api/fastigheter');
        
        setBilder(bilderResponse.data);
        setFastigheter(fastigheterResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images: ', error);
        setError('Det gick inte att hämta bilder. Försök igen senare.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Få fastighetens namn från dess ID
  const getFastighetNamn = (fastighetId) => {
    const fastighet = fastigheter.find(f => f.id === fastighetId);
    return fastighet ? fastighet.namn : 'Okänd fastighet';
  };

  // Sätt en bild som huvudbild
  const setAsMainImage = async (bildId, fastighetId) => {
    try {
      // Uppdatera alla bilder för fastigheten så att ingen är huvudbild
      const fastighetBilder = bilder.filter(bild => bild.fastighet === fastighetId);
      
      for (const bild of fastighetBilder) {
        if (bild.huvudbild) {
          await axios.put(`/api/bilder/${bild.id}`, {
            ...bild,
            huvudbild: false
          });
        }
      }
      
      // Sätt den valda bilden som huvudbild
      await axios.put(`/api/bilder/${bildId}`, {
        huvudbild: true
      });
      
      // Uppdatera lokal data
      setBilder(bilder.map(bild => {
        if (bild.fastighet === fastighetId) {
          return {
            ...bild,
            huvudbild: bild.id === bildId
          };
        }
        return bild;
      }));
    } catch (error) {
      console.error('Error setting main image: ', error);
      alert('Det gick inte att ändra huvudbild. Försök igen senare.');
    }
  };

  // Ta bort en bild
  const handleDelete = async (bildId) => {
    if (!confirm('Är du säker på att du vill ta bort denna bild?')) return;
    
    try {
      await axios.delete(`/api/bilder/${bildId}`);
      
      // Uppdatera lokal data
      setBilder(bilder.filter(bild => bild.id !== bildId));
    } catch (error) {
      console.error('Error deleting image: ', error);
      alert('Det gick inte att ta bort bilden. Försök igen senare.');
    }
  };

  // Filtrera bilder baserat på vald fastighet
  const filteredBilder = filterFastighet
    ? bilder.filter(bild => bild.fastighet === filterFastighet)
    : bilder;

  if (loading) return (
    <AdminLayout>
      <div className="text-center py-10">Laddar bilder...</div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="text-center py-10 text-red-500">{error}</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bildhantering</h1>
          <p className="text-gray-600">Hantera bilder för dina fastigheter</p>
        </div>
        <Link 
          href="/admin/bilder/upload" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Ladda upp nya bilder
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label htmlFor="filterFastighet" className="block text-sm font-medium text-gray-700 mb-1">
          Filtrera efter fastighet
        </label>
        <select
          id="filterFastighet"
          value={filterFastighet}
          onChange={(e) => setFilterFastighet(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Alla fastigheter</option>
          {fastigheter.map(fastighet => (
            <option key={fastighet.id} value={fastighet.id}>
              {fastighet.namn}
            </option>
          ))}
        </select>
      </div>

      {/* Bildgalleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBilder.map(bild => (
          <div key={bild.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-48">
              <Image 
                src={bild.imageURL} 
                alt={bild.bildtext || 'Fastighetsbild'} 
                layout="fill" 
                objectFit="cover"
              />
              {bild.huvudbild && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Huvudbild
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-medium">{getFastighetNamn(bild.fastighet)}</h3>
              <p className="text-sm text-gray-500">{bild.bildtext || 'Ingen beskrivning'}</p>
              
              <div className="mt-3 flex justify-between">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setAsMainImage(bild.id, bild.fastighet)}
                    disabled={bild.huvudbild}
                    className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded disabled:opacity-50"
                  >
                    Sätt som huvudbild
                  </button>
                  <button 
                    onClick={() => handleDelete(bild.id)}
                    className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded"
                  >
                    Ta bort
                  </button>
                </div>
                
                <span className="text-xs text-gray-500">
                  Ordning: {bild.ordning || 'Inte angiven'}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredBilder.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            Inga bilder hittades. {filterFastighet ? 'Försök med en annan fastighet eller ' : ''}
            <Link href="/admin/bilder/upload" className="text-blue-600 hover:underline">
              ladda upp nya bilder
            </Link>.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}