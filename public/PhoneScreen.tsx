import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { IoMdHome, MdOutlineKeyboardReturn, FaPowerOff } from "./icons/icons.js";

type ScreenProps = {baseUrl: string; serial: string };

// import { DeviceControl } from './DeviceControl.js';
import { RemoteDeviceWs } from './services/RemoteDeviceWs.js';
import { KeyCodesMap } from './services/KeyCodes.js';
import { CDPListItem, RemoteDroidDeviceApi } from './services/RemoteDroidDeviceApi.js';
import { ChromeTabView } from './ChromeTabView.js';

export function PhoneScreen({ baseUrl, serial }: ScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [deviceWs, setDeviceWs] = useState<RemoteDeviceWs | null>(null);
  const redmoteApi = new RemoteDroidDeviceApi(baseUrl, serial);
  const [deviceProps, setDeviceProps] = useState<Record<string, string>>({});
  const [tabs, setTabs] = useState<CDPListItem[]>([]);

  useEffect(() => {
    async function getData() {
      const props = await redmoteApi.getProps("gsm.sim.operator.alpha,ro.product.system.model");
      const chromeVersion = await redmoteApi.getChromeVersion();
      props['chrome.version'] = chromeVersion;
      setDeviceProps(props);
      console.log(props);
    };
    getData();
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let isDragging = false;

    const toPent = (event: MouseEvent | TouchEvent | Touch): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      let x = 0;
      let y = 0;

      if (event instanceof MouseEvent || event instanceof Touch) {
        x = event.clientX;
        y = event.clientY;
      } else if (event instanceof TouchEvent) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      } else {
        throw Error('event is not MouseEvent or TouchEvent');
      }
      let px = x - rect.left;
      let py = y - rect.top;
      px /= rect.width;
      py /= rect.height;
      return [px, py];
    };

    let dragStart: [number, number] = [0, 0];

    // Mouse events
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStart = toPent(e);
      deviceWs?.screenMouseDown(...dragStart);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      deviceWs?.screenMouseDrag(...toPent(e));
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;
      deviceWs?.screenMouseUp(...toPent(e));
    };
    // const onClick = (e: MouseEvent) => {
    //   deviceWs?.screenMouseUp(...toPent(e));
    // };

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      dragStart = toPent(e);
      isDragging = true;
      deviceWs?.screenMouseDown(...dragStart);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const touch = (e.changedTouches && e.changedTouches[0]) || null;
      if (!touch) return;
      deviceWs?.screenMouseUp(...toPent(touch));
    };

    const onKeyPress = (e: KeyboardEvent) => {
      deviceWs?.screenKeypress(e);
    };

    // const onKeyDown = (e: KeyboardEvent) => {
    //   if (deviceWs) {
    //     deviceWs.keyDown(e.keyCode);
    //   }
    // };
    // const onKeyUp = (e: KeyboardEvent) => {
    //   if (deviceWs) {
    //     deviceWs.keyUp(e.keyCode);
    //   }
    // };
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    // canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('keypress', onKeyPress);
    // canvas.addEventListener('keydown', onKeyDown);
    // canvas.addEventListener('keyup', onKeyUp);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      // canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('keypress', onKeyPress);
      // canvas.removeEventListener('keydown', onKeyDown);
      // canvas.removeEventListener('keyup', onKeyUp);
    };
  }, [canvasRef, deviceWs]);

  useEffect(() => {
    if (!serial) return;
    console.log('serial', serial);
    const ws = redmoteApi.remoteDeviceWs;
    setDeviceWs(ws);
    console.log('Set setDeviceWs');
    ws.onMJPEG = (blob: Blob) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        }
        URL.revokeObjectURL(img.src);
      };
    };
    return () => {
      console.log('Close setDeviceWs');
      ws.close();
    };
  }, [serial]);

  return (
    <div style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', margin: '12px 0' }}>serial:{serial}</div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <canvas 
            ref={canvasRef} 
            tabIndex={0} 
            style={{ 
              touchAction: 'none', 
              userSelect: 'none', 
              width: '20vw' 
            }} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12, gap: 6 }}>
          {/* Example button bar, replace/add buttons as needed */}
          <button type="button" style={{ padding: '4px 8px' }} onClick={() => deviceWs?.keyPress(KeyCodesMap.KEYCODE_BACK)}><MdOutlineKeyboardReturn size={24} /></button>
          <button type="button" style={{ padding: '4px 8px' }} onClick={() => deviceWs?.keyPress(KeyCodesMap.KEYCODE_HOME)}><IoMdHome size={24} /></button>
          <button type="button" style={{ padding: '4px 8px' }} onClick={() => deviceWs?.keyPress(KeyCodesMap.KEYCODE_POWER)}><FaPowerOff size={24} /></button>
          <button type="button" style={{ padding: '4px 8px' }} onClick={async () => {
            const tabs = await redmoteApi.getCdpJson();
            setTabs(tabs);
          }}>CDP JSON</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12, gap: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <div style={{ fontWeight: 'bold' }}>Model:</div>
            <div>{deviceProps['ro.product.system.model']}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <div style={{ fontWeight: 'bold' }}>Operator:</div>
            <div>{deviceProps['gsm.sim.operator.alpha']}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <div style={{ fontWeight: 'bold' }}>Chrome:</div>
            <div>{deviceProps['chrome.version']}</div>
          </div>
        </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginLeft: 12, gap: 6 }}>
          {tabs.map((tab: CDPListItem) => (
            <ChromeTabView key={tab.id} tab={tab} redmoteApi={redmoteApi} />
          ))}
      </div>
    </div>
  );
}
