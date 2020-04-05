import { Pipeline, Target, command, manual, parallel, env } from '../../packages/@agnoci/core'

const pipeline = new Pipeline({
  target: Target.Buildkite
})

pipeline.append(command('echo hello world'))
pipeline.append(manual({ description: 'Please unblock me' }))
pipeline.append(parallel([
  command('echo I have been unblocked!'),
  command('echo My git branch is $branch', {
    env: {
      branch: env.branch()
    }
  })
]))

console.log(JSON.stringify(pipeline.generate(), null, 2))
