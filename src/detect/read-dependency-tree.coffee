fs = require 'fs'
Promise = require 'bluebird'
childProcess = require 'child_process'

execFile = Promise.promisify childProcess.execFile, multiArgs: true

# This function is intended to be used with yarn until a better option is available.
# Its dangerous to use because its ignoring any errors.
execFileDangerously = (command, args, options) ->
    return new Promise (resolve, reject) ->
        childProcess.execFile command, args, options, (error, stdout, stderr) ->
            resolve [stdout, stderr]

isYarnInUse = (cwd) ->
    cwd = process.cwd() unless cwd?
    return fs.existsSync "#{cwd}/yarn.lock"

module.exports = Promise.coroutine (dev = false, modulePath) ->
    options =
        maxBuffer: 26 * 1024 * 1024
    options.cwd = modulePath if modulePath?

    if isYarnInUse modulePath
        console.log 'yarn.lock found. Suppressing errors coming from npm ls.'
        _execFile = execFileDangerously
    else
        _execFile = execFile

    [stdout] = yield _execFile 'npm', [
        'list'
        '--json'
        '--long'
        if dev then '--dev' else '--prod'
    ], options

    return JSON.parse stdout
