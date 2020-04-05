import { Node } from './blocks'
import { generate } from './generator'

export enum Target {
  Buildkite = 'Buildkite',
  Bash = 'Bash',
  Gitlab = 'Gitlab'
}

export interface PipelineConfiguration {
  target: Target
}

export class Pipeline {
  #steps: Node[] = []

  #config: PipelineConfiguration

  readonly target: Target

  constructor (config: PipelineConfiguration) {
    this.#config = config

    this.target = config.target
  }

  append (node: Node | Node[]): this {
    if (Array.isArray(node)) {
      this.#steps = this.#steps.concat(node)
    } else {
      this.#steps.push(node)
    }

    return this
  }

  steps (): Node[] {
    return this.#steps
  }

  generate (): any {
    return generate(this)
  }
}
