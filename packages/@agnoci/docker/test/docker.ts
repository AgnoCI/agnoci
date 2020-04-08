import test from 'ava'
import * as agnoci from '@agnoci/core'

import * as docker from '../src/docker'

test('push: should return correct string', (t) => {
  const result = docker.push({ image: 'my_test_image' })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker push my_test_image')
})

test('push: should allow tagging image', (t) => {
  const result = docker.push({ image: 'my_test_image', tag: 'my_tag' })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker push my_test_image:my_tag')
})

test('push: should allow passing opts', (t) => {
  const result = docker.push({ image: 'my_test_image' }, {
    description: 'my_description'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.truthy(result.opts)
  t.is(result.opts.description, 'my_description')
})

test('build: should return correct string', (t) => {
  const result = docker.build({ image: 'my_image', tag: 'my_tag' })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker build -t my_image:my_tag .')
})

test('build: allows setting Dockerfile', (t) => {
  const result = docker.build({
    image: 'my_image',
    tag: 'my_tag',
    dockerfile: 'my_dockerfile'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker build -t my_image:my_tag -f my_dockerfile .')
})

test('build: allows setting working directory', (t) => {
  const result = docker.build({
    image: 'my_image',
    tag: 'my_tag',
    directory: 'my_directory'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker build -t my_image:my_tag my_directory')
})

test('build: should allow passing opts', (t) => {
  const result = docker.build({
    image: 'my_test_image',
    tag: 'my_tag'
  }, {
    description: 'my_description'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.truthy(result.opts)
  t.is(result.opts.description, 'my_description')
})

test('login: should return correct string', (t) => {
  const result = docker.login({ username: 'my_username', password: 'my_password' })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker login -u my_username -p my_password')
})

test('login: allows setting registry', (t) => {
  const result = docker.login({
    username: 'my_username',
    password: 'my_password',
    registry: 'my_registry'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker login -u my_username -p my_password my_registry')
})

test('run: should return correct string', (t) => {
  const result = docker.run({
    image: 'my_image'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker run my_image')
})

test('run: allows setting command', (t) => {
  const result = docker.run({
    image: 'my_image',
    command: 'my_command'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker run my_image -- my_command')
})

test('run: allows workDir', (t) => {
  const result = docker.run({
    image: 'my_image',
    workDir: 'my_work_dir'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker run -w my_work_dir my_image')
})

test('run: allows setting volumes', (t) => {
  const result = docker.run({
    image: 'my_image',
    volumes: [
      { source: 'my_source_1', destination: 'my_dest_1' },
      { source: 'my_source_2', destination: 'my_dest_2' }
    ]
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker run -v my_source_1:my_dest_1 -v my_source_2:my_dest_2 my_image')
})

test('run: should allow passing opts', (t) => {
  const result = docker.run({ image: 'my_test_image' }, {
    description: 'my_description'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.truthy(result.opts)
  t.is(result.opts.description, 'my_description')
})

test('tag: should return correct string', (t) => {
  const result = docker.tag({
    image: 'my_test_image',
    oldTag: 'my_old_tag',
    newTag: 'my_new_tag'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'docker tag my_test_image:my_old_tag my_test_image:my_new_tag')
})

test('tag: should allow passing opts', (t) => {
  const result = docker.tag({
    image: 'my_test_image',
    oldTag: 'my_old_tag',
    newTag: 'my_new_tag'
  }, {
    description: 'my_description'
  })
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.opts.description, 'my_description')
})
