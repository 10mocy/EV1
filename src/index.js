import NIED from './libs/nied'

require('date-utils')

const nied = new NIED()

nied.on('ready', () => {
  console.log('✔ NIED is all ready!')
})

nied.on('data', data => {
  console.log(data)
})

const main = async () => {
  nied.start()
}

main()
