import { Pipeline, Target, Artifact, Node, single, parallel, manual, env } from '../../packages/@agnoci/core'
import * as docker from '../../packages/@agnoci/docker'
import { npm } from '../../packages/@agnoci/node'

// Import our package.json we can pull some info from it
import * as pkg from '../package.json'

// Define an artifact that we may wish to upload.
const coverageArtifact = new Artifact({
  source: 'coverage',
  destination: 'coverage',
  directory: true
})

/*
  Build out our tests:
    1) Install required NodeJS dependencies
    2) Run our `test:coverage` command
    3) Upload our artifact
*/
function runCoverageTests (): Node {
  return single([
    npm.install({ noOptional: true }),
    npm.run('test:coverage'),
    coverageArtifact.upload()
  ], {
    description: 'Run coverage tests'
  })
}

// Build out our lint tests separately
// from our coverage tests, as these
// can be run in parallel to the above.
function runLintTests (): Node {
  return single([
    npm.install({ noOptional: true }),
    npm.run('lint'),
  ], {
    description: 'Run lint tests'
  })
}

// Wrap our above test functions in a parallel
// node, so they get run at the same time.
function runTests (): Node {
  return parallel([
    runCoverageTests(),
    runLintTests()
  ])
}

/*
  Build our initial docker image.
*/
function buildDockerImage (): Node {
  return docker.build({
    image: '$image',
    tag: '$branch'
  }, {
    env: {
      // By using AgnoCIs environment functions, we can
      // ensure that our pipeline will be compatible with
      // all providers, as they usually provide these built-in
      // variables with different names.
      branch: env.branch(),
      // We can also set these variables to static strings
      // if we know what we want them to be, ahead of time.
      image: pkg.name
    }
  })
}

function pushDockerImage (tag?: string): Node {
  return docker.push({
    image: pkg.name,
    tag: tag || '$branch'
  }, {
    env: { branch: env.branch() }
  })
}

function tagDockerImage (tag: string): Node {
  return docker.tag({
    image: pkg.name,
    oldTag: '$branch',
    newTag: tag
  }, {
    env: { branch: env.branch() }
  })
}

// Wrap these in a single command, to ensure they're
// run in the same "step" on our target provider.
function buildAndPushDockerImage (): Node {
  return single([
    buildDockerImage(),
    pushDockerImage()
  ])
}

// As above, we need to make sure we tag and push in
// the same step, so wrap these in a single node.
function tagAndPushDockerImage (tag: string): Node {
  return single([
    tagDockerImage(tag),
    docker.push({ image: pkg.name, tag })
  ])
}

/*
  Create a new pipeline, and then start appending
  our steps to it. Each top-level step you append
  here will block until the previous node has finished.
*/
const pipeline = new Pipeline({
  target: Target.Gitlab
})

pipeline.append(runTests())
pipeline.append(buildAndPushDockerImage())
pipeline.append(manual({ description: 'Tag as unstable' }))

// As we're just calling functions, we can abstract this logic
// and just pass the new tag as a parameter.
pipeline.append(tagAndPushDockerImage('unstable'))
pipeline.append(manual({ description: 'Tag as stable' }))
pipeline.append(tagAndPushDockerImage('stable'))

console.log(pipeline.generate())
