import { EnvironmentResolver } from './environment'

export enum NodeType {
  Command = 'Command',
  Manual = 'Manual',
  Wait = 'Wait',
  Parallel = 'Parallel',
  Single = 'Single',
  ArtifactDownload = 'ArtifactDownload',
  ArtifactUpload = 'ArtifactUpload',
  StopUnlessBranch = 'StopUnlessBranch',
  GlobalEnvironment = 'GlobalEnvironment'
}

export interface NodeOpts {
  env?: EnvironmentResolver,
  description?: string,
  branches?: string[]
}

export interface BaseNode<T extends NodeType, NodeArgs = {}> {
  type: T,
  args: NodeArgs,
  opts?: NodeOpts
}

interface CommandArgs {
  command: string
}

interface ParallelArgs {
  steps: Array<Node | Node[]>
}

interface SingleArgs {
  steps: Node[]
}

interface ArtifactDownloadArgs {
  destination: string,
  directory: boolean
}

interface ArtifactUploadArgs {
  source: string,
  destination: string,
  directory: boolean
}

interface StopUnlessBranchArgs {
  branch: string | string[]
}

interface GlobalEnvironmentArgs {
  env: EnvironmentResolver
}

export type CommandNode = BaseNode<NodeType.Command, CommandArgs>
export type ManualNode = BaseNode<NodeType.Manual, {}>
export type WaitNode = BaseNode<NodeType.Wait, {}>
export type ParallelNode = BaseNode<NodeType.Parallel, ParallelArgs>
export type SingleNode = BaseNode<NodeType.Single, SingleArgs>
export type ArtifactDownloadNode = BaseNode<NodeType.ArtifactDownload, ArtifactDownloadArgs>
export type ArtifactUploadNode = BaseNode<NodeType.ArtifactUpload, ArtifactUploadArgs>
export type StopUnlessBranchNode = BaseNode<NodeType.StopUnlessBranch, StopUnlessBranchArgs>
export type GlobalEnvironmentNode = BaseNode<NodeType.GlobalEnvironment, GlobalEnvironmentArgs>

export type Node =
  CommandNode |
  ManualNode |
  WaitNode |
  ParallelNode |
  SingleNode |
  ArtifactDownloadNode |
  ArtifactUploadNode |
  StopUnlessBranchNode |
  GlobalEnvironmentNode

export function command (
  command: string,
  opts?: NodeOpts
): Node {
  return {
    type: NodeType.Command,
    args: {
      command
    },
    opts
  }
}

export function manual (
  opts?: NodeOpts
): Node {
  return {
    type: NodeType.Manual,
    opts,
    args: {}
  }
}

export function wait (
  opts?: NodeOpts
): Node {
  return {
    type: NodeType.Wait,
    opts,
    args: {}
  }
}

export function parallel (
  steps: Array<Node | Node[]>,
  opts?: NodeOpts
): Node {
  return {
    type: NodeType.Parallel,
    args: {
      steps
    },
    opts
  }
}

export function single (
  steps: Node[],
  opts?: NodeOpts
): Node {
  return {
    type: NodeType.Single,
    args: {
      steps
    },
    opts
  }
}

export function stopUnlessBranch (
  branch: string | string[]
): Node {
  return {
    type: NodeType.StopUnlessBranch,
    args: {
      branch
    }
  }
}

export function globalEnvironment (
  env: EnvironmentResolver
): Node {
  return {
    type: NodeType.GlobalEnvironment,
    args: {
      env
    }
  }
}
