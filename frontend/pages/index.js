import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import IntroOverlay from '../components/intro/IntroOverlay';

export default function Home() {
  const router = useRouter();
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    // Check if user already passed intro this session
    if (typeof window !== 'undefined') {
      const entered = sessionStorage.getItem('valio_entered');
      if (entered) {
        router.replace('/shop');
      }
    }
  }, []);

  const handleEnter = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('valio_entered', '1');
    }
    // Small delay to let portal animation finish
    setTimeout(() => {
      router.push('/shop');
    }, 200);
  };

  return (
    <>
      <Head>
        <title>VALIO — Wear the Darkness</title>
      </Head>
      <IntroOverlay onEnter={handleEnter} />
    </>
  );
}
