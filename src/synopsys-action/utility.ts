export function cleanUrl(url: string): string {
  if (url && url.endsWith('/')) {
    return url.slice(0, url.length - 1)
  }
  return url
}
