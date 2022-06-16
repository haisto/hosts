import parser from 'yargs-parser'
import {updateHosts, updateNextHosts} from './hosts'

const argv = parser(process.argv.slice(2))

if (argv.type === 'default') {
  updateHosts()
} else if (argv.type === 'next') {
  updateNextHosts()
}
