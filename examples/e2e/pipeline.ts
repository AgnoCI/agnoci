import { Pipeline, Target, single, command, manual, stopUnlessBranch, Node, env } from '../../packages/@agnoci/core'
import { npm } from '../../packages/@agnoci/node'
import * as docker from '../../packages/@agnoci/docker'

function getImage () {
  return {
    image: 'e2e-example',
    tag: `${env.branch()()}-${env.commit()()}`
  }
}

function test (): Node {
  return single([
    npm.install({ noOptional: true }),
    npm.test()
  ])
}

function build (): Node {
  const image = getImage()

  return single([
    docker.build(image),
    docker.push(image)
  ])
}

function deploy (env: string) {
  const image = getImage()

  return single([
    command('kubectl config set-cluster k8s --server="${SERVER}"'),
    command('kubectl config set clusters.k8s.certificate-authority-data ${CERTIFICATE_AUTHORITY_DATA}'),
    command('kubectl config set-credentials gitlab --token="${USER_TOKEN}"'),
    command('kubectl config set-context default --cluster=k8s --user=gitlab'),
    command('kubectl config use-context default'),
    command(`sed -i "s/<TAG>/${image.tag}/g" deployment.yaml`),
    command(`sed -i "s/<ENV>/${env}/g" deployment.yaml`),
    command(`echo "Deploying image - ${image.image}:${image.tag}"`),
    command('kubectl apply -f account.yaml'),
    command('kubectl apply -f deployment.yaml'),
    command('kubectl apply -f service.yaml')
  ])
}

const pipeline = new Pipeline({
  target: Target.Buildkite
})

pipeline.append(test())
pipeline.append(build())
pipeline.append(stopUnlessBranch('master'))
pipeline.append(deploy('staging'))
pipeline.append(manual())
pipeline.append(deploy('production'))

console.log(pipeline.generate())
