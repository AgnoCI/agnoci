import * as agnoci from '@agnoci/core'

interface PushArgs {
  image: string,
  tag?: string
}

interface BuildArgs {
  image: string,
  tag: string,
  dockerfile?: string,
  directory?: string
}

interface LoginArgs {
  username: string,
  password: string,
  registry?: string
}

interface RunArgs {
  workDir?: string,
  volumes?: Array<{
    source: string,
    destination: string
  }>,
  image: string,
  command?: string
}

interface TagArgs {
  image: string,
  oldTag: string,
  newTag: string
}

export function push (args: PushArgs, opts?: agnoci.NodeOpts): agnoci.Node {
  let image = args.image

  if (args.tag) image += `:${args.tag}`

  return agnoci.command(`docker push ${image}`, opts)
}

export function build (args: BuildArgs, opts?: agnoci.NodeOpts): agnoci.Node {
  const command = `docker build`
  const commandArgs: string[] = [
    `-t ${args.image}:${args.tag}`
  ]

  if (args?.dockerfile) {
    commandArgs.push(`-f ${args.dockerfile}`)
  }

  commandArgs.push(args.directory || '.')

  return agnoci.command(`${command} ${commandArgs.join(' ')}`, opts)
}

export function login (args: LoginArgs, opts?: agnoci.NodeOpts): agnoci.Node {
  const command: string[] = [
    `docker login`,
    `-u ${args.username}`,
    `-p ${args.password}`
  ]

  if (args.registry) {
    command.push(args.registry)
  }

  return agnoci.command(command.join(' '), opts)
}

export function run (args: RunArgs, opts?: agnoci.NodeOpts): agnoci.Node {
  const command: string[] = [
    `docker run`
  ]

  if (args.workDir) {
    command.push(`-w ${args.workDir}`)
  }

  if (args.volumes) {
    args.volumes.forEach(({ source, destination }) => {
      command.push(`-v ${source}:${destination}`)
    })
  }

  command.push(args.image)

  if (args.command) {
    command.push(`-- ${args.command}`)
  }

  return agnoci.command(command.join(' '), opts)
}

export function tag (args: TagArgs, opts?: agnoci.NodeOpts): agnoci.Node {
  return agnoci.command(`docker tag ${args.image}:${args.oldTag} ${args.image}:${args.newTag}`)
}
