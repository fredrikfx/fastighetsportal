// components/DefaultPlaceholder.js
export default function DefaultPlaceholder({ width = 800, height = 600, className = "" }) {
  // Skapa en enkel SVG som platshållare
  const placeholderSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <rect x="10%" y="30%" width="80%" height="40%" fill="#e2e8f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#94a3b8" text-anchor="middle" alignment-baseline="middle">Ingen bild tillgänglig</text>
    </svg>
  `;
  
  // Konvertera SVG till data URL
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(placeholderSvg)}`;
  
  return (
    <div 
      className={`relative bg-slate-100 flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      <img 
        src={svgDataUrl} 
        alt="Ingen bild tillgänglig" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}