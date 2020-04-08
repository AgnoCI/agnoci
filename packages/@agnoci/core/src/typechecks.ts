import * as nodes from './blocks'

export function isCommandNode (x: any): x is nodes.CommandNode {
  return x.type === nodes.NodeType.Command
}

export function isManualNode (x: any): x is nodes.ManualNode {
  return x.type === nodes.NodeType.Manual
}

export function isWaitNode (x: any): x is nodes.WaitNode {
  return x.type === nodes.NodeType.Wait
}

export function isParallelNode (x: any): x is nodes.ParallelNode {
  return x.type === nodes.NodeType.Parallel
}

export function isSingleNode (x: any): x is nodes.SingleNode {
  return x.type === nodes.NodeType.Single
}

export function isArtifactDownload (x: any): x is nodes.ArtifactDownloadNode {
  return x.type === nodes.NodeType.ArtifactDownload
}

export function isArtifactUpload (x: any): x is nodes.ArtifactUploadNode {
  return x.type === nodes.NodeType.ArtifactUpload
}

export function isStopUnlessBranch (x: any): x is nodes.StopUnlessBranchNode {
  return x.type === nodes.NodeType.StopUnlessBranch
}

export function isGlobalEnvironment (x: any): x is nodes.GlobalEnvironmentNode {
  return x.type === nodes.NodeType.GlobalEnvironment
}
