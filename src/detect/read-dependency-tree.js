import fs from 'fs'
import Bluebird from 'bluebird'
import childProcess from 'child_process'

const execFile = Bluebird.promisify(childProcess.execFile)

// This function is intended to be used with yarn until a better option is available.
// Its dangerous to use because its ignoring any errors.
const execFileDangerously = (command, args, options) => new Promise((resolve) => {
  const cb = (error, stdout) => resolve(stdout)
  childProcess.execFile(command, args, options, cb)
})

const isYarnInUse = path => fs.existsSync(`${path}/yarn.lock`)

const getExecFile = (modulePath) => {
  if (isYarnInUse(modulePath)) {
    // eslint-disable-next-line no-console
    console.log('yarn.lock found. Suppressing errors coming from npm ls.')
    return execFileDangerously
  }
  return execFile
}

export default async function (dev = false, modulePath) {
  const options = {
    maxBuffer: 26 * 1024 * 1024,
    cwd: modulePath || process.cwd(),
  }
  const _execFile = getExecFile(options.cwd)

  const stdout = await _execFile('npm', ['list', '--json', '--long', dev ? '--dev' : '--prod'], options)

  return JSON.parse(stdout)
}
