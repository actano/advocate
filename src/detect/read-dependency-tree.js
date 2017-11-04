import Bluebird from 'bluebird'
import childProcess from 'child_process'

const execFile = Bluebird.promisify(childProcess.execFile)

export default async function (dev, modulePath) {
  const options = {
    maxBuffer: 26 * 1024 * 1024,
    cwd: modulePath || process.cwd(),
  }
  const stdout = await execFile('npm', ['list', '--json', '--long', dev ? '--dev' : '--prod'], options)

  return JSON.parse(stdout)
}
