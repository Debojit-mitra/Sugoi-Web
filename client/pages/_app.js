import React, { useEffect } from "react";
import Head from "next/head";
import { Provider } from "react-redux";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import Layout from "../src/components/common/Layout";
import store from "../src/redux/store";
import "../styles/globals.css";

// Create a client-side cache for emotion
const createEmotionCache = () => {
  return createCache({ key: "css", prepend: true });
};

const clientSideEmotionCache = createEmotionCache();

const MyApp = ({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}) => {
  useEffect(() => {
    // Remove the server-side injected CSS when hydrating
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>SUGOI - An Anime Streaming Platform</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta
          name="description"
          content="Stream and track your favorite anime series and movies"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Provider store={store}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </CacheProvider>
  );
};

export default MyApp;
