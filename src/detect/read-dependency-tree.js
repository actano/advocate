/* eslint-disable
    func-names,
    max-len,
    no-console,
    no-param-reassign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import fs from 'fs'
import Promise from 'bluebird'
import childProcess from 'child_process'

const execFile = Promise.promisify(childProcess.execFile, { multiArgs: true })

// This function is intended to be used with yarn until a better option is available.
// Its dangerous to use because its ignoring any errors.
const execFileDangerously = (command, args, options) =>
  new Promise(((resolve, reject) => childProcess.execFile(command, args, options, (error, stdout, stderr) => resolve([stdout, stderr]))))


const isYarnInUse = function (cwd) {
  if (cwd == null) { cwd = process.cwd() }
  return fs.existsSync(`${cwd}/yarn.lock`)
}

export default async function (dev, modulePath) {
  let _execFile
  if (dev == null) { dev = false }
  const options =
        { maxBuffer: 26 * 1024 * 1024 }
  if (modulePath != null) { options.cwd = modulePath }

  if (isYarnInUse(modulePath)) {
    console.log('yarn.lock found. Suppressing errors coming from npm ls.')
    _execFile = execFileDangerously
  } else {
    _execFile = execFile
  }

  const [stdout] = Array.from(await _execFile('npm', [
    'list',
    '--json',
    '--long',
    dev ? '--dev' : '--prod',
  ], options))

  return JSON.parse(stdout)
}
