import test from 'ava'
import * as agnoci from '@agnoci/core'

import * as s3 from '../src/s3'

test('sync: returns correct string', (t) => {
  const result = s3.sync('my-source', 'my-destination')
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'aws s3 sync my-source my-destination')
})

test('sync: allows passing in node opts', (t) => {
  const result = s3.sync('my-source', 'my-destination', null, {
    description: 'my-description'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.opts.description, 'my-description')
})
