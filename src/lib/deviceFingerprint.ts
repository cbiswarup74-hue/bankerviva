export function getOrCreateDeviceId(): { deviceId: string; deviceName: string } {
  if (typeof window === 'undefined') {
    return { deviceId: 'unknown', deviceName: 'Server' };
  }

  let deviceId = localStorage.getItem('bankerviva_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + crypto.randomUUID();
    localStorage.setItem('bankerviva_device_id', deviceId);
  }

  const userAgent = navigator.userAgent;
  let deviceName = 'PC / Web Browser';

  if (/android/i.test(userAgent)) {
    deviceName = 'Android Device';
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    deviceName = 'Apple Mobile';
  } else if (/Macintosh/.test(userAgent)) {
    deviceName = 'MacBook / Mac OS';
  } else if (/Windows/.test(userAgent)) {
    deviceName = 'Windows PC';
  }

  return { deviceId, deviceName };
}