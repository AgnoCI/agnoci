import {
  PipelineConfiguration,
  Target
} from './core'

import { Node } from './blocks'

import { generate as buildkite } from './providers/buildkite/buildkite'
import { generate as bash } from './providers/bash/bash'
import { generate as gitlab } from './providers/gitlab/gitlab'

export function generate (
  pipeline: Node[],
  config: PipelineConfiguration
): unknown {
  switch (config.target) {
    case Target.Buildkite: return buildkite(pipeline)
    case Target.Bash: return bash(pipeline)
    case Target.Gitlab: return gitlab(pipeline)
  }
}
