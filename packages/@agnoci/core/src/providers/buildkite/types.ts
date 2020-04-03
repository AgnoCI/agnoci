interface Agents {
  [key: string]: string
}

type Retry = {
  manual: false,
  allowed?: boolean,
  permit_on_passed?: boolean,
  reason?: string
} | {
  automatic: true,
  exit_status?: number | string,
  limit?: number
}

interface SoftFail {
  exit_status?: number | string
}

export interface BKCommand {
  command: string | string[],
  agents?: Agents,
  allow_dependency_failure?: boolean,
  artifacts_paths?: string,
  branches?: string,
  concurrency?: number,
  concurrency_group?: string,
  depends_on?: string[],
  env?: NodeJS.ProcessEnv,
  if?: string,
  key?: string,
  label?: string,
  parallelism?: number,
  retry?: Retry,
  skip?: any,
  soft_fail?: SoftFail,
  timeout_in_minutes?: number
}

export interface BKWait {
  type: 'waiter',
  continue_on_failure?: boolean,
  if?: string,
  depends_on?: string[],
  allow_dependency_failure?: boolean
}

interface TextInput {
  key: string,
  hint?: string,
  required?: boolean,
  default?: string
}

interface SelectInput {
  key: string,
  options?: Array<{ label: string, value: string }>,
  hint?: string,
  required?: boolean,
  multiple?: boolean,
  default?: string | string[]
}

export interface BKManual {
  type: 'manual',
  prompt?: string,
  fields?: unknown[],
  branches?: string,
  if?: string,
  depends_on?: string,
  allow_dependency_failure?: boolean,
  label?: string
}

export interface BKInput {
  input: string,
  fields: Array<TextInput | SelectInput>
}

export interface BKTrigger {
  trigger: string,
  build?: {
    message?: string,
    commit?: string,
    branch?: string,
    meta_data?: { [key: string]: string },
    env: NodeJS.ProcessEnv
  },
  async?: boolean,
  branches?: string,
  if?: string,
  depends_on?: string,
  allow_dependency_failures?: boolean
}

export type BKNode = BKCommand | BKWait | BKManual | BKInput | BKTrigger

export interface BKPipeline {
  env?: NodeJS.ProcessEnv,
  steps: Array<BKNode>
}
