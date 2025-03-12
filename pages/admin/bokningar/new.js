// pages/admin/bokningar/new.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import axios from 'axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import sv from 'date-fns/locale/sv';
import 'react-datepicker/dist/react-datepicker.css';

// Registrera svensk datumformatering
registerLocale('sv', sv);

export default function NewBokning() {
  const router = useRouter();
  const [fastigheter, setFastigheter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fastighet: '',
    startdatum: null,
    slutdatum: null,
    gastnamn: '',
    gastEmail: '',
    gastTelefon: '',
    status: 'Obekräftad',
    anteckningar: ''
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (field, date) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fastighet || !formData.startdatum || !formData.slutdatum || !formData.gastnamn || !formData.gastEmail) {
      setError('Vänligen fyll i alla obligatoriska fält.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Här skulle vi göra ett API-anrop för att spara den nya bokningen
      // Men eftersom vi inte implementerat det kompletta API:et ännu så simulerar vi ett framgångsrikt svar
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulera nätverksfördröjning
      
      // Navigera tillbaka till bokningslistan
      router.push('/admin/bokningar');
    } catch (error) {
      console.error('Error creating booking: ', error);
      setError('Det gick inte att skapa bokningen. Försök igen senare.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="text-center py-10">Laddar...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Skapa ny bokning</h1>
        <p className="text-gray-600">Registrera en ny bokning i systemet</p>
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
                Fastighet *
              </label>
              <select
                name="fastighet"
                value={formData.fastighet}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Välj fastighet</option>
                {fastigheter.map(fastighet => (
                  <option key={fastighet.id} value={fastighet.id}>
                    {fastighet.namn}
                  </option>
                ))}
              </select>
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
                <option value="Obekräftad">Obekräftad</option>
                <option value="Bekräftad">Bekräftad</option>
                <option value="Avbokad">Avbokad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ankomstdatum *
              </label>
              <DatePicker
                selected={formData.startdatum}
                onChange={(date) => handleDateChange('startdatum', date)}
                selectsStart
                startDate={formData.startdatum}
                endDate={formData.slutdatum}
                minDate={new Date()}
                locale="sv"
                dateFormat="yyyy-MM-dd"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avresedatum *
              </label>
              <DatePicker
                selected={formData.slutdatum}
                onChange={(date) => handleDateChange('slutdatum', date)}
                selectsEnd
                startDate={formData.startdatum}
                endDate={formData.slutdatum}
                minDate={formData.startdatum || new Date()}
                locale="sv"
                dateFormat="yyyy-MM-dd"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gästens namn *
              </label>
              <input
                type="text"
                name="gastnamn"
                value={formData.gastnamn}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gästens e-post *
              </label>
              <input
                type="email"
                name="gastEmail"
                value={formData.gastEmail}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gästens telefon
              </label>
              <input
                type="tel"
                name="gastTelefon"
                value={formData.gastTelefon}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anteckningar
            </label>
            <textarea
              name="anteckningar"
              value={formData.anteckningar}
              onChange={handleChange}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            ></textarea>
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
              {submitting ? 'Sparar...' : 'Skapa bokning'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}