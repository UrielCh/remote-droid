import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

type ScreenProps = { prefix: string; serial: string };

// import { DeviceControl } from './DeviceControl.js';
import { RemoteDeviceWs } from './RemoteDeviceWs.js';

export function PhoneScreen({ prefix, serial }: ScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const deviceControl = new DeviceControl(prefix, serial);
  const [deviceWs, setDeviceWs] = useState<RemoteDeviceWs | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let isDragging = false;
    // type UsedCursor = "pointer" | "grabbing"; // 'default' | 'grab'

    const toPent = (event: MouseEvent | TouchEvent | Touch): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      let x = 0;
      let y = 0;

      if (event instanceof MouseEvent || event instanceof Touch) {
        x = event.clientX;
        y = event.clientY;
      }
      else if (event instanceof TouchEvent) {
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

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    // canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      // canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [canvasRef, deviceWs]);

  useEffect(() => {
    if (!prefix || !serial) return;
    console.log('prefix', prefix);
    console.log('serial', serial);
    const ws = new RemoteDeviceWs({ prefix, id: serial, type: 'device' });
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
  }, [prefix, serial]);

  return (
    <div>
      serial:{serial} XXX{!!deviceWs ? 'ok' : 'ko'}
      <canvas ref={canvasRef} style={{ touchAction: 'none', userSelect: 'none' }} />
    </div>
  );
}
