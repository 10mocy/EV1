import axios from 'axios';
import iconv from 'iconv-lite';
import xml2js from 'xml2js';

import { EventEmitter } from 'events';

interface Point {
  intencity: string;
  area: string[];
}

export interface Report {
  id: string;
  timestamp: string;
  intensity: string;
  epicenter: string;
  depth: string;
  magnitude: string;
  relative: Point[];
}

export class NHK extends EventEmitter {
  private interval: number;
  private startupDate: Date;

  private existNHKEID: string[];

  constructor(interval = 2000) {
    super();

    this.interval = interval;

    this.startupDate = new Date();
    this.existNHKEID = [];
  }

  start(): void {
    setInterval(() => this._nhk(), this.interval);
    this.emit('ready');
  }

  private async _nhk(): Promise<undefined> {
    const reportURL =
      'https://www3.nhk.or.jp/sokuho/jishin/data/JishinReport.xml';
    const reportReq = await axios.get(reportURL, {
      responseType: 'arraybuffer'
    });
    const reportXML = iconv.decode(Buffer.from(reportReq.data), 'shiftjis');
    const reportData = await xml2js.parseStringPromise(reportXML);
    const latestReportURL = reportData.jishinReport.record[0].item[0].$.url;

    const latestReportReq = await axios.get(latestReportURL, {
      responseType: 'arraybuffer'
    });
    const latestXML = iconv.decode(
      Buffer.from(latestReportReq.data),
      'shiftjis'
    );
    const latestData = await xml2js.parseStringPromise(latestXML);

    const latestAttribute = latestData.Root.Earthquake[0].$;

    // 詳細情報発表前は処理をスキップ
    // (震度情報が空文字列になっていることを利用している)
    if (latestAttribute.Epicenter === '') return;

    // 起動前の情報をスキップ
    const latestDate = new Date(latestData.Root.Timestamp[0]);
    if (this.startupDate > latestDate) return;

    // 処理済みチェック
    if (this.existNHKEID.find((i: string) => i === latestAttribute.Id)) return;
    this.existNHKEID.push(latestAttribute.Id);

    // 観測地点を配列化
    const latestGroup = latestData.Root.Earthquake[0].Relative[0].Group;

    const relative = latestGroup.map(
      (i: { $: { Intensity: string }; Area: { $: { Name: string } }[] }) => ({
        intensity: i.$.Intensity,
        area: i.Area.map(j => j.$.Name)
      })
    );

    const data = {
      id: latestAttribute.Id,
      timestamp: latestAttribute.Time,
      intensity: latestAttribute.Intensity,
      epicenter: latestAttribute.Epicenter,
      depth: latestAttribute.Depth,
      magnitude: latestAttribute.Magnitude,
      relative
    };

    this.emit('data', data);
  }
}
