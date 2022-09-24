export function getEnv(key: string, defValue?: string): string {
  let value = process.env[key];
  if (!value) return defValue || '';
  const m = value.match(/\$\{(.+)\}/);
  if (m) {
    const v = process.env[m[1]] || '';
    value = value.replace(m[0], v);
  }
  return value;
}
