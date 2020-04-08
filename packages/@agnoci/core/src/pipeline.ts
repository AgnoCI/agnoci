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

export type VisitorHookResult = null | Node | Node[]
export type VisitorHook = (node?: Node) => VisitorHookResult

export class Pipeline {
  #steps: Node[] = []
  #visitorHooks: VisitorHook[] = []

  #config: PipelineConfiguration

  readonly target: Target

  constructor (config: PipelineConfiguration) {
    this.#config = config

    this.target = config.target
  }

  append (node: Node): this {
    const hookResult: VisitorHookResult = this.#visitorHooks.reduce((prev, hook) => {
      return hook(prev)
    }, node)

    if (Array.isArray(hookResult)) {
      this.#steps = this.#steps.concat(hookResult)
    } else {
      this.#steps.push(hookResult)
    }

    return this
  }

  steps (): Node[] {
    return this.#steps
  }

  addVisitorHook (hook: VisitorHook): void {
    this.#visitorHooks.push(hook)
  }

  removeVisitorHook (hook: VisitorHook): void {
    this.#visitorHooks.splice(this.#visitorHooks.indexOf(hook), 1)
  }

  generate (): any {
    return generate(this)
  }
}
