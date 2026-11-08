export function normalizeTargetUrl(value) {
 if (typeof value !== 'string' || !value.trim()) throw Error('Enter a website URL');
 const text=value.trim();
 const url=new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`);
 if (!['http:','https:'].includes(url.protocol) || url.username || url.password) throw Error('Use an HTTP or HTTPS website URL without credentials');
 return url.href;
}
