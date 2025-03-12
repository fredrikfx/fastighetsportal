// components/Header.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Navigeringsalternativ
  const navigation = [
    { name: 'Hem', href: '/' },
    { name: 'Fastigheter', href: '/fastigheter' },
    { name: 'Om oss', href: '/om-oss' },
    { name: 'Kontakt', href: '/kontakt' },
  ];
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logotyp */}
          <Link href="/" className="flex items-center">
            <span className="text-blue-600 text-2xl font-bold">Fastigheter</span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-medium transition-colors duration-200 ${
                  router.pathname === item.href
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Kontaktknapp */}
          <div className="hidden md:block">
            <Link
              href="/kontakt"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Kontakta oss
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Öppna meny</span>
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-2 py-1 text-base font-medium ${
                    router.pathname === item.href
                      ? 'text-blue-600 bg-blue-50 rounded-md'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/kontakt"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-center transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kontakta oss
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}