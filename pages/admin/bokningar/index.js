// pages/admin/bokningar/index.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

export default function AdminBokningar() {
  const [bokningar, setBokningar] = useState([]);
  const [fastigheter, setFastigheter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('alla');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hämta alla bokningar
        const bokningarResponse = await axios.get('/api/bokningar');
        
        // Hämta alla fastigheter för att kunna visa namn istället för ID
        const fastigheterResponse = await axios.get('/api/fastigheter');
        
        setBokningar(bokningarResponse.data);
        setFastigheter(fastigheterResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings: ', error);
        setError('Det gick inte att hämta bokningar. Försök igen senare.');
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

  // Filtrera bokningar baserat på status
  const filteredBokningar = bokningar.filter(bokning => {
    // Filtrera på status
    if (filter === 'aktiva') {
      const now = new Date();
      const slutDate = new Date(bokning.slutdatum);
      if (slutDate < now) return false;
    } else if (filter === 'bekräftade') {
      if (bokning.status !== 'Bekräftad') return false;
    } else if (filter === 'obekräftade') {
      if (bokning.status !== 'Obekräftad') return false;
    }
    
    // Filtrera på sökterm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        bokning.gastnamn.toLowerCase().includes(searchLower) ||
        bokning.gastEmail.toLowerCase().includes(searchLower) ||
        bokning.gastTelefon.includes(searchTerm) ||
        getFastighetNamn(bokning.fastighet).toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Uppdatera bokningsstatus
  const handleStatusChange = async (bokningId, newStatus) => {
    try {
      await axios.put(`/api/bokningar/${bokningId}`, { Status: newStatus });
      
      // Uppdatera lokal data
      setBokningar(bokningar.map(bokning => 
        bokning.id === bokningId ? { ...bokning, status: newStatus } : bokning
      ));
    } catch (error) {
      console.error('Error updating booking status: ', error);
      alert('Det gick inte att uppdatera bokningens status. Försök igen senare.');
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="text-center py-10">Laddar bokningar...</div>
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
          <h1 className="text-3xl font-bold">Bokningar</h1>
          <p className="text-gray-600">Hantera och övervaka bokningar</p>
        </div>
        <Link 
          href="/admin/bokningar/new" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Skapa ny bokning
        </Link>
      </div>

      {/* Filter och sök */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrera bokningar
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="alla">Alla bokningar</option>
            <option value="aktiva">Aktiva bokningar</option>
            <option value="bekräftade">Bekräftade bokningar</option>
            <option value="obekräftade">Obekräftade bokningar</option>
          </select>
        </div>

        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Sök bokningar
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              placeholder="Sök på namn, email, telefon..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bokningstabell */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fastighet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gäst
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBokningar.map((bokning) => (
                <tr key={bokning.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getFastighetNamn(bokning.fastighet)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bokning.gastnamn}</div>
                    <div className="text-sm text-gray-500">{bokning.gastEmail}</div>
                    <div className="text-sm text-gray-500">{bokning.gastTelefon}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(bokning.startdatum), 'yyyy-MM-dd')} - 
                      {format(new Date(bokning.slutdatum), 'yyyy-MM-dd')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.ceil((new Date(bokning.slutdatum) - new Date(bokning.startdatum)) / (1000 * 60 * 60 * 24))} nätter
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={bokning.status}
                      onChange={(e) => handleStatusChange(bokning.id, e.target.value)}
                      className={`text-sm rounded-full px-3 py-1 ${
                        bokning.status === 'Bekräftad' ? 'bg-green-100 text-green-800' :
                        bokning.status === 'Avbokad' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <option value="Obekräftad">Obekräftad</option>
                      <option value="Bekräftad">Bekräftad</option>
                      <option value="Avbokad">Avbokad</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/bokningar/${bokning.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detaljer
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => confirm('Är du säker på att du vill ta bort denna bokning?') && handleDelete(bokning.id)}
                      >
                        Ta bort
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredBokningar.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Inga bokningar hittades
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