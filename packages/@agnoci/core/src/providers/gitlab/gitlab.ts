import * as yaml from 'js-yaml'

import * as nodes from '../../blocks'

import {
  EnvironmentKey,
  resolveEnvironment,
  EnvironmentResolver
} from '../../environment'

import * as GLTypes from './types'

let stageIndex = 0
let stages: string[] = []
let branchRestrictions: string[] | null = null
let globalEnv: EnvironmentResolver | null = null

export function generate (pipeline: nodes.Node[]): string {
  const steps = iterate(pipeline)

  const _stages: {
    [stage: string]: GLTypes.GLStep
  } = {}

  steps.forEach(([ step, label ], i) => {
    _stages[label || `step_${i}`] = step
  })

  let result: GLTypes.GLPipeline = {
    stages,
  }

  if (globalEnv) {
    result.variables = resolveEnvironment(globalEnv, resolveEnvironmentKey)
  }

  // Merge our 'steps' into our result
  result = {
    ...result,
    ..._stages
  }

  return yaml.safeDump(result, {
    lineWidth: 500
  })
}

function processNode (node: nodes.Node, parent?: nodes.Node): Array<GLTypes.GLStepLabel> {
  switch (node.type) {
    case nodes.NodeType.Command: {
      const [ command, label ] = generateCommand(node)

      if (
        parent?.type === nodes.NodeType.Single ||
        parent?.type === nodes.NodeType.Parallel
      ) {
        command.stage = stages[stages.length - 1]
      } else {
        command.stage = `stage_${++stageIndex}`
        stages.push(command.stage)
      }

      if (node.opts?.env) {
        command.variables = resolveEnvironment(node.opts.env, resolveEnvironmentKey)
      }

      return [ [ command, label ] ]
    }
  
    case nodes.NodeType.Single: {
      const [ single, singleLabel ] = generateSingle(node)

      if (
        parent?.type === nodes.NodeType.Single ||
        parent?.type === nodes.NodeType.Parallel
      ) {
        single.stage = stages[stages.length - 1]
      } else {
        single.stage = `stage_${++stageIndex}`
        stages.push(single.stage)
      }

      return [ [ single, singleLabel ] ]
    }

    case nodes.NodeType.Parallel: {
      const nodes = generateParallel(node)
      const nextStage = `stage_${++stageIndex}`
      stages.push(nextStage)
      return nodes.map(([ node, label ]) => {
        return [ { ...node, stage: nextStage }, label ]
      })
    }

    case nodes.NodeType.Manual: {
      const [ [ step , label ] ] = generateManual(node)

      if (
        parent?.type === nodes.NodeType.Single ||
        parent?.type === nodes.NodeType.Parallel
      ) {
        step.stage = stages[stages.length - 1]
      } else {
        step.stage = `stage_${++stageIndex}`
        stages.push(step.stage)
      }

      return [ [ step, label ] ]
    }

    case nodes.NodeType.ArtifactDownload: {
      // We don't actually have to do anything here.
      // Gitlab will automatically download artifacts from
      // previous stages.
      return []
    }

    case nodes.NodeType.ArtifactUpload: {
      // We don't actually process this node like others.
      // It's processed manually from inside the
      // Single step handler. Major hack.
      return []
    }

    case nodes.NodeType.StopUnlessBranch: {
      // Set our global so we can affect all future steps.
      branchRestrictions = Array.isArray(node.args.branch) ? node.args.branch : [ node.args.branch ]
      return []
    }

    case nodes.NodeType.GlobalEnvironment: {
      if (!globalEnv) globalEnv = {}
      globalEnv = { ...globalEnv, ...node.args.env }
      return []
    }
  
    default: throw new Error(`Unknown node type ${node.type}`)
  }
}

function generateCommand (node: nodes.CommandNode): GLTypes.GLStepLabel {
  let command: GLTypes.GLStep = {
    stage: '__replace__',
    script: [ node.args.command ]
  }

  if (node.opts?.branches) {
    command.rules = generateBranchRule(node.opts.branches)
  }

  if (branchRestrictions) {
    command.rules = generateBranchRule(branchRestrictions)
  }

  return [ command, node.opts?.description ]
}

function generateBranchRule (branches: string[]): GLTypes.IfRule[] {
  const branchKey = resolveEnvironmentKey('branch')

  return branches.map((branch) => ({
    if: `${branchKey} == "${branch}"`,
    when: 'always'
  }))
}

function generateSingle (node: nodes.SingleNode): GLTypes.GLStepLabel {
  // Super hacky, but can't really figure out any better way to do this.
  // For artifacts, we're going to pull out all the artifactUpload steps
  // from our children, then manually apply them to this step.
  const nonUploadSteps = node.args.steps.filter((step) => step.type !== nodes.NodeType.ArtifactUpload)
  const uploadSteps = node.args.steps.filter((step) => step.type === nodes.NodeType.ArtifactUpload)

  const children = iterate(nonUploadSteps, node)

  const step: GLTypes.GLStep = {
    stage: '__replace',
    script: []
  }

  children.forEach(([ node ]) => {
    step.script = [ ...step.script, ...node.script ]

    if (node.variables) {
      if (!step.variables) step.variables = {}
      step.variables = { ...step.variables, ...node.variables }
    }
  })

  if (node.opts?.branches) {
    step.rules = generateBranchRule(node.opts.branches)
  }

  if (branchRestrictions) {
    step.rules = generateBranchRule(branchRestrictions)
  }

  // Iterate over our upload steps, and merge them into
  // our generated single step here.
  if (uploadSteps.length) {
    const paths = uploadSteps.reduce((paths, step) => {
      if (step.type !== nodes.NodeType.ArtifactUpload) return paths
      return [ ...paths, step.args.destination ]
    }, [])

    step.artifacts = {
      paths
    }
  }

  return [ step, node.opts?.description ]
}

function generateParallel (node: nodes.ParallelNode): Array<GLTypes.GLStepLabel> {
  return iterate(node.args.steps, node)
}

function generateManual (node: nodes.ManualNode): Array<GLTypes.GLStepLabel> {
  const step: GLTypes.GLStep = {
    stage: '__replace',
    script: [
      `echo ${node.opts?.description || 'Unblock'}`
    ],
    when: 'manual'
  }

  return [ [ step, node.opts?.description ] ]
}

function iterate (node: Array<nodes.Node | nodes.Node[]>, parent?: nodes.Node): Array<GLTypes.GLStepLabel> {
  return node.reduce<GLTypes.GLStepLabel[]>((prev, child) => {
    if (Array.isArray(child)) {
      return prev.concat(iterate(child, parent))
    }

    return [ ...prev, ...processNode(child, parent) ]
  }, [])
}

function resolveEnvironmentKey (key: keyof typeof EnvironmentKey): string {
  switch (key) {
    case EnvironmentKey.branch: return '${CI_COMMIT_BRANCH}'
    case EnvironmentKey.commit: return '${CI_COMMIT_SHA}'
  }
}
