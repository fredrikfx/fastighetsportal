// components/ImageGallery.js (testversion)
import { useState } from 'react';

export default function ImageGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Hårdkodade testbilder
  const testImages = [
    '/assets/images/casa-muheve-1.JPG',
    '/assets/images/casa-muheve-2.JPG',
    '/assets/images/casa-muheve-3.JPG'
  ];
  
  // Använd testbilder om inga bilder skickades in
  const displayImages = images && images.length > 0 ? images : testImages;
  
  // Navigeringsfunktioner
  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };
  
  // Aktuell bild
  const currentImage = displayImages[activeIndex];
  
  console.log("Visar bild:", currentImage);
  
  return (
    <div className="image-gallery">
      {/* Huvudbildvisning */}
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden shadow-lg mb-4">
        {/* Huvudbild */}
        <img 
          src={currentImage} 
          alt={`Fastighetsbild ${activeIndex + 1}`} 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("Fel vid laddning av bild:", currentImage);
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f1f5f9'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='24' fill='%2394a3b8' text-anchor='middle' alignment-baseline='middle'%3EBilden kunde inte laddas: " + currentImage + "%3C/text%3E%3C/svg%3E";
          }}
        />
        
        {/* Navigeringsknappar */}
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={handlePrevious}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-3 shadow-md focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-3 shadow-md focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}