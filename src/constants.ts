// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs')

export const providers = {
  usa: {
    type: "https",
    server: "https://1.1.1.1/dns-query",
    cacheSize: 1e3
  },
  quad9: {
    type: "https",
    server: "https://9.9.9.9/dns-query",
    cacheSize: 1e3
  },
  rubyfish: {
    type: "https",
    server: "https://rubyfish.cn/dns-query",
    cacheSize: 1e3
  },
  iqDNS: {
    type: 'https',
    server: 'https://i.passcloud.xyz/dns-query',
    cacheSize: 1e3
  },
  OpenDns: {
    type: "https",
    server: "https://doh.opendns.com/dns-query",
    cacheSize: 1e3
  },
  IPAdress: {
    type: "ipaddress",
    server: "https://doh.opendns.com/dns-query",
    cacheSize: 1e3
  },
}

export const githubUrls = [
  'github.githubassets.com',
  'central.github.com',
  'desktop.githubusercontent.com',
  'assets-cdn.github.com',
  'camo.githubusercontent.com',
  'github.map.fastly.net',
  'github.global.ssl.fastly.net',
  'gist.github.com',
  'github.io',
  'github.com',
  'api.github.com',
  'raw.githubusercontent.com',
  'user-images.githubusercontent.com',
  'favicons.githubusercontent.com',
  'avatars5.githubusercontent.com',
  'avatars4.githubusercontent.com',
  'avatars3.githubusercontent.com',
  'avatars2.githubusercontent.com',
  'avatars1.githubusercontent.com',
  'avatars0.githubusercontent.com',
  'avatars.githubusercontent.com',
  'codeload.github.com',
  'pages.github.com',
  'github-cloud.s3.amazonaws.com',
  'github-com.s3.amazonaws.com',
  'github-production-release-asset-2e65be.s3.amazonaws.com',
  'github-production-user-asset-6210df.s3.amazonaws.com',
  'github-production-repository-file-5c1aeb.s3.amazonaws.com',
  'githubstatus.com',
  'github.community',
  'media.githubusercontent.com',
  'objects.githubusercontent.com',
  'raw.github.com',
  'copilot-proxy.githubusercontent.com'
];

export const hostPath = 'hosts'
export const fetchHostUrls = (): string[] => {
  const urls: string[] = []
  try {
    // read contents of the file
    const data = fs.readFileSync(hostPath, 'UTF-8');
    // split the contents by new line
    const lines = data.split(/\r?\n/);
    // print all lines
    lines.forEach((line: string) => {
      if (line !== null && line.length > 0) {
        urls.push(line)
      }
    });
  } catch (err) {
    console.error(err);
  }
  return [...githubUrls, ...urls]
}
