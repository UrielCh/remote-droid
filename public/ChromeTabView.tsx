import { useState } from 'preact/hooks';
import { CDPListItem } from './services/RemoteDroidDeviceApi.js';
import { RemoteDroidDeviceApi } from './services/RemoteDroidDeviceApi.js';

export function ChromeTabView({ tab, redmoteApi }: { tab: CDPListItem; redmoteApi: RemoteDroidDeviceApi }) {
  const [dump, setDump] = useState<string | null>("");
  return (
    <div key={tab.id} style={{ marginBottom: '12px' }}>
      <div style={{ fontWeight: 'bold' }}>Title:</div>
      <div>{tab.title}</div>
      <div style={{ fontWeight: 'bold' }}>Description:</div>
      <div>{tab.description}</div>
      <div>
        <span style={{ fontWeight: 'bold' }}>Type:</span> <span>{tab.type}</span>
      </div>
      <div style={{ fontWeight: 'bold' }}>URL:</div>
      <div>
        <a href={tab.url} target="_blank" rel="noopener noreferrer">
          {tab.url.substring(0, 40)}...
        </a>
      </div>
      <div style={{ fontWeight: 'bold' }}>DevTools Frontend URL:</div>
      <a href={tab.devtoolsFrontendUrl} target="_blank" rel="noopener noreferrer">
        tab.devtoolsFrontendUrl
      </a>
      <div style={{ fontWeight: 'bold' }}>DevTools Frontend URL:</div>
      <a href={redmoteApi.patchWebSocketDebuggerUrl(tab.devtoolsFrontendUrl)} target="_blank" rel="noopener noreferrer">
        tab.devtoolsFrontendUrl
      </a>
      <div style={{ fontWeight: 'bold' }}>WebSocket Debugger URL:</div>
      <a href={redmoteApi.patchWebSocketDebuggerUrl(tab.webSocketDebuggerUrl)} target="_blank" rel="noopener noreferrer">
        webSocketDebuggerUrl
      </a>
      <div>
        <button type="button" style={{ padding: '4px 8px', width: '100%' }} onClick={async () => {
          const text = await redmoteApi.getCdpTest(tab.webSocketDebuggerUrl);
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const elements = [...doc.querySelectorAll('a[role="presentation"]')];

          // const filteredElements = elements.filter(e => !e.matches('div[role="heading"]'));
          // const filteredElements = elements.filter(e => !e.matches('img'));

          const tagsA = elements.map(e => e.outerHTML);

          // const tagsA = elements.map(e => e.outerHTML);
          // elements.forEach((element) => {
          //  const href = element.getAttribute('href');
          //  if (href) {
          //    const url = new URL(href);
          //    const pathname = url.pathname;
          //    const wsUrl = new URL(`fw/localabstract:chrome_devtools_remote${pathname}`, this.baseUrl);
          //    return wsUrl.toString();
          //  }
          //});

          setDump(tagsA.join('\n\n\n'));
          }}>
          Dump
        </button>
      </div>
      {dump && <pre>{dump}</pre>}
    </div>
  );
}
