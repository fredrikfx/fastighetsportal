// components/ImageSlider.js
import { useState } from 'react';

export default function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Standardisera bilddata
  const normalizedImages = images && images.length > 0 
    ? images.map(img => {
        // Om img är ett objekt med imageURL-fält
        if (img && typeof img === 'object' && img.imageURL) {
          return {
            src: img.imageURL,
            alt: img.bildtext || 'Fastighetsbild'
          };
        } 
        // Om img är en sträng (URL)
        else if (typeof img === 'string') {
          return {
            src: img,
            alt: 'Fastighetsbild'
          };
        }
        // Fallback
        return {
          src: '/images/placeholder.jpg',
          alt: 'Platshållarbild'
        };
      })
    : [{ src: '/images/placeholder.jpg', alt: 'Platshållarbild' }];

  // Navigera till föregående bild
  const prevSlide = () => {
    const newIndex = currentIndex === 0 
      ? normalizedImages.length - 1 
      : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  // Navigera till nästa bild
  const nextSlide = () => {
    const newIndex = currentIndex === normalizedImages.length - 1 
      ? 0 
      : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // Gå direkt till en specifik bild
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full">
      {/* Huvudbild */}
      <div className="relative overflow-hidden rounded-lg h-96 bg-gray-100">
        <img 
          src={normalizedImages[currentIndex].src} 
          alt={normalizedImages[currentIndex].alt}
          className="w-full h-full object-cover"
        />
        
        {/* Navigeringsknappar */}
        <button 
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full"
          aria-label="Föregående bild"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full"
          aria-label="Nästa bild"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Bildindikator */}
      <div className="flex justify-center mt-4 space-x-2">
        {normalizedImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex 
                ? 'bg-blue-600' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Gå till bild ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Miniatyrer */}
      <div className="mt-4 flex overflow-x-auto space-x-2 pb-2">
        {normalizedImages.map((image, index) => (
          <div 
            key={index}
            onClick={() => goToSlide(index)}
            className={`cursor-pointer flex-shrink-0 w-20 h-20 ${
              index === currentIndex 
                ? 'ring-2 ring-blue-500' 
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img 
              src={image.src} 
              alt={`Miniatyr ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
}