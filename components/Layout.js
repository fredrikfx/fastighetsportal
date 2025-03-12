// components/Layout.js
import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
}