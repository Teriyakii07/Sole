import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const children = [
  {
    name: 'OTP API',
    process: spawn(
      process.execPath,
      ['--import', 'tsx', resolve(root, 'frontend/server.ts')],
      { cwd: root, stdio: 'inherit' }
    ),
  },
  {
    name: 'Vite',
    process: spawn(
      process.execPath,
      [resolve(root, 'node_modules/vite/bin/vite.js'), ...process.argv.slice(2)],
      { cwd: root, stdio: 'inherit' }
    ),
  },
]

let stopping = false

function stop(exitCode) {
  if (stopping) return
  stopping = true
  process.exitCode = exitCode

  for (const child of children) {
    if (child.process.exitCode === null) child.process.kill()
  }
}

for (const child of children) {
  child.process.on('error', (error) => {
    console.error(`Unable to start ${child.name}:`, error)
    stop(1)
  })

  child.process.on('exit', (code, signal) => {
    if (!stopping) {
      const exitCode = code ?? (signal ? 1 : 0)
      if (exitCode !== 0) console.error(`${child.name} exited unexpectedly.`)
      stop(exitCode)
    }
  })
}

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
