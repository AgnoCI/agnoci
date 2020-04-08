import * as agnoci from '../../packages/@agnoci/core'
import * as node from '../../packages/@agnoci/node'

const pipeline = new agnoci.Pipeline({
  target: agnoci.Target.Buildkite
})

const iLikePineapples: agnoci.VisitorHook = (node) => {
  // We don't care about anything that's not a command
  if (!agnoci.isCommandNode(node)) return node

  // Replace all instances of `banana` with `pineapple`
  node.args.command = node.args.command.replace('banana', 'pineapple')

  return node
}

pipeline.addVisitorHook(iLikePineapples)
pipeline.addVisitorHook(node.nvm.useHook('v12.16.1'))

pipeline.append(agnoci.command('echo my test value is: banana'))
pipeline.append(agnoci.command('node --version'))

console.log(JSON.stringify(pipeline.generate(), null, 2))
