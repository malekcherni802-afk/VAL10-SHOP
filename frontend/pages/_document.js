import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="VALIO — Dark Alternative Luxury Streetwear. Industrial. Cinematic. Uncompromising." />
        <meta property="og:title" content="VALIO" />
        <meta property="og:description" content="Industrial Gothic Luxury Streetwear." />
        <meta name="theme-color" content="#000000" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23000'/><text y='.9em' font-size='80' x='10'>V</text></svg>"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;600;700;800;900&family=Uncial+Antiqua&family=Space+Grotesk:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
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
