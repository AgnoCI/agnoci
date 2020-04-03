import {
  Node
} from './blocks'

import * as environment from './environment'

export { Node, NodeOpts, command, manual, wait, parallel, single, stopUnlessBranch, globalEnvironment } from './blocks'
export { Artifact } from './artifact'

import { generate } from './generator'

export enum Target {
  Buildkite = 'Buildkite',
  Bash = 'Bash',
  Gitlab = 'Gitlab'
}

interface Context {
  append: (node: Node | Node[]) => void
}

export type PipelineBuilder = (
  ctx: Context
) => void

export interface PipelineConfiguration {
  target: Target
}

export function Pipeline (builder: PipelineBuilder, config: PipelineConfiguration) {
  let steps: Node[] = []

  const append = (node: Node | Node[]) => {
    if (Array.isArray(node)) {
      steps = steps.concat(node)
    } else {
      steps.push(node)
    }
  }

  const ctx: Context = {
    append
  }

  builder(ctx)

  return generate(steps, config)
}

export const env = environment.keys
