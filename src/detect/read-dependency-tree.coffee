Promise = require 'bluebird'
childProcess = require('child_process')

execFile = Promise.promisify childProcess.execFile

module.exports = Promise.coroutine (dev = false, modulePath) ->
    options =
        maxBuffer: 26 * 1024 * 1024
    options.cwd = modulePath if modulePath?

    [stdout] = yield execFile 'npm', [
        'list'
        '--json'
        '--long'
        if dev then '--dev' else '--prod'
    ], options

    return JSON.parse stdout
