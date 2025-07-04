import { useState } from 'preact/hooks';
import { CDPListItem } from './services/RemoteDroidDeviceApi.js';
import { RemoteDroidDeviceApi } from './services/RemoteDroidDeviceApi.js';

export function ChromeTabView({ tab, redmoteApi }: { tab: CDPListItem; redmoteApi: RemoteDroidDeviceApi }) {
  const [dump, setDump] = useState<string | null>("");

  async function cleanDump() {
  const text = await redmoteApi.getCdpTest(tab.webSocketDebuggerUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const nodes = doc.querySelectorAll('a[role="presentation"]');
  const elements = [...nodes];

  const cleanedTagsA = elements.map(e => {
    // e.querySelectorAll('img, svg, div[role="link"], [role="text"]').forEach(tag => tag.remove());
    e.querySelectorAll('div').forEach(tag => tag.remove());
    return e.outerHTML;
  });
  setDump(cleanedTagsA.join('\n\n\n'));
  }

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
        <button type="button" style={{ padding: '4px 8px', width: '100%' }} onClick={cleanDump}>
          Dump
        </button>
      </div>
      {dump && <pre>{dump}</pre>}
    </div>
  );
}
