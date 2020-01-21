import axios, { AxiosResponse } from 'axios';
import { deflate } from 'zlib';
require('date-utils');

const EventEmitter = require('events').EventEmitter;

interface Result {
  status: string;
  message: string;
  is_auth: boolean;
}

interface Security {
  realm: string;
  hash: string;
}

export interface Earthquake {
  result: Result;
  report_time: string;
  region_code: string;
  request_time: string;
  region_name: string;
  longitude: string;
  is_cancel: boolean;
  depth: string;
  calcintensity: string;
  is_final: boolean;
  is_training: boolean;
  latitude: string;
  origin_time: string;
  security: Security;
  magunitude: string;
  report_num: string;
  request_hypo_type: string;
  report_id: string;
  alertflg: string;
}

export default class NIED extends EventEmitter {
  constructor(interval = 2000) {
    super();

    this.interval = interval;

    this.existEID = {};
  }

  start(): void {
    setInterval(() => this._kmoni(), this.interval);
    this.emit('ready');
  }

  async _kmoni(): Promise<undefined> {
    // const dt = new Date('2019/12/04 19:35:30')
    const dt = new Date();

    dt.setSeconds(dt.getSeconds() - 2);
    const timestamp = dt.toFormat('YYYYMMDDHH24MISS');

    const url = `http://www.kmoni.bosai.go.jp/webservice/hypo/eew/${timestamp}.json`;
    const req: AxiosResponse = await axios.get(url);
    const data: Earthquake = req.data;

    // 情報発表時以外スキップ
    if (data.result.message !== '') return;

    // 過去報チェック処理を行う準備
    if (!Object.keys(this.existEID).find(i => i === data.report_id)) {
      this.existEID[data.report_id] = [];
    }

    // 過去報スキップ
    if (
      this.existEID[data.report_id].find((i: string) => i === data.report_num)
    )
      return;

    this.existEID[data.report_id].push(data.report_num);
    this.emit('data', data);
  }
}
