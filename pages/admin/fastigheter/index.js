// pages/admin/fastigheter/index.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
import axios from 'axios';

export default function AdminFastigheter() {
  const [fastigheter, setFastigheter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFastigheter = async () => {
      try {
        const response = await axios.get('/api/fastigheter');
        setFastigheter(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching properties: ', error);
        setError('Det gick inte att hämta fastigheter. Försök igen senare.');
        setLoading(false);
      }
    };
    
    fetchFastigheter();
  }, []);

  // Filtrera fastigheter baserat på sökterm
  const filteredFastigheter = fastigheter.filter(fastighet => {
    const searchValue = searchTerm.toLowerCase();
    return (
      fastighet.namn.toLowerCase().includes(searchValue) ||
      fastighet.adress.toLowerCase().includes(searchValue) ||
      fastighet.referenskod.toLowerCase().includes(searchValue)
    );
  });

  if (loading) return (
    <AdminLayout>
      <div className="text-center py-10">Laddar fastigheter...</div>
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
          <h1 className="text-3xl font-bold">Fastigheter</h1>
          <p className="text-gray-600">Hantera dina fastigheter</p>
        </div>
        <Link 
          href="/admin/fastigheter/new" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Lägg till ny
        </Link>
      </div>

      {/* Sökfält */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Sök fastigheter..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Fastighetstabell */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fastighet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adress
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pris
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referenskod
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFastigheter.map((fastighet) => (
                <tr key={fastighet.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fastighet.namn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{fastighet.adress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{fastighet.pris.toLocaleString()} kr</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      fastighet.status === 'Pågående' ? 'bg-green-100 text-green-800' :
                      fastighet.status === 'Avslutad' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {fastighet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{fastighet.referenskod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/fastigheter/${fastighet.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Visa
                      </Link>
                      <Link 
                        href={`/admin/fastigheter/edit/${fastighet.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Redigera
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(fastighet.id)}
                      >
                        Ta bort
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredFastigheter.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Inga fastigheter hittades
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}