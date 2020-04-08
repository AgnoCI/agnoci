import test from 'ava'
import * as agnoci from '@agnoci/core'

import * as ecr from '../src/ecr'

test('createRepository: returns correct string', (t) => {
  const result = ecr.createRepository('my-repo')
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'aws ecr create-repository --repository-name my-repo')
})

test('createRepository: allows passing in node opts', (t) => {
  const result = ecr.createRepository('my-repo', null, {
    description: 'my-description'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.opts.description, 'my-description')
})
