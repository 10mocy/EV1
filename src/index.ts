import { NIED, Earthquake } from './libs/nied';
import { NHK, Report } from './libs/nhk';

import Discord from 'discord.js';

import dateHelper from './libs/date';

require('dotenv').config();

const intensityColor: { [key: string]: string } = {
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
};

class EV1 {
  private token: string;
  private bot: Discord.Client;
  private nied: NIED;
  private nhk: NHK;

  constructor(token: string | undefined) {
    if (!token) {
      throw new ReferenceError('トークンが入力されていません。');
    }
    this.token = token;

    this.bot = new Discord.Client();
    this.nied = new NIED();
    this.nhk = new NHK();
  }

  start(): void {
    this.discordReadyHandler();
    this.discordErrorHandler();

    this.niedReadyHandler();
    this.nhkReadyHandler();

    this.niedReportHandler();
    this.nhkReportHandler();
    this.bot.login(this.token);

    this.nied.start();
    this.nhk.start();
  }

  private discordReadyHandler(): void {
    this.bot.on('ready', () => {
      console.log('✔ Discordクライアントの準備が整いました！');
      this.bot.user.setActivity(`EV1 v${process.env.npm_package_version}`, {
        url: 'https://github.com/neirowork/EV1',
        type: 'PLAYING'
      });
    });
  }

  private discordErrorHandler(): void {
    this.bot.on('error', err => console.error(err));
  }

  private niedReadyHandler(): void {
    this.nied.on('ready', () =>
      console.log('✔ NIEDクライアントの準備が整いました！')
    );
  }

  private nhkReadyHandler(): void {
    this.nhk.on('ready', () =>
      console.log('✔ NHKクライアントの準備が整いました！')
    );
  }

  private niedReportHandler(): void {
    this.nied.on('data', (data: Earthquake) => {
      console.log(
        `<i> NIED地震速報が届きました ${data.report_id}-${data.report_num}`
      );

      this.sendMessage(this.bot.channels.get('651780233711583233'), {
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
              value: dateHelper.datetimeToDate(data.origin_time),
              inline: true
            },
            { name: '震央', value: data.region_name, inline: true },
            { name: '深さ', value: data.depth, inline: true },
            {
              name: 'マグニチュード',
              value: `M${data.magunitude}`,
              inline: true
            },
            {
              name: '予想最大震度',
              value: `震度${data.calcintensity}`,
              inline: true
            }
          ],
          author: {
            name: '情報元 : NIED 防災科学技術研究所',
            url: 'http://www.kmoni.bosai.go.jp/',
            iconUrl:
              'https://github.com/neirowork/EV1/blob/develop/assets/nied.png?raw=true'
          },
          footer: {
            text: 'NeiRo.WORK Earthquake Viewer 1'
            // icon_url: ''
          }
        }
      });
    });
  }

  private nhkReportHandler(): void {
    this.nhk.on('data', (data: Report) => {
      console.log(`<i> NHK地震情報が届きました ${data.id}`);

      this.sendMessage(this.bot.channels.get('651780233711583233'), {
        embed: {
          title: `NHK地震情報 ${data.id}`,
          color: parseInt('0x34c3eb', 16),
          thumbnail: {
            url: `https://github.com/neirowork/EV1/blob/develop/assets/intensity/${encodeURIComponent(
              data.intensity
            )}.png?raw=true`
          },
          fields: [
            {
              name: '発生時刻',
              value: data.timestamp,
              inline: true
            },
            { name: '震央', value: data.epicenter, inline: true },
            { name: '深さ', value: data.depth, inline: true },
            {
              name: 'マグニチュード',
              value: `M${data.magnitude}`,
              inline: true
            },
            { name: '最大震度', value: data.intensity, inline: true },
            {
              name: `最大震度${data.intensity}を観測した地点`,
              value: data.relative[0].area.join(' / '),
              inline: true
            }
          ],
          author: {
            name: '情報元 : NHK あなたの天気・防災｜地震情報',
            url: 'https://www.nhk.or.jp/kishou-saigai/earthquake/',
            iconUrl:
              'https://github.com/neirowork/EV1/blob/develop/assets/nhk.jpg?raw=true'
          },
          footer: {
            text: 'NeiRo.WORK Earthquake Viewer 1'
            // icon_url: ''
          }
        }
      });
    });
  }

  private sendMessage(ch: Discord.Channel | undefined, content: any): void {
    if (!(ch instanceof Discord.TextChannel)) return;
    ch.send(content);
  }
}

const ev1 = new EV1(process.env.BOT_TOKEN);
ev1.start();
