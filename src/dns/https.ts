import {promisify} from 'util';
// @ts-ignore
import doh from 'dns-over-http';
import BaseDNS from './base';

const dohQueryAsync = promisify(doh.query);
export default class DNSOverHTTPS extends BaseDNS {
  public async _lookup(hostName: string) {
    return await this.fetchDns(hostName)
  }

  private async fetchDns(hostName: string): Promise<[]> {
    try {
      const result = await dohQueryAsync({url: this.dnsServer}, [
        {
          type: 'A',
          name: hostName
        }
      ]);
      if (result.answers.length === 0) {
        // 说明没有获取到ip
        return [];
      }
      return result.answers
        .filter((item: { type: string; }) => item.type === 'A')
        .map((item: { data: any; }) => item.data);
    } catch (err) {
      return [];
    }
  }
}
