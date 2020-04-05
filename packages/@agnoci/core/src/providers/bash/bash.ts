import { Pipeline } from '../../pipeline'
import * as nodes from '../../blocks'

import {
  EnvironmentKey,
  resolveEnvironment,
  EnvironmentResolver
} from '../../environment'

let branchRestrictions: string[] | null = null
let globalEnv: EnvironmentResolver | null = null

export function generate (pipeline: Pipeline): string {
  let steps: string[] = iterate(pipeline.steps())

  if (globalEnv) {
    const env = resolveEnvironment(globalEnv, resolveEnvironmentKey)
    const exported: string[] = Object.keys(env).reduce((prev, key) => {
      return [ ...prev, toExport(key, env[key]) ]
    }, [])
    steps = [ ...exported, ...steps ]
  }

  return steps.join('\n')
}

function processNode (node: nodes.Node): string[] {
  switch (node.type) {
    case nodes.NodeType.Command: return generateCommand(node)
    case nodes.NodeType.Manual: return [ generateManual(node) ]
    case nodes.NodeType.Wait: return [ generateWait(node) ]
    case nodes.NodeType.Parallel: return generateParallel(node)
    case nodes.NodeType.Single: return [ generateSingle(node) ]

    // noop artifact nodes
    case nodes.NodeType.ArtifactDownload: return []
    case nodes.NodeType.ArtifactUpload: return []

    case nodes.NodeType.StopUnlessBranch: {
      branchRestrictions = Array.isArray(node.args.branch) ? node.args.branch : [ node.args.branch ]
      return []
    }

    case nodes.NodeType.GlobalEnvironment: {
      globalEnv = node.args.env
      return []
    }
  }
}

function toExport (key: string, value: string): string {
  return `export ${key}=${value}`
}

function maybeBranchWrapCommand (cmd: string | string[], branches?: string[]): string[] {
  if (!branches) {
    if (!branchRestrictions) {
      return Array.isArray(cmd) ? cmd : [ cmd ]
    }
    branches = branchRestrictions
  }

  let result: string[] = []

  // Export our current branch variable first.
  result.push(toExport('_AGNO_BRANCH', resolveEnvironmentKey('branch')))

  const ifStatement = branches.map((branch) => {
    return `"\${_AGNO_BRANCH}" == "${branch}"`
  }).join(' || ')

  // Build our if statement
  result.push(`if [[ ${ifStatement} ]]; then`)

  // Indent actual command so it looks prettier
  if (Array.isArray(cmd)) {
    result = result.concat(cmd.map((line) => `  ${line}`))
  } else {
    result.push(`  ${cmd}`)
  }

  // Finish off our if statement
  result.push(`fi`)

  return result
}

function generateCommand (node: nodes.CommandNode): string[] {
  let result: string[] = []

  if (node.opts?.description) {
    result.push(`# ${node.opts.description}`)
  }

  if (node.opts?.env) {
    const env = resolveEnvironment(node.opts.env, resolveEnvironmentKey)
    
    for (const key in env) {
      result.push(`export ${key}=${env[key]}`)
    }
  }

  result = [ ...result, ...maybeBranchWrapCommand(node.args.command, node.opts?.branches) ]

  return result
}

function generateManual (node: nodes.ManualNode): string {
  // TODO?
  return '# MANUAL STEP'
}

function generateWait (node: nodes.WaitNode): string {
  // Wait nodes are not supported in bash.
  // All commands block.
  return '# WAIT'
}

function generateSingle (node: nodes.SingleNode): string {
  const children = iterate(node.args.steps)
  let lines: string[] = [ ...children ]

  if (node.opts?.description) {
    lines.unshift(`### ${node.opts.description}`)
  }

  const cmd = maybeBranchWrapCommand(lines, node.opts?.branches)

  return cmd.join('\n')
}

function generateParallel (node: nodes.ParallelNode): string[] {
  return iterate(node.args.steps)
}

function iterate (node: Array<nodes.Node | nodes.Node[]>): string[] {
  return node.reduce<string[]>((prev, child) => {
    if (Array.isArray(child)) {
      return prev.concat(iterate(child))
    }

    return prev.concat(processNode(child))
  }, [])
}

function resolveEnvironmentKey (key: keyof typeof EnvironmentKey): string {
  switch (key) {
    case EnvironmentKey.branch: return '`git rev-parse --abbrev-ref HEAD`'
    case EnvironmentKey.commit: return '`git rev-parse HEAD`'
  }
}
