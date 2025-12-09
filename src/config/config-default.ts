import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageJsonPath = join(__dirname, '..', '..', 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

const CONFIG_DEFAULT = {
  version: packageJson.version,
  name: packageJson.name,
  description: packageJson.description
} as const

export { CONFIG_DEFAULT }
