// components/BookingCalendar.js
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, isWithinInterval, addDays, differenceInCalendarDays } from 'date-fns';
import { sv } from 'date-fns/locale';
import axios from 'axios';

export default function BookingCalendar({ fastighetId, onBookingSuccess }) {
  const [bokningar, setBokningar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [availability, setAvailability] = useState(null);
  
  // Formulärdata
  const [formData, setFormData] = useState({
    gastNamn: '',
    gastEmail: '',
    gastTelefon: '',
    meddelande: ''
  });
  
  // Formulärstatus
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  // Hämta bokningar för fastigheten
  useEffect(() => {
    async function fetchBokningar() {
      if (!fastighetId) return;
      
      setLoading(true);
      try {
        // Här använder vi en try-catch för att hantera eventuella fel
        // Om API:et eller tabellen inte fungerar, fortsätter vi ändå men med tomma bokningar
        const response = await axios.get(`/api/bokningar/${fastighetId}`);
        setBokningar(response.data);
      } catch (error) {
        console.error('Fel vid hämtning av bokningar:', error);
        // Vi sätter inte error här, eftersom vi kan fortsätta utan bokningar
        // Istället använder vi tomma bokningar, vilket betyder att alla datum är tillgängliga
        setBokningar([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBokningar();
  }, [fastighetId]);

  // Kontrollera tillgänglighet när datumen ändras
  useEffect(() => {
    async function checkAvailability() {
      if (!startDate || !endDate || !fastighetId) return;
      
      try {
        // Eftersom vi kanske inte har bokningar ännu, gör vi en enkel kontroll här först
        // Detta gör att kalenern fortsätter att fungera även om API:et inte är redo
        let isAvailable = true;
        
        try {
          const response = await axios.post('/api/bokningar/check-tillganglighet', {
            fastighetId,
            startDatum: format(startDate, 'yyyy-MM-dd'),
            slutDatum: format(endDate, 'yyyy-MM-dd')
          });
          
          setAvailability(response.data);
          isAvailable = response.data.available;
        } catch (error) {
          console.error('Fel vid kontroll av tillgänglighet:', error);
          // Om API:et inte fungerar, anta att datumen är tillgängliga
          setAvailability({ 
            available: true, 
            message: 'Datumen antas vara tillgängliga (kunde inte verifiera)' 
          });
        }
        
        // Om datumen är tillgängliga (eller om vi antar det), visa formuläret
        if (isAvailable) {
          setShowForm(true);
        }
      } catch (error) {
        console.error('Fel vid kontroll av tillgänglighet:', error);
      }
    }
    
    if (startDate && endDate) {
      checkAvailability();
    }
  }, [startDate, endDate, fastighetId]);

  // Funktion för att kontrollera om ett datum är bokat
  const isDateBooked = (date) => {
    // Om vi inte har några bokningar (t.ex. API-fel), anta att inga datum är bokade
    if (!bokningar || !Array.isArray(bokningar) || bokningar.length === 0) {
      return false;
    }
    
    return bokningar.some(booking => {
      // Kontrollera att booking har giltiga datumfält
      if (!booking.startDatum || !booking.slutDatum) return false;
      
      try {
        return isWithinInterval(date, {
          start: new Date(booking.startDatum),
          end: new Date(booking.slutDatum)
        });
      } catch (error) {
        console.error('Fel vid kontroll av datum:', error);
        return false;
      }
    });
  };

  // Hantera formulärändringar
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Hantera datumval
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    
    // Uppdatera datumen
    setStartDate(start);
    setEndDate(end);
    
    console.log("Datum valda:", start, end); // Debug-loggning
    
    // Om båda datum är valda, vänta på tillgänglighetskontroll i useEffect
    if (start && end) {
      console.log("Båda datum valda, useEffect kommer kontrollera tillgänglighet");
    } else {
      // Dölj formuläret om något datum tas bort
      setShowForm(false);
    }
  };

  // Forcera visa formuläret när användaren klickar på "Boka visning" knappen
  const handleBookingClick = () => {
    if (startDate && endDate) {
      console.log("Visar formulär efter klick på bokningsknapp");
      setShowForm(true);
    } else {
      alert('Vänligen välj ett start- och slutdatum först');
    }
  };

  // Skicka bokningsformulär
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validera datum
    if (!startDate || !endDate) {
      setFormStatus({
        submitting: false,
        success: false,
        error: 'Vänligen välj både start- och slutdatum'
      });
      return;
    }
    
    // Kontrollera tillgänglighet igen för säkerhetsskull om availability finns
    if (availability && !availability.available) {
      setFormStatus({
        submitting: false,
        success: false,
        error: 'Valda datum är tyvärr inte tillgängliga'
      });
      return;
    }
    
    // Börja skicka formulär
    setFormStatus({ submitting: true, success: false, error: null });
    
    try {
      // Skapa bokningsobjekt
      const bookingData = {
        fastighetId,
        startDatum: format(startDate, 'yyyy-MM-dd'),
        slutDatum: format(endDate, 'yyyy-MM-dd'),
        ...formData
      };
      
      // Försök skicka till API - om det misslyckas, hantera felet
      try {
        const response = await axios.post('/api/bokningar', bookingData);
        
        // Lyckad bokning
        setFormStatus({
          submitting: false,
          success: true,
          error: null
        });
        
        // Uppdatera bokningslistan
        setBokningar(prev => [...prev, response.data]);
        
        // Återställ formulär
        setFormData({
          gastNamn: '',
          gastEmail: '',
          gastTelefon: '',
          meddelande: ''
        });
        setStartDate(null);
        setEndDate(null);
        setShowForm(false);
        
        // Meddela föräldrakomponenten om lyckad bokning
        if (onBookingSuccess) {
          onBookingSuccess(response.data);
        }
      } catch (apiError) {
        console.error('API-fel vid bokning:', apiError);
        
        setFormStatus({
          submitting: false,
          success: false,
          error: 'Kunde inte spara bokningen just nu. Vänligen försök igen senare eller kontakta oss direkt.'
        });
      }
    } catch (error) {
      console.error('Fel vid bokning:', error);
      
      setFormStatus({
        submitting: false,
        success: false,
        error: 'Ett oväntat fel inträffade, vänligen försök igen'
      });
    }
  };

  // Visa loading-status
  if (loading) {
    return <div className="flex justify-center my-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  // Beräkna antal nätter och totala priset
  const nights = startDate && endDate ? 
    differenceInCalendarDays(endDate, startDate) : 0;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Boka din vistelse</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Välj datum för din vistelse:</label>
        
        {/* Anpassad kalender med ramar */}
        <div className="calendar-container border border-gray-300 rounded-lg overflow-hidden">
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            locale={sv}
            minDate={new Date()}
            monthsShown={1} // Visa bara en månad istället för två för att spara plats
            excludeDates={bokningar.flatMap(booking => {
              try {
                // Skapa en array av alla datum inom bokningsintervallet
                const dates = [];
                let currentDate = new Date(booking.startDatum);
                const endDate = new Date(booking.slutDatum);
                
                while (currentDate <= endDate) {
                  dates.push(new Date(currentDate));
                  currentDate = addDays(currentDate, 1);
                }
                
                return dates;
              } catch (error) {
                console.error('Fel vid skapande av datum för bokning:', error);
                return [];
              }
            })}
            dateFormat="yyyy-MM-dd"
            filterDate={date => !isDateBooked(date)}
            dayClassName={date => 
              isDateBooked(date) ? "bg-red-100 text-red-800" : undefined
            }
            calendarClassName="custom-calendar" // För anpassad styling
          />
        </div>
      </div>
      
      {/* Visa valda datum och nätter */}
      {startDate && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded">
          <p><strong>Valt datum:</strong> {format(startDate, 'yyyy-MM-dd', { locale: sv })}</p>
          {endDate && (
            <>
              <p><strong>Till datum:</strong> {format(endDate, 'yyyy-MM-dd', { locale: sv })}</p>
              <p><strong>Antal nätter:</strong> {nights}</p>
            </>
          )}
        </div>
      )}
      
      {/* Visa tillgänglighet */}
      {availability && (
        <div className={`p-3 rounded mb-4 border ${
          availability.available ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'
        }`}>
          {availability.message}
        </div>
      )}
      
      {/* Knapp för att visa formuläret */}
      {startDate && endDate && !showForm && (
        <button 
          onClick={handleBookingClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Boka visning
        </button>
      )}
      
      {/* Bokningsformulär */}
      {showForm && startDate && endDate && (
        <form onSubmit={handleSubmit} className="space-y-4 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Dina uppgifter</h3>
          
          <div>
            <label htmlFor="gastNamn" className="block text-sm font-medium text-gray-700">Namn *</label>
            <input
              type="text"
              id="gastNamn"
              name="gastNamn"
              value={formData.gastNamn}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="gastEmail" className="block text-sm font-medium text-gray-700">E-post *</label>
            <input
              type="email"
              id="gastEmail"
              name="gastEmail"
              value={formData.gastEmail}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="gastTelefon" className="block text-sm font-medium text-gray-700">Telefon</label>
            <input
              type="tel"
              id="gastTelefon"
              name="gastTelefon"
              value={formData.gastTelefon}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="meddelande" className="block text-sm font-medium text-gray-700">Meddelande</label>
            <textarea
              id="meddelande"
              name="meddelande"
              value={formData.meddelande}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          {formStatus.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {formStatus.error}
            </div>
          )}
          
          {formStatus.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              Din bokning har skickats! Vi återkommer så snart som möjligt med en bekräftelse.
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={formStatus.submitting}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={formStatus.submitting}
            >
              {formStatus.submitting ? 'Skickar...' : 'Boka nu'}
            </button>
          </div>
        </form>
      )}
      
      {/* Extra styling för kalendern */}
      <style jsx global>{`
        .react-datepicker {
          font-family: Arial, sans-serif;
          border: 1px solid #cbd5e0;
          border-radius: 0.5rem;
          overflow: hidden;
          width: 100%;
        }
        
        .react-datepicker__month-container {
          width: 100%;
        }
        
        .react-datepicker__header {
          background-color: #f0f5ff;
          border-bottom: 1px solid #e2e8f0;
          padding-top: 0.75rem;
        }
        
        .react-datepicker__day {
          margin: 0.2rem;
          border: 1px solid transparent;
          border-radius: 0.25rem;
        }
        
        .react-datepicker__day:hover {
          background-color: #ebf4ff;
        }
        
        .react-datepicker__day--selected,
        .react-datepicker__day--in-selecting-range,
        .react-datepicker__day--in-range {
          background-color: #4299e1;
          color: white;
        }
        
        .react-datepicker__day--keyboard-selected {
          background-color: #4299e1;
          color: white;
        }
        
        .react-datepicker__navigation {
          border: 0.45rem solid transparent;
          top: 1rem;
        }
        
        .react-datepicker__navigation--previous {
          border-right-color: #a0aec0;
          left: 1rem;
        }
        
        .react-datepicker__navigation--next {
          border-left-color: #a0aec0;
          right: 1rem;
        }
        
        .react-datepicker__day-name {
          color: #4a5568;
          font-weight: 500;
        }
        
        .custom-calendar {
          width: 100%;
        }
      `}</style>
    </div>
  );
}