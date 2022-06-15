import {promisify} from 'util';
// @ts-ignore
import doh from 'dns-over-http';
import BaseDNS from './base';

const dohQueryAsync = promisify(doh.query);

export default class DNSOverHTTPS extends BaseDNS {
  public async _lookup(hostName: string) {
    try {
      const result = await dohQueryAsync({url: this.dnsServer}, [
        {
          type: 'A',
          name: hostName
        }
      ]);

      if (result.answers.length === 0) {
        // 说明没有获取到ip
        this.log.error('该域名没有ip地址解析 %s', hostName);
        return [];
      }
      const ret = result.answers
        .filter((item: { type: string; }) => {
          return item.type === 'A';
        })
        .map((item: { data: any; }) => {
          return item.data;
        });
      if (ret.length === 0) {
        this.log.error('该域名没有ipv4地址解析 %s', hostName);
      } else {
        this.log.debug('获取到域名地址：%s', hostName, JSON.stringify(ret));
      }
      return ret;
    } catch (err) {
      this.log.error('Https dns query error %s %s %s', hostName, this.dnsServer, err.message);
      return [];
    }
  }
}
