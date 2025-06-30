import Head from 'next/head';

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
