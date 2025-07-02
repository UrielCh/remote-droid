import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { PhoneScreen } from './PhoneScreen.js';
import DeviceDto from 'src/device/dto/Device.dto.js';
import { RemoteDroidApi } from './services/RemoteDroidApi.js';

export function App() {
  const [prefix, setPrefix] = useState<string>("");
  const [device, setDevice] = useState<DeviceDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const remoteDroisApi = new RemoteDroidApi();
        const deviceData = await remoteDroisApi.listDevices();
        const baseUrl = remoteDroisApi.baseUrl;
        const prefix = await remoteDroisApi.getPrefix();
        setPrefix(baseUrl + prefix);
        setDevice(deviceData);
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
  if (!device) return <div>Loading devices...</div>;
  return (
    <div>
      {device.map((d) => (
        <PhoneScreen baseUrl={prefix} serial={d.id} />
      ))}
      {/* Optionally render device info: <pre>{JSON.stringify(device, null, 2)}</pre> */}
    </div>
  );
}

