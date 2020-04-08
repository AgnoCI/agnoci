import * as agnoci from '@agnoci/core'

const pipeline = new agnoci.Pipeline({
  target: agnoci.Target.Buildkite
})

pipeline.append(agnoci.command('echo Hello World!'))

export default pipeline
