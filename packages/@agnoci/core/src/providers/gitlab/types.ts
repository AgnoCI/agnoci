import { Environment } from '../../environment'

export interface IfRule {
  if: string,
  when: 'always'
}

export interface GLStep {
  stage: string,
  script: string[]
  when?: 'manual',
  variables?: Environment,
  rules?: Array<IfRule>,
  artifacts?: {
    paths: string[]
  }
}

export type GLStepLabel = [ GLStep, string | undefined ]

interface GLBasePipeline {
  stages?: string[],
  variables?: {
    [key: string]: string
  }
}

export interface GLPipeline extends GLBasePipeline {
  [key: string]: GLStep | GLBasePipeline['stages'] | GLBasePipeline['variables']
}
