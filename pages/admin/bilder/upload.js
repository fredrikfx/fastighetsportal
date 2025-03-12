
// pages/admin/bilder/upload.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import axios from 'axios';

export default function UploadBilder() {
  const router = useRouter();
  const fileInputRef = useRef();
  const [fastigheter, setFastigheter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    fastighet: '',
    bildtext: '',
    huvudbild: false,
    ordning: 0
  });

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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Visa förhandsvisning av bilden
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fileInput = fileInputRef.current;
    if (!fileInput.files || fileInput.files.length === 0) {
      setError('Vänligen välj en bild att ladda upp.');
      return;
    }
    
    if (!formData.fastighet) {
      setError('Vänligen välj en fastighet.');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Simulera en filuppladdning
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Här skulle vi göra ett API-anrop för att ladda upp bilden
      // Men eftersom vi inte implementerat det kompletta API:et ännu så simulerar vi ett framgångsrikt svar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigera tillbaka till bildlistan
      router.push('/admin/bilder');
    } catch (error) {
      console.error('Error uploading image: ', error);
      setError('Det gick inte att ladda upp bilden. Försök igen senare.');
      setUploading(false);
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
        <h1 className="text-3xl font-bold">Ladda upp bilder</h1>
        <p className="text-gray-600">Lägg till nya bilder för dina fastigheter</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Välj bild *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
                required
              />
            </div>

            {imagePreview && (
              <div className="md:col-span-2 mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Förhandsvisning
                </label>
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  <img 
                    src={imagePreview} 
                    alt="Förhandsvisning" 
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}

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
                Bildtext
              </label>
              <input
                type="text"
                name="bildtext"
                value={formData.bildtext}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordning
              </label>
              <input
                type="number"
                name="ordning"
                value={formData.ordning}
                onChange={handleChange}
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="huvudbild"
                id="huvudbild"
                checked={formData.huvudbild}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="huvudbild" className="ml-2 block text-sm text-gray-900">
                Sätt som huvudbild
              </label>
            </div>
          </div>

          {uploading && (
            <div className="mt-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      Laddar upp
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                  <div style={{ width: `${uploadProgress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          )}

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
              disabled={uploading}
              className="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {uploading ? 'Laddar upp...' : 'Ladda upp bild'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );