// pages/_app.js
import '../styles/globals.css';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Sidan för admin visas utan Layout
  if (router.pathname.startsWith('/admin')) {
    return <Component {...pageProps} />;
  }
  
  return (
    <>
      <Head>
        <title>Fastigheter - Hitta ditt drömhem</title>
        <meta name="description" content="Upptäck exklusiva fastigheter på de bästa platserna. Vi hjälper dig hitta ditt drömhem." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;