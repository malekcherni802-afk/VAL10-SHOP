import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="VALIO — Luxury Streetwear. Made for Legacy." />
        <meta property="og:title" content="VALIO" />
        <meta property="og:description" content="Luxury Streetwear. Made for Legacy." />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23000' width='100' height='100'/><text y='.9em' font-size='72' x='14' fill='%23d4a843'>V</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap"
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
