import {
  NodeType,
  Node
} from './blocks'

export class Artifact {
  #source: string
  #destination: string
  #directory: boolean

  constructor ({
    source,
    destination,
    directory
  }: {
    source: string,
    destination: string,
    directory: boolean
  }) {
    this.#source = source
    this.#destination = destination
    this.#directory = directory
  }

  download (): Node {
    return {
      type: NodeType.ArtifactDownload,
      args: {
        destination: this.#destination,
        directory: this.#directory
      }
    }
  }

  upload (): Node {
    return {
      type: NodeType.ArtifactUpload,
      args: {
        source: this.#source,
        directory: this.#directory,
        destination: this.#destination
      }
    }
  }
}
