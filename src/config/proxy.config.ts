import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import * as https from 'https';
import * as http from 'http';

/**
 * Configure proxy for HTTP/HTTPS requests
 * This is needed when application runs behind a corporate proxy
 */
export function configureProxy() {
  const httpsProxy =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy;

  const httpProxy =
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    process.env.HTTPS_PROXY ||
    process.env.https_proxy;

  if (httpsProxy) {
    console.log(`Configuring HTTPS proxy: ${httpsProxy.split('@')[0]}...`);
    const httpsAgent = new HttpsProxyAgent(httpsProxy);
    (https.globalAgent as any) = httpsAgent;
  }

  if (httpProxy) {
    console.log(`Configuring HTTP proxy: ${httpProxy.split('@')[0]}...`);
    const httpAgent = new HttpProxyAgent(httpProxy);
    (http.globalAgent as any) = httpAgent;
  }

  if (!httpsProxy && !httpProxy) {
    console.log('No proxy configured');
  }
}
