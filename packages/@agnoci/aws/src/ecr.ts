import * as agnoci from '@agnoci/core'

interface CreateRepositoryArgs {
  'tags'?: { [key: string]: string },
  'image-tag-mutability'?: 'MUTABLE' | 'IMMUTABLE',
  'image-scanning-configuration'?: {
    scanOnPush: boolean
  },
  'cli-input-json'?: string,
  'generate-cli-skeleton'?: string
}

export function createRepository (name: string, params?: CreateRepositoryArgs, opts?: agnoci.NodeOpts): agnoci.Node {
  const baseCommand = `aws ecr create-repository --repository-name ${name}`
  const commandParts: string[] = []

  for (const key in params) {
    let value = params[key]

    if (typeof value === 'object') value = JSON.stringify(value)
    commandParts.push(`--${key} ${value}`)    
  }

  commandParts.unshift(baseCommand)

  return agnoci.command(commandParts.join(' '), opts)
}
