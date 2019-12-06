import axios from 'axios'
require('date-utils')

const EventEmitter = require('events').EventEmitter

export default class NIED extends EventEmitter {
  constructor(interval = 2000) {
    super()

    this.interval = interval

    this.existEID = {}
  }

  start() {
    setInterval(() => this._kmoni(), this.interval)
    this.emit('ready')
  }

  async _kmoni() {
    // const dt = new Date('2019/12/04 19:36:00')
    const dt = new Date()

    dt.setSeconds(dt.getSeconds() - 2)
    const timestamp = dt.toFormat('YYYYMMDDHH24MISS')

    const url = `http://www.kmoni.bosai.go.jp/webservice/hypo/eew/${timestamp}.json`
    const req = await axios.get(url)

    // 情報発表時以外スキップ
    if (req.data.result.message !== '') return

    // 過去報チェック処理を行う準備
    if (!Object.keys(this.existEID).find(i => i === req.data.report_id)) {
      this.existEID[req.data.report_id] = []
    }

    // 過去報スキップ
    if (this.existEID[req.data.report_id].find(i => i === req.data.report_num))
      return

    this.existEID[req.data.report_id].push(req.data.report_num)
    this.emit('data', req.data)
  }
}
