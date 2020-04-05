import {
  Pipeline,
  Target
} from './pipeline'

import { Node } from './blocks'

import { generate as buildkite } from './providers/buildkite/buildkite'
import { generate as bash } from './providers/bash/bash'
import { generate as gitlab } from './providers/gitlab/gitlab'

export function generate (
  pipeline: Pipeline
): any {
  switch (pipeline.target) {
    case Target.Buildkite: return buildkite(pipeline)
    case Target.Bash: return bash(pipeline)
    case Target.Gitlab: return gitlab(pipeline)
  }
}
