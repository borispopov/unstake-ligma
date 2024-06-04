import { Buffer } from 'buffer';
import '../app/globals.css';
import type { AppProps } from 'next/app';

// Polyfill Buffer globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;