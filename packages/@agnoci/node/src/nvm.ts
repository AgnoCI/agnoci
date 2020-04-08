import * as agnoci from '@agnoci/core'

const usesNodeRegex = /(?:node|npm|npx|yarn)/

export function useHook (version: string): agnoci.VisitorHook {
  return (node: agnoci.Node): agnoci.VisitorHookResult => {
    if (!agnoci.isCommandNode(node)) return node
    if (!usesNodeRegex.test(node.args.command)) return node

    // Prepend our nvm command
    node.args.command = `nvm install ${version} && ${node.args.command}`

    return node
  }
}
