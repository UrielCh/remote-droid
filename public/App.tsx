import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { PhoneScreen } from './PhoneScreen.js';
import DeviceDto from 'src/device/dto/Device.dto.js';

export function App() {
  // Only run hooks on the client
  // if (typeof window === 'undefined') {
  //   // SSR/static export: just render static markup
  //   return (
  //     <div>
  //       <h1>Loading... 00</h1>
  //     </div>
  //   );
  // }

  // Client-side: run hooks
  const [prefix, setPrefix] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prefixResponse = await fetch('/prefix');
        const prefixData = await prefixResponse.json();
        setPrefix(prefixData.prefix);

        const deviceResponse = await fetch(`${prefixData.prefix}/device`);
        if (deviceResponse) {
          const deviceData = await deviceResponse.json();
          console.log(deviceData);
          setDevice(deviceData);
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError(`${e}`);
        }
      }
    };
    fetchData();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!prefix) return <div>Loading prefix...</div>;
  if (!device) return <div>Loading devices...</div>;

  return (
    <div>
      <h1>Hello from Preacte!</h1>
      {device.map((d) => (
        <PhoneScreen prefix={prefix} serial={d.id} />
      ))}
      {/* Optionally render device info: <pre>{JSON.stringify(device, null, 2)}</pre> */}
    </div>
  );
}

