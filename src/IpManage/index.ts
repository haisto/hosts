import SpeedTest from "./SpeedTest";
import {IDnsMap, IDnsOption, initDNS} from "../dns";
import {fetchHostUrls, hostPath} from "../constants";
import {Logger} from "winston";
import {log} from "../logger";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs')
const SpeedTestPool: { [key: string]: SpeedTest } = {};

interface IIpManageOption {
  hostList: any;
  interval: number;
  dnsProviders: string[];
  providers: IDnsOption;
  callback?: Function;
  silent?: string;
}

interface IConfig {
  hostList: any;
  interval: number;
  dnsProviders: string[];
  dnsMap: IDnsMap;
  callback?: Function;
  silent?: string;
}

export default class IpManage {
  private config: IConfig
  private updateUrlsId: any
  private dnsQueryCallback: Function
  private log: Logger

  public constructor(option: IIpManageOption) {
    console.log(option.silent)
    this.log = log
    this.config = {
      ...option,
      dnsMap: initDNS(option.providers)
    }
    this.dnsQueryCallback = (hostname: any, startTime: number, endTime: number) => {
      // this.log.debug(`查询${hostname}，耗时：${endTime - startTime}ms`)
    }

    this.initSpeedTest()
  }

  public initSpeedTest() {
    this.startTest()
    if (this.updateUrlsId) {
      clearInterval(this.updateUrlsId);
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const it = this
    fs.watchFile(hostPath, (cur: { mtime: any; }, prv: { mtime: any; }) => {
      if (cur.mtime !== prv.mtime) {
        const hosts = fetchHostUrls()
        it.config.hostList = hosts
        for (const key in SpeedTestPool) {
          if (Object.prototype.hasOwnProperty.call(SpeedTestPool, key)) {
            if (!hosts.includes(key)) {
              delete SpeedTestPool[key]
            }
          }
        }
        this.config.hostList.forEach((hostname: string) => {
          if (!SpeedTestPool[hostname]?.alive) {
            SpeedTestPool[hostname] = new SpeedTest({
              hostname,
              dnsMap: this.config.dnsMap,
              interval: this.config.interval,
              silent: this.config.silent
            });
            SpeedTestPool[hostname].test(this.dnsQueryCallback)
          }
        })
      }
    })
  }

  public getAllSpeedTester() {
    const allSpeed = [];

    for (const key in SpeedTestPool) {
      if (Object.prototype.hasOwnProperty.call(SpeedTestPool, key)) {
        allSpeed.push({
          hostname: SpeedTestPool[key].hostname,
          alive: SpeedTestPool[key].alive,
          backupList: SpeedTestPool[key].backupList
        });
      }
    }

    return allSpeed;
  }

  public getSpeedTester(hostname: string) {
    let instance = SpeedTestPool[hostname];

    if (!instance) {
      instance = new SpeedTest({
        hostname,
        dnsMap: this.config.dnsMap,
        interval: this.config.interval,
        silent: this.config.silent
      });
      SpeedTestPool[hostname] = instance;
    }

    return instance;
  }

  public reSpeedTest() {
    for (const key in SpeedTestPool) {
      if (Object.prototype.hasOwnProperty.call(SpeedTestPool, key)) {
        SpeedTestPool[key].test(this.dnsQueryCallback);
      }
    }
  }

  public startTest() {
    let countArr = []
    const afterCb = (hostname: any, startTime: number, endTime: number) => {
      countArr.push(1)
      if (countArr.length === this.config.hostList.length) {
        this.config.callback?.()
      }
      // this.log.debug(`查询${hostname}，耗时：${endTime - startTime}ms`)
    }
    this.config.hostList.forEach((hostname: string) => {
      SpeedTestPool[hostname] = new SpeedTest({
        hostname,
        dnsMap: this.config.dnsMap,
        interval: this.config.interval,
        silent: this.config.silent
      });

      SpeedTestPool[hostname].test(afterCb)
    })
  }
}
