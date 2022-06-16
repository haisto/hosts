import net from "net";
import unionBy from 'lodash.unionby'
import {DnsType, IDnsMap} from "../dns";
import {log} from "../logger";


interface IAlive {
  time: number;
  host: string;
  status: string;
}

interface IpData {
  host: any;
  port: number;
}

interface ISpeedTester {
  hostname: string;
  interval: number;
  dnsMap: IDnsMap;
  cb?: Function;
  silent?: string;
}

class SpeedTester {
  public hostname: string;
  public alive: IAlive[];
  public backupList: any[];

  private readonly dnsMap: IDnsMap;
  private lastReadTime: number;
  private ready: boolean;
  private testCount: number;
  private keepCheckId: any;
  private readonly interval: number;
  private readonly silent: string | undefined;
  private lastIntervalState: boolean;

  public constructor({hostname, dnsMap, interval, silent}: ISpeedTester) {
    this.dnsMap = dnsMap;
    this.hostname = hostname;
    this.lastReadTime = Date.now();
    this.ready = false;
    this.alive = [];
    this.backupList = [];
    this.keepCheckId = false;
    this.lastIntervalState = false;

    this.testCount = 0;
    this.interval = interval;
    this.silent = silent;

    if (interval) {
      this.touch()
    }

  }

  public getFastIp() {
    if (this.alive.length === 0) {
      this.test();
      return null;
    }
    return this.alive[0].host;
  }

  public pickFastAliveIp() {
    this.touch();

    return this.getFastIp()
  }

  public touch() {
    this.lastReadTime = Date.now();
    if (!this.keepCheckId) {
      this.startChecker();
    }
  }

  public startChecker() {
    if (this.keepCheckId) {
      clearInterval(this.keepCheckId);
    }
    this.keepCheckId = setInterval(() => {
      if (this.alive.length > 0) {
        this.testBackups();
        return;
      }
      this.test();
    }, this.interval);
  }

  public async getIpListFromDns(dnsMap: IDnsMap) {
    const ips: any = {};
    const promiseList = [];
    // eslint-disable-next-line guard-for-in
    for (const key in dnsMap) {
      const one = this.getFromOneDns(dnsMap[key]).then(ipList => {
        if (ipList) {
          for (const ip of ipList) {
            ips[ip] = 1;
          }
        }
      });
      promiseList.push(one);
    }
    await Promise.all(promiseList);
    const items: IpData[] = [];
    // eslint-disable-next-line guard-for-in
    for (const ip in ips) {
      items.push({host: ip, port: 443});
    }
    return items;
  }

  public async getFromOneDns(dns: DnsType) {
    return await dns._lookup(this.hostname);
  }

  public sleep(ms: any) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  public async test(cb?: Function) {
    if (this.lastIntervalState) {
      log.warn("跳过创建新的任务：%s", this.hostname);
      return;
    }
    this.lastIntervalState = true;
    const size = 100000;
    const startTime = Date.now();
    for (let i = 0; i < size; i++) {
      if (
        this.backupList.length === 0 ||
        this.testCount < 10 ||
        this.testCount % 5 === 0
      ) {
        log.debug("[%s/%s] 正在查询DNS：%s", i + 1, size, this.hostname);
        const newList = await this.getIpListFromDns(this.dnsMap);
        const newBackupList = [...newList, ...this.backupList];
        this.backupList = unionBy(newBackupList, "host");
      }
      this.testCount++;
      await this.testBackups();
      if (this.alive.length > 0) {
        const endTime = Date.now();
        log.debug("[%s/%s] 查询成功[%s]，本次耗时：%sms", i + 1, size, this.hostname, endTime - startTime);
        break;
      }
    }
    const endTime = Date.now();
    if (this.alive.length > 0) {
      cb?.(this.hostname, startTime, endTime)
    }
    this.lastIntervalState = false;
  }

  public async testBackups() {
    const testAll = [];
    const aliveList: IAlive[] = [];
    for (const item of this.backupList) {
      testAll.push(this.doTest(item, aliveList));
    }
    await Promise.all(testAll);
    this.alive = aliveList;
    this.ready = true;
  }

  public async doTest(item: { host: any }, aliveList: IAlive[]) {
    try {
      const ret = await this.testOne(item);

      aliveList.push({...ret, ...item});
      aliveList.sort((a, b) => a.time - b.time);
      this.backupList.sort((a, b) => a.time - b.time);
    } catch (e) {
      // log.error("Speed test error %s %s %s", this.hostname, item.host, e.message);
    }
  }

  public testOne(item: any): Promise<Omit<IAlive, "host">> {
    const timeout = 60000;
    const {host, port} = item;
    const startTime = Date.now();
    let isOver = false;
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      let timeoutId: NodeJS.Timeout | null = null;
      const client = net.createConnection({host, port}, () => {
        // 'connect' 监听器
        const connectionTime = Date.now();
        isOver = true;
        timeoutId && clearTimeout(timeoutId);
        resolve({status: "success", time: connectionTime - startTime});
        client.end();
      });
      client.on("end", () => {
      });
      client.on("error", error => {
        // log.error("测试速度错误 %s %s %s", this.hostname, host, error.message);
        isOver = true;
        timeoutId && clearTimeout(timeoutId);
        reject(error);
      });

      timeoutId = setTimeout(() => {
        if (isOver) {
          return;
        }
        // log.error("连接超时 % %s", this.hostname, host);
        reject(new Error("timeout"));
        client.end();
      }, timeout);
    });
  }
}

export default SpeedTester;
