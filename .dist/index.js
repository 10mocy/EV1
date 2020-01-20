"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nied_1 = __importDefault(require("./libs/nied"));
const nhk_1 = __importDefault(require("./libs/nhk"));
const discord_js_1 = __importDefault(require("discord.js"));
const date_1 = __importDefault(require("./libs/date"));
const package_json_1 = __importDefault(require("./../package.json"));
require('date-utils');
require('dotenv').config();
const client = new discord_js_1.default.Client();
const nied = new nied_1.default();
const nhk = new nhk_1.default();
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
};
client.on('ready', () => {
    console.log('✔ Discordクライアントの準備が整いました！');
    client.user.setActivity(`EV1 v${package_json_1.default.version}`, {
        url: 'https://github.com/neirowork/EV1',
        type: 'PLAYING'
    });
});
nied.on('ready', () => console.log('✔ NIEDクライアントの準備が整いました！'));
nhk.on('ready', () => console.log('✔ NHKクライアントの準備が整いました！'));
nied.on('data', data => {
    console.log(`<i> NIED地震速報が届きました ${data.report_id}-${data.report_num}`);
    client.channels.get('651780233711583233').send({
        embed: {
            title: `地震速報(高度利用) 第${data.report_num}報${data.is_final ? ' (最終報)' : ''}`,
            color: parseInt(`0x${intensityColor[data.calcintensity] || '888888'}`, 16),
            thumbnail: {
                url: `https://github.com/neirowork/EV1/blob/develop/assets/intensity/${encodeURIComponent(data.calcintensity)}.png?raw=true`
            },
            fields: [
                {
                    name: '発生時刻',
                    value: date_1.default.datetimeToDate(data.origin_time),
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
                icon_url: 'https://github.com/neirowork/EV1/blob/develop/assets/nied.png?raw=true'
            },
            footer: {
                text: 'NeiRo.WORK Earthquake Viewer 1'
                // icon_url: ''
            }
        }
    });
});
nhk.on('data', data => {
    console.log(`<i> NHK地震情報が届きました ${data.id}`);
    client.channels.get('651780233711583233').send({
        embed: {
            title: `NHK地震情報 ${data.id}`,
            color: parseInt('0x34c3eb', 16),
            thumbnail: {
                url: `https://github.com/neirowork/EV1/blob/develop/assets/intensity/${encodeURIComponent(data.intensity)}.png?raw=true`
            },
            fields: [
                {
                    name: '発生時刻',
                    value: data.timestamp,
                    inline: true
                },
                { name: '震央', value: data.epicenter, inline: true },
                { name: '深さ', value: data.depth, inline: true },
                { name: 'マグニチュード', value: `M${data.magnitude}`, inline: true },
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
                icon_url: 'https://github.com/neirowork/EV1/blob/develop/assets/nhk.jpg?raw=true'
            },
            footer: {
                text: 'NeiRo.WORK Earthquake Viewer 1'
                // icon_url: ''
            }
        }
    });
});
client.on('error', err => console.error(err));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.DISCORD_TOKEN)
        throw new Error('❌ Discord BOTトークンが入力されていません。');
    client.login(process.env.DISCORD_TOKEN);
    nied.start();
    nhk.start();
});
main();
