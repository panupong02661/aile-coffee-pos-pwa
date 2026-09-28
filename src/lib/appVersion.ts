// Version info shown on the login screen so staff can tell which build a device runs.
declare const __APP_BUILD_TIME__: string;

export const APP_VERSION = '1.2.1';

export const APP_BUILD_TIME: string =
  typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : new Date().toISOString();

export const APP_BUILD_LABEL = (() => {
  const d = new Date(APP_BUILD_TIME);
  if (Number.isNaN(d.getTime())) return APP_VERSION;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.${pad(d.getHours())}${pad(d.getMinutes())}`;
})();
