import * as agnoci from '@agnoci/core'

interface InstallArguments {
  package?: string,
  noOptional?: boolean,
  noSave?: boolean
}

export function install (args?: InstallArguments): agnoci.Node {
  const command = `npm install`
  const commandArgs: string[] = []

  if (args?.package) {
    commandArgs.push(args?.package)
  }

  if (args?.noSave) {
    commandArgs.push('--no-save')
  }
  
  if (args?.noOptional) {
    commandArgs.push(`--no-optional`)
  }
  
  return agnoci.command(`${command} ${commandArgs.join(' ')}`)
}

export function run (script: string): agnoci.Node {
  return agnoci.command(`npm install ${script}`)
}

export function test (): agnoci.Node {
  return agnoci.command(`npm test`)
}
