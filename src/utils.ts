function lJust(str: string, total: number, pad?: string) {
  const size = total - str.length;
  if (size <= 0) {
    return str;
  }
  return str + Array(total - str.length)
    .join(pad || ' ');
}

export function buildHosts(hostData: any[]) {
  let generatedContent = ''

  hostData.forEach(host => {
    if (host.ip?.length) {
      const ip = host.ip[0]
      const date = new Date(ip?.timestamp)
      generatedContent += lJust(ip.host, 30) + lJust(host.name || '', 120) + '# ' + date?.toLocaleString() + '\n';
    }
  })

  return generatedContent
}
