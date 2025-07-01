import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>FTCMetrics</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
