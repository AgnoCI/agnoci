import * as agnoci from '../../packages/@agnoci/core'

const builder: agnoci.PipelineBuilder = (ctx) => {
  ctx.append(agnoci.command('echo hello world'))
  ctx.append(agnoci.manual({ description: 'Please unblock me' }))
  ctx.append(agnoci.parallel([
    agnoci.command('echo I have been unblocked!'),
    agnoci.command('echo My git branch is $branch', {
      env: { branch: agnoci.env.branch() }
    })
  ]))
}

const pipeline = agnoci.Pipeline(builder, {
  target: agnoci.Target.Buildkite
})

console.log(JSON.stringify(pipeline, null, 2))
