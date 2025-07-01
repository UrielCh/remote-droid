export class DeviceControl {
  prefix: string;
  serial: string;
  constructor(prefix: string, serial: string) {
    this.prefix = prefix;
    this.serial = serial;
  }

  async sendSwipe(canvas: HTMLCanvasElement | null, start: {x: number, y: number}, end: {x: number, y: number}) {
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;
    const px1 = start.x / width;
    const py1 = start.y / height;
    const px2 = end.x / width;
    const py2 = end.y / height;
    try {
      await fetch(`${this.prefix}/device/${this.serial}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          px1, py1, px2, py2
        }),
      });
    } catch (e) {
      console.error('Failed to send swipe:', e);
    }
  }
}
