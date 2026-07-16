import { Analytics } from '@vercel/analytics/react'; // 🌟 THE FIX: Changed from /next to /react
 
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
 
export default MyApp;