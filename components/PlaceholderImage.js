// components/PlaceholderImage.js
import { useState } from 'react';

export default function PlaceholderImage({ width = 800, height = 600, text = 'Ingen bild tillgänglig', className = '' }) {
  const [bgColor] = useState(() => {
    // Generera en slumpmässig pastellfärg
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 90%)`;
  });
  
  return (
    <div 
      className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: height ? `${height}px` : 'auto',
        aspectRatio: width && height ? `${width} / ${height}` : 'auto',
        backgroundColor: bgColor 
      }}
    >
      <div className="text-center p-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 mx-auto text-gray-400 mb-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}