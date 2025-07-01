import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

type ScreenProps = { prefix: string; serial: string };

import { DeviceControl } from './DeviceControl.js';

export function PhoneScreen({ prefix, serial }: ScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const deviceControl = new DeviceControl(prefix, serial);



  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };

    // Mouse events
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      const rect = canvas.getBoundingClientRect();
      dragStart = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const onMouseMove = (e: MouseEvent) => {
      // Optional: show drag feedback
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const rect = canvas.getBoundingClientRect();
      const dragEnd = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      deviceControl.sendSwipe(canvas, dragStart, dragEnd);
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const coord = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      deviceControl.sendSwipe(canvas, coord, coord);
    };

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      dragStart = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
      isDragging = true;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const rect = canvas.getBoundingClientRect();
      const touch = (e.changedTouches && e.changedTouches[0]) || null;
      if (!touch) return;
      const dragEnd = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
      deviceControl.sendSwipe(canvas, dragStart, dragEnd);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [prefix, serial, canvasRef]);

  // Function to fetch and draw the screen image
  const fetchAndDrawScreen = async () => {
    try {
      const deviceResponse = await fetch(`${prefix}/device/${serial}/jpeg`);
      if (deviceResponse.ok) {
        const blob = await deviceResponse.blob();
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
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error(`${e}`);
      }
    }
  };

  useEffect(() => {
    fetchAndDrawScreen(); // Initial fetch
    const interval = setInterval(fetchAndDrawScreen, 2000);
    return () => clearInterval(interval);
  }, [prefix, serial]);


  return (
    <div>
      serial:{serial}
      <canvas ref={canvasRef} style={{ touchAction: 'none', userSelect: 'none' }} />
    </div>
  );
}
