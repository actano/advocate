import { execFile } from 'child_process'

export default async function (cwd, cmd, ...args) {
  const maxBuffer = 26 * 1024 * 1024
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, maxBuffer }, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(JSON.parse(stdout))
      }
    })
  })
}
