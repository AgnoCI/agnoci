import * as agnoci from '@agnoci/core'

interface InstallArguments {
  package?: string,
  noOptional?: boolean,
  noSave?: boolean
}

export function install (args?: InstallArguments, opts?: agnoci.NodeOpts): agnoci.Node {
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
  
  return agnoci.command(`${command} ${commandArgs.join(' ')}`, opts)
}

export function run (script: string, opts?: agnoci.NodeOpts): agnoci.Node {
  return agnoci.command(`npm install ${script}`, opts)
}

export function test (opts?: agnoci.NodeOpts): agnoci.Node {
  return agnoci.command(`npm test`, opts)
}
