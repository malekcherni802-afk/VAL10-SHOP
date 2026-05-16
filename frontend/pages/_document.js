import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="VALIO — Gothic Luxury Fashion. Wear the Darkness." />
        <meta property="og:title" content="VALIO" />
        <meta property="og:description" content="Gothic Luxury Fashion. Enter the darkness." />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🖤</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body style={{ visibility: 'hidden', background: '#000' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
