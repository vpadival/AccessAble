// Public demo scans only operator-approved HTTPS hosts, including subresources.
export function approvedUrl(value, hosts) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (!url.port || url.port === '443') && hosts.includes(url.hostname);
  } catch { return false; }
}
export function productionHosts(env = process.env) {
  return (env.SCAN_ALLOWED_HOSTS || '').split(',').map(x=>x.trim()).filter(Boolean);
}
