import '../styles/globals.css';
import { useEffect } from 'react';
import CustomCursor from '../components/ui/CustomCursor';
import PageTransition from '../components/ui/PageTransition';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Prevent FOUC
    document.body.style.visibility = 'visible';
  }, []);

  return (
    <>
      <CustomCursor />
      <PageTransition />
      <Component {...pageProps} />
    </>
  );
}
