import NIED from './libs/nied'
import Discord from 'discord.js'

import dateH from './libs/date'

require('date-utils')
require('dotenv').config()

const client = new Discord.Client()
const nied = new NIED()

const intensityColor = {
  不明: '222222',
  '1': '6ee2eb',
  '2': '6eeb74',
  '3': 'f7ef52',
  '4': 'f58545',
  '5弱': 'f75252',
  '5強': 'ff1717',
  '6弱': 'ff9eb8',
  '6強': 'd6426a',
  '7': 'd166ca'
}

client.on('ready', () =>
  console.log('✔ Discordクライアントの準備が整いました！')
)
nied.on('ready', () => console.log('✔ NIEDクライアントの準備が整いました！'))

nied.on('data', data => {
  console.log(data)
  client.channels.get('651780233711583233').send({
    embed: {
      title: `地震速報(高度利用) 第${data.report_num}報${
        data.is_final ? ' (最終報)' : ''
      }`,
      color: parseInt(
        `0x${intensityColor[data.calcintensity] || '888888'}`,
        16
      ),
      thumbnail: {
        url: `https://github.com/neirowork/EV1/blob/develop/assets/intensity/${encodeURIComponent(
          data.calcintensity
        )}.png?raw=true`
      },
      fields: [
        {
          name: '発生時刻',
          value: dateH.datetimeToDate(data.origin_time),
          inline: true
        },
        { name: '震央', value: data.region_name, inline: true },
        { name: '深さ', value: data.depth, inline: true },
        { name: 'マグニチュード', value: `M${data.magunitude}`, inline: true },
        {
          name: '予想最大震度',
          value: `震度${data.calcintensity}`,
          inline: true
        }
      ],
      author: {
        name: '情報元 : NIED 防災科学技術研究所',
        url: 'http://www.kmoni.bosai.go.jp/',
        icon_url:
          'https://github.com/neirowork/EV1/blob/develop/assets/nied.png?raw=true'
      },
      footer: {
        text: 'NeiRo.WORK Earthquake Viewer 1'
        // icon_url:
      }
    }
  })
})

client.on('error', err => console.error(err))

const main = async () => {
  if (!process.env.DISCORD_TOKEN)
    throw new Error('❌ Discord BOTトークンが入力されていません。')

  client.login(process.env.DISCORD_TOKEN)
  nied.start()
}

main()
