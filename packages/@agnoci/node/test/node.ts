import test from 'ava'

import * as node from '../src/node'

test('node should export npm', (t) => {
  t.truthy(node.npm)
})
