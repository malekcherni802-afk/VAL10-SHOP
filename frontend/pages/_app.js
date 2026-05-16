import '../styles/globals.css';
import { useEffect } from 'react';
import CustomCursor from '../components/ui/CustomCursor';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    document.body.style.visibility = 'visible';
  }, []);

  return (
    <>
      <div className="grain-overlay" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />
      <CustomCursor />
      <Component {...pageProps} />
    </>
  );
}
