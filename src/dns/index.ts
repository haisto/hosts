import DNSOverHTTPS from './https';
import DNSOverIpAddress from './ipaddress';
import {Logger} from "winston";

interface IProvider {
  type: string;
  server: string;
  cacheSize: number;
}

export interface IDnsOption {
  [key: string]: IProvider
}

export type DnsType = DNSOverHTTPS | DNSOverIpAddress

export interface IDnsMap {
  [key: string]: DnsType
}

export function initDNS(log: Logger, dnsProviders: IDnsOption) {
  const dnsMap: IDnsMap = {};

  for (const key in dnsProviders) {
    if (Object.prototype.hasOwnProperty.call(dnsProviders, key)) {
      const conf = dnsProviders[key];

      if (conf.type === 'ipaddress') {
        dnsMap[key] = new DNSOverIpAddress(log, conf.server);
      } else if (conf.type === 'https') {
        dnsMap[key] = new DNSOverHTTPS(log, conf.server);
      }
    }
  }
  return dnsMap;
}
