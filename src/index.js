import NIED from './libs/nied'
import Discord from 'discord.js'

require('date-utils')
require('dotenv').config()

const client = new Discord.Client()
const nied = new NIED()

client.on('ready', () => console.log('✔ Discordクライアントの準備が整いました！'))
nied.on('ready', () => console.log('✔ NIEDクライアントの準備が整いました！'))

nied.on('data', data => {
  console.log(data)
  console.log(client.channels)
  client.channels.get('651780233711583233').send(`\`\`\`${JSON.stringify(data)}\`\`\``)
})

client.on('error', err => console.error(err))

const main = async () => {
  if(!process.env.DISCORD_TOKEN) throw new Error('❌ Discord BOTトークンが入力されていません。')

  client.login(process.env.DISCORD_TOKEN)
  nied.start()
}

main()
