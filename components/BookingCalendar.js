// components/BookingCalendar.js
import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { sv } from 'date-fns/locale';
import axios from 'axios';

export default function BookingCalendar({ fastighetId, onBookingSuccess }) {
  const [bokningar, setBokningar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Hämta bokningar för fastigheten
  useEffect(() => {
    async function fetchBokningar() {
      if (!fastighetId) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/bokningar/for-fastighet?fastighetId=${fastighetId}`);
        setBokningar(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Fel vid hämtning av bokningar:', error);
        setError('Kunde inte hämta bokningar för denna fastighet');
        setLoading(false);
      }
    }
    
    fetchBokningar();
  }, [fastighetId]);

  // Funktion för att kontrollera om ett datum är bokat
  const getDateStatus = (date) => {
    // Simulera några preliminärbokningar (ersätt med riktig logik efter behov)
    const prelimDates = [9, 10, 28].map(day => {
      const d = new Date(currentMonth);
      d.setDate(day);
      return d.toISOString().split('T')[0];
    });
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Kolla om datumet är bokat
    const isBooked = bokningar.some(booking => {
      const bookingStart = new Date(booking.startDatum).toISOString().split('T')[0];
      const bookingEnd = new Date(booking.slutDatum).toISOString().split('T')[0];
      return dateStr >= bookingStart && dateStr <= bookingEnd;
    });
    
    // Kollar om datumet är en preliminärbokning
    const isPreliminary = prelimDates.includes(dateStr);
    
    if (isBooked) return 'booked';
    if (isPreliminary) return 'prelim';
    if (date < new Date()) return 'past';
    return 'available';
  };

  // Gå till föregående månad
  const goToPrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Gå till nästa månad
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Generera kalenderdagar för nuvarande månad
  const getDaysInMonth = () => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: firstDay, end: lastDay });
  };
  
  // Få array av veckodagsnamn
  const weekdays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
  
  // Få array av dagar i månaden
  const daysInMonth = getDaysInMonth();
  
  // Beräkna indexet för den första dagen i månaden (0 = måndag, 6 = söndag)
  const getFirstDayIndex = () => {
    let index = daysInMonth[0].getDay() - 1;
    if (index < 0) index = 6; // Söndag blir 6
    return index;
  };
  
  // Visa laddningsstatus
  if (loading) {
    return <div className="flex justify-center my-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  // Visa eventuellt fel
  if (error) {
    return <div className="my-4 text-red-600">{error}</div>;
  }
  
  return (
    <div className="bg-white rounded-md shadow-md">
      <div className="bg-gray-800 text-white p-3 rounded-t-md flex justify-between items-center">
        <button 
          onClick={goToPrevMonth}
          className="text-white hover:bg-gray-700 p-1 rounded-full"
        >
          &larr;
        </button>
        <h3 className="font-bold text-center">
          {format(currentMonth, 'MMMM yyyy', { locale: sv })}
        </h3>
        <button 
          onClick={goToNextMonth}
          className="text-white hover:bg-gray-700 p-1 rounded-full"
        >
          &rarr;
        </button>
      </div>
      
      <div className="p-3">
        <p className="text-sm mb-2">Kolla om din önskade tid är tillgänglig för uthyrning.</p>
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map(day => (
            <div key={day} className="p-1 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Tomma celler för att anpassa första dagen i månaden */}
          {Array.from({ length: getFirstDayIndex() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="p-1"></div>
          ))}
          
          {/* Dagar i månaden */}
          {daysInMonth.map((day) => {
            const status = getDateStatus(day);
            
            let bgColor = 'bg-white';
            if (status === 'booked') bgColor = 'bg-red-100';
            if (status === 'prelim') bgColor = 'bg-yellow-100';
            if (status === 'available') bgColor = 'bg-green-100';
            if (status === 'past') bgColor = 'bg-gray-100';
            
            return (
              <div 
                key={day.toString()} 
                className={`text-center p-1 ${bgColor} border border-gray-200 rounded`}
              >
                <div className="text-sm">{format(day, 'd')}</div>
              </div>
            );
          })}
          
          {/* Tomma celler i slutet för att fylla ut sista raden */}
          {Array.from({ length: (7 - ((getFirstDayIndex() + daysInMonth.length) % 7)) % 7 }).map((_, index) => (
            <div key={`empty-end-${index}`} className="p-1"></div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4 p-3 border-t text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 border border-green-700 rounded mr-1"></div>
          <span className="text-xs">Ledig</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 border border-red-700 rounded mr-1"></div>
          <span className="text-xs">Bokad</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-700 rounded mr-1"></div>
          <span className="text-xs">Preliminärbokning</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-100 border border-gray-700 rounded mr-1"></div>
          <span className="text-xs">Passerad</span>
        </div>
      </div>
    </div>
  );
}