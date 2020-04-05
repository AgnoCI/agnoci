import { Pipeline } from '../../pipeline'
import * as nodes from '../../blocks'

import {
  EnvironmentKey,
  resolveEnvironment,
  EnvironmentResolver
} from '../../environment'

import * as BKTypes from './types'

let branchRestrictions: string[] | null = null
let globalEnv: EnvironmentResolver | null = null

export function generate (pipeline: Pipeline): BKTypes.BKPipeline {
  const steps: BKTypes.BKNode[] = iterate(pipeline.steps())

  const result: BKTypes.BKPipeline = {
    steps
  }

  if (globalEnv) {
    result.env = resolveEnvironment(globalEnv, resolveEnvironmentKey)
  }

  return result
}

function processNode (node: nodes.Node, prevNodes?: BKTypes.BKNode[], parentType?: nodes.NodeType): BKTypes.BKNode[] {
  const pre: BKTypes.BKNode[] = []

  const lastNode = prevNodes && prevNodes[prevNodes.length - 1]

  if (
    lastNode &&
    'command' in lastNode &&
    parentType !== nodes.NodeType.Parallel
  ) {
    pre.push(generateWait())
  }
  
  switch (node.type) {
    case nodes.NodeType.Command: return [ ...pre, generateCommand(node) ]
    case nodes.NodeType.Manual: return [ ...pre, generateManual(node) ]
    case nodes.NodeType.Wait: return [ ...pre, generateWait(node) ]
    case nodes.NodeType.Parallel: return [ ...pre, ...generateParallel(node) ]
    case nodes.NodeType.Single: return [ ...pre, generateSingle(node) ]
    case nodes.NodeType.ArtifactDownload: return [ ...pre, generateArtifactDownload(node) ]
    case nodes.NodeType.ArtifactUpload: return [ ...pre, generateArtifactUpload(node) ]
    case nodes.NodeType.StopUnlessBranch: {
      // Set our global so we can affect all future steps.
      branchRestrictions = Array.isArray(node.args.branch) ? node.args.branch : [ node.args.branch ]
      return []
    }
    case nodes.NodeType.GlobalEnvironment: {
      globalEnv = node.args.env
      return []
    }
  }
}

function generateCommand (node: nodes.CommandNode): BKTypes.BKCommand {
  const result: BKTypes.BKCommand = {
    command: node.args.command
  }
  
  if (node.opts?.env) {
    result.env = resolveEnvironment(node.opts.env, resolveEnvironmentKey)
  }

  if (node.opts?.description) {
    result.label = node.opts.description
  }

  if (node.opts?.branches || branchRestrictions) {
    const branches = node.opts?.branches || branchRestrictions
    result.branches = branches.join(' ')
  }

  return result
}

function generateManual (node: nodes.ManualNode): BKTypes.BKManual {
  const step: BKTypes.BKManual = {
    type: 'manual'
  }

  if (node.opts?.description) {
    step.label = node.opts.description
  }

  return step
}

function generateWait (node?: nodes.WaitNode): BKTypes.BKWait {
  return {
    type: 'waiter'
  }
}

function generateParallel (node: nodes.ParallelNode): BKTypes.BKNode[] {
  return iterate(node.args.steps, node.type)
}

function generateSingle (node: nodes.SingleNode): BKTypes.BKCommand {
  const children = iterate(node.args.steps, node.type)

  const cmd: BKTypes.BKCommand = {
    command: ''
  }

  // Loop over all our children and merge everything in.
  children.forEach((node) => {
    if (!('command' in node)) return
    
    if (!cmd.command) {
      cmd.command = node.command
    } else {
      cmd.command += ` && ${node.command}`
    }

    if (node.env && !cmd.env) cmd.env = {}

    cmd.env = { ...cmd.env, ...node.env }
  })

  if (node.opts?.description) {
    cmd.label = node.opts.description
  }

  if (node.opts?.branches || branchRestrictions) {
    const branches = node.opts?.branches || branchRestrictions
    cmd.branches = branches.join(' ')
  }

  return cmd
}

function generateArtifactDownload (node: nodes.ArtifactDownloadNode): BKTypes.BKCommand {
  const commands: string[] = []

  if (node.args.directory) {
    const destination = node.args.destination.endsWith('.tar.gz') ? node.args.destination : `${node.args.destination}.tar.gz`

    // If our artifact is a directory, we need to untar it.
    commands.push(`buildkite-agent artifact download ${destination}`)
    commands.push(`tar xvfz ${destination}`)
    commands.push(`rm ${destination}`)
  } else {
    commands.push(`buildkite-agent artifact download ${node.args.destination}`)
  }

  return {
    command: commands.join(' && ')
  }
}

function generateArtifactUpload (node: nodes.ArtifactUploadNode): BKTypes.BKCommand {
  const commands: string[] = []

  if (node.args.directory) {
    const destination = node.args.destination.endsWith('.tar.gz') ? node.args.destination : `${node.args.destination}.tar.gz`

    // If our artifact is a directory, let's tar it up and then upload that instead.
    commands.push(`tar cvfz ${destination} ${node.args.source}`)
    commands.push(`buildkite-agent artifact upload ${destination}`)
    commands.push(`rm ${destination}`)
  } else {
    commands.push(`buildkite-agent artifact upload ${node.args.source}`)
  }

  return {
    command: commands.join(' && ')
  }
}

function iterate (node: Array<nodes.Node | nodes.Node[]>, parentType?: nodes.NodeType): BKTypes.BKNode[] {
  return node.reduce<BKTypes.BKNode[]>((prev, child) => {
    if (Array.isArray(child)) {
      return prev.concat(iterate(child, parentType))
    }

    return prev.concat(processNode(child, prev, parentType))
  }, [])
}

function resolveEnvironmentKey (key: keyof typeof EnvironmentKey): string {
  switch (key) {
    case EnvironmentKey.branch: return '$BUILDKITE_BRANCH'
    case EnvironmentKey.commit: return '$BUILDKITE_COMMIT'
  }
}
