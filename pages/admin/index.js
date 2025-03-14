import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    fastigheter: 0,
    bokningar: 0,
    aktivaBokningar: 0,
    bilder: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Hämta antal fastigheter
        const fastighetResponse = await axios.get('/api/fastigheter');
        
        // Hämta antal bokningar
        const bokningResponse = await axios.get('/api/bokningar');
        const today = new Date();
        const aktivaBokningar = bokningResponse.data.filter(bokning => {
          const slutDate = new Date(bokning.slutdatum);
          return slutDate >= today;
        });
        
        // Hämta antal bilder
        const bilderResponse = await axios.get('/api/bilder');
        
        setStats({
          fastigheter: fastighetResponse.data.length,
          bokningar: bokningResponse.data.length,
          aktivaBokningar: aktivaBokningar.length,
          bilder: bilderResponse.data.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats: ', error);
        setError('Det gick inte att hämta statistik. Försök igen senare.');
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="text-center py-10">Laddar statistik...</div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="text-center py-10 text-red-500">{error}</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Välkommen till administratörspanelen för Fastighetsportalen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Antal fastigheter */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500">Fastigheter</h2>
              <p className="text-2xl font-semibold">{stats.fastigheter}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/fastigheter" className="text-sm text-blue-600 hover:underline">
              Visa alla
            </Link>
          </div>
        </div>

        {/* Antal bokningar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500">Totala bokningar</h2>
              <p className="text-2xl font-semibold">{stats.bokningar}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/bokningar" className="text-sm text-blue-600 hover:underline">
              Visa alla
            </Link>
          </div>
        </div>

        {/* Aktiva bokningar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500">Aktiva bokningar</h2>
              <p className="text-2xl font-semibold">{stats.aktivaBokningar}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/bokningar?filter=aktiva" className="text-sm text-blue-600 hover:underline">
              Visa aktiva
            </Link>
          </div>
        </div>

        {/* Antal bilder */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500">Bilder</h2>
              <p className="text-2xl font-semibold">{stats.bilder}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/bilder" className="text-sm text-blue-600 hover:underline">
              Hantera bilder
            </Link>
          </div>
        </div>
      </div>

      {/* Snabbåtgärder */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Snabbåtgärder</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/fastigheter/new" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold">Lägg till fastighet</h3>
            <p className="text-gray-600 text-sm">Skapa en ny fastighet i systemet</p>
          </Link>
          <Link href="/admin/bokningar/new" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold">Skapa bokning</h3>
            <p className="text-gray-600 text-sm">Registrera en ny bokning</p>
          </Link>
          <Link href="/admin/bilder/upload" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold">Ladda upp bilder</h3>
            <p className="text-gray-600 text-sm">Lägg till nya bilder för fastigheter</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}