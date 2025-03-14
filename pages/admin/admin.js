// pages/admin.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminPage() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    price: '',
    status: 'available',
    area: '',
    rooms: '',
    monthlyFee: '',
    // Specialfält för ditt system
    antalBaddar: '',
    land: 'Sverige',
    husdjurTillatet: false,
    rokfri: false,
    uthyresMoblerad: false,
    veckoavgiftLag: '',
    veckoavgiftHog: '',
    utvald: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Hämta alla fastigheter vid sidladdning
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/fastigheter');
        const data = await response.json();
        
        if (response.ok) {
          setProperties(data);
        } else {
          throw new Error(data.message || 'Något gick fel vid hämtning av fastigheter');
        }
      } catch (error) {
        console.error('Fel vid hämtning:', error);
        setMessage({ text: error.message, type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Uppdatera formuläret när en fastighet väljs
  useEffect(() => {
    if (selectedProperty) {
      setFormData({
        name: selectedProperty.namn || '',
        description: selectedProperty.beskrivning || '',
        address: selectedProperty.adress || '',
        price: selectedProperty.pris || '',
        status: selectedProperty.status || 'available',
        area: selectedProperty.boyta || '',
        rooms: selectedProperty.antalRum || '',
        monthlyFee: selectedProperty.veckoavgiftLag || '',
        // Specialfält
        antalBaddar: selectedProperty.antalBaddar || '',
        land: selectedProperty.land || 'Sverige',
        husdjurTillatet: selectedProperty.husdjurTillatet || false,
        rokfri: selectedProperty.rokfri || false,
        uthyresMoblerad: selectedProperty.uthyresMoblerad || false,
        veckoavgiftLag: selectedProperty.veckoavgiftLag || '',
        veckoavgiftHog: selectedProperty.veckoavgiftHog || '',
        utvald: selectedProperty.utvald || false
      });
    }
  }, [selectedProperty]);

  // Hantera val av fastighet
  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setMessage({ text: '', type: '' });
  };

  // Hantera formulärändringar
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // För checkboxar, använd checked-värdet
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } 
    // För numeriska fält, konvertera till nummer
    else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseFloat(value) : '',
      }));
    }
    // För övriga fält, använd värdet direkt
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Hantera formulär submit (uppdatera fastighet)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProperty) {
      setMessage({ text: 'Välj en fastighet först', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/fastigheter/${selectedProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Uppdatera listan med fastigheter
        setProperties((prevProperties) =>
          prevProperties.map((prop) =>
            prop.id === selectedProperty.id 
              ? { 
                  ...prop, 
                  namn: formData.name,
                  beskrivning: formData.description,
                  adress: formData.address,
                  pris: formData.price,
                  status: formData.status,
                  boyta: formData.area,
                  antalRum: formData.rooms,
                  antalBaddar: formData.antalBaddar,
                  land: formData.land,
                  husdjurTillatet: formData.husdjurTillatet,
                  rokfri: formData.rokfri,
                  uthyresMoblerad: formData.uthyresMoblerad,
                  veckoavgiftLag: formData.veckoavgiftLag,
                  veckoavgiftHog: formData.veckoavgiftHog,
                  utvald: formData.utvald
                } 
              : prop
          )
        );
        setMessage({ text: 'Fastigheten har uppdaterats', type: 'success' });
      } else {
        throw new Error(data.message || 'Något gick fel vid uppdatering av fastigheten');
      }
    } catch (error) {
      console.error('Fel vid uppdatering:', error);
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Hantera radering av fastighet
  const handleDelete = async () => {
    if (!selectedProperty || !window.confirm('Är du säker på att du vill radera denna fastighet?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/fastigheter/${selectedProperty.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Ta bort fastigheten från listan
        setProperties((prevProperties) =>
          prevProperties.filter((prop) => prop.id !== selectedProperty.id)
        );
        setSelectedProperty(null);
        setFormData({
          name: '',
          description: '',
          address: '',
          price: '',
          status: 'available',
          area: '',
          rooms: '',
          monthlyFee: '',
          antalBaddar: '',
          land: 'Sverige',
          husdjurTillatet: false,
          rokfri: false,
          uthyresMoblerad: false,
          veckoavgiftLag: '',
          veckoavgiftHog: '',
          utvald: false
        });
        setMessage({ text: 'Fastigheten har raderats', type: 'success' });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Något gick fel vid radering av fastigheten');
      }
    } catch (error) {
      console.error('Fel vid radering:', error);
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Hantera skapande av ny fastighet
  const handleCreateNew = () => {
    setSelectedProperty(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      price: '',
      status: 'available',
      area: '',
      rooms: '',
      monthlyFee: '',
      antalBaddar: '',
      land: 'Sverige',
      husdjurTillatet: false,
      rokfri: false,
      uthyresMoblerad: false,
      veckoavgiftLag: '',
      veckoavgiftHog: '',
      utvald: false
    });
    setMessage({ text: '', type: '' });
  };

  // Hantera spara ny fastighet
  const handleSaveNew = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/fastigheter/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Anpassa data till frontenden
        const newProperty = {
          id: data.id,
          namn: data.name,
          beskrivning: data.description,
          adress: data.address,
          pris: data.price,
          status: data.status,
          boyta: data.area,
          antalRum: data.rooms,
          antalBaddar: data.antalBaddar,
          land: data.land,
          husdjurTillatet: data.husdjurTillatet,
          rokfri: data.rokfri,
          uthyresMoblerad: data.uthyresMoblerad,
          veckoavgiftLag: data.veckoavgiftLag,
          veckoavgiftHog: data.veckoavgiftHog,
          utvald: data.utvald
        };
        
        // Lägg till den nya fastigheten i listan
        setProperties((prevProperties) => [...prevProperties, newProperty]);
        setSelectedProperty(newProperty);
        setMessage({ text: 'Ny fastighet har skapats', type: 'success' });
      } else {
        throw new Error(data.message || 'Något gick fel vid skapande av fastigheten');
      }
    } catch (error) {
      console.error('Fel vid skapande:', error);
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin | Fastighetsportal</title>
        <meta name="description" content="Administrera fastigheter" />
      </Head>

      {/* Enkel header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-xl font-bold text-gray-900 cursor-pointer">
              Fastighetsportal
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer">
                Hem
              </Link>
              <Link href="/fastigheter" className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer">
                Fastigheter
              </Link>
              <Link href="/admin" className="text-blue-600 font-medium cursor-pointer">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Huvudinnehåll */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Fastighetsadministration</h1>
        
        {message.text && (
          <div 
            className={`p-4 mb-6 rounded-md ${
              message.type === 'error' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fastighetslista */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Fastigheter</h2>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Ny fastighet
              </button>
            </div>
            
            {isLoading && !properties.length ? (
              <p className="text-gray-500">Laddar fastigheter...</p>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {properties.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {properties.map((property) => (
                      <li key={property.id} className="py-3">
                        <button
                          onClick={() => handlePropertySelect(property)}
                          className={`w-full text-left px-3 py-2 rounded-md ${
                            selectedProperty && selectedProperty.id === property.id
                              ? 'bg-blue-100 text-blue-800'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium">{property.namn}</div>
                          <div className="text-sm text-gray-500">
                            {property.adress}, {property.land}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Inga fastigheter hittades</p>
                )}
              </div>
            )}
          </div>

          {/* Redigeringsformulär */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedProperty ? 'Redigera fastighet' : 'Skapa ny fastighet'}
            </h2>
            
            <form onSubmit={selectedProperty ? handleSubmit : handleSaveNew}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Namn
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adress
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="land" className="block text-sm font-medium text-gray-700 mb-1">
                    Land
                  </label>
                  <input
                    type="text"
                    id="land"
                    name="land"
                    value={formData.land}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Pris (kr)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                    Boyta (m²)
                  </label>
                  <input
                    type="number"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Antal rum
                  </label>
                  <input
                    type="number"
                    id="rooms"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="antalBaddar" className="block text-sm font-medium text-gray-700 mb-1">
                    Antal bäddar
                  </label>
                  <input
                    type="number"
                    id="antalBaddar"
                    name="antalBaddar"
                    value={formData.antalBaddar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="veckoavgiftLag" className="block text-sm font-medium text-gray-700 mb-1">
                    Veckoavgift lågsäsong (kr)
                  </label>
                  <input
                    type="number"
                    id="veckoavgiftLag"
                    name="veckoavgiftLag"
                    value={formData.veckoavgiftLag}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="veckoavgiftHog" className="block text-sm font-medium text-gray-700 mb-1">
                    Veckoavgift högsäsong (kr)
                  </label>
                  <input
                    type="number"
                    id="veckoavgiftHog"
                    name="veckoavgiftHog"
                    value={formData.veckoavgiftHog}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="available">Tillgänglig</option>
                    <option value="reserved">Reserverad</option>
                    <option value="sold">Såld</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="husdjurTillatet"
                        name="husdjurTillatet"
                        checked={formData.husdjurTillatet}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-2"
                      />
                      <label htmlFor="husdjurTillatet" className="text-sm font-medium text-gray-700">
                        Husdjur tillåtet
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rokfri"
                        name="rokfri"
                        checked={formData.rokfri}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-2"
                      />
                      <label htmlFor="rokfri" className="text-sm font-medium text-gray-700">
                        Rökfri
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="uthyresMoblerad"
                        name="uthyresMoblerad"
                        checked={formData.uthyresMoblerad}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-2"
                      />
                      <label htmlFor="uthyresMoblerad" className="text-sm font-medium text-gray-700">
                        Uthyres möblerad
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="utvald"
                        name="utvald"
                        checked={formData.utvald}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-2"
                      />
                      <label htmlFor="utvald" className="text-sm font-medium text-gray-700">
                        Utvald fastighet
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Beskrivning
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                {selectedProperty && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    disabled={isLoading}
                  >
                    Radera
                  </button>
                )}
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? 'Sparar...' 
                    : selectedProperty 
                      ? 'Uppdatera' 
                      : 'Skapa'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Enkel footer */}
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Fastighetsportal. Alla rättigheter förbehållna.</p>
        </div>
      </footer>
    </div>
  );
}