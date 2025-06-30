import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>FTC Scouting App</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
