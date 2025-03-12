// pages/admin/fastigheter/new.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import axios from 'axios';

export default function NewFastighet() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    namn: '',
    adress: '',
    pris: '',
    koordinater: '',
    agare: '',
    status: 'Pågående',
    referenskod: '',
    urlbad: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'pris' ? (value ? parseInt(value) : '') : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Här skulle vi göra ett API-anrop för att spara den nya fastigheten
      // Men eftersom vi inte implementerat det kompletta API:et ännu så simulerar vi ett framgångsrikt svar
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulera nätverksfördröjning
      
      // Navigera tillbaka till fastighetslistan
      router.push('/admin/fastigheter');
    } catch (error) {
      console.error('Error creating property: ', error);
      setError('Det gick inte att skapa fastigheten. Försök igen senare.');
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lägg till ny fastighet</h1>
        <p className="text-gray-600">Fyll i information om den nya fastigheten</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Namn
              </label>
              <input
                type="text"
                name="namn"
                value={formData.namn}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adress
              </label>
              <input
                type="text"
                name="adress"
                value={formData.adress}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pris (kr)
              </label>
              <input
                type="number"
                name="pris"
                value={formData.pris}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Koordinater
              </label>
              <input
                type="text"
                name="koordinater"
                value={formData.koordinater}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ägare
              </label>
              <input
                type="text"
                name="agare"
                value={formData.agare}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="Pågående">Pågående</option>
                <option value="Pausad">Pausad</option>
                <option value="Avslutad">Avslutad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referenskod
              </label>
              <input
                type="text"
                name="referenskod"
                value={formData.referenskod}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bild URL
              </label>
              <input
                type="text"
                name="urlbad"
                value={formData.urlbad}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {submitting ? 'Sparar...' : 'Spara fastighet'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}