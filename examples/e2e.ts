import { Pipeline, Target, single, command, manual, stopUnlessBranch } from '../packages/@agnoci/core'

function deploy (env: string) {
  return single([
    command('kubectl config set-cluster k8s --server="${SERVER}"'),
    command('kubectl config set clusters.k8s.certificate-authority-data ${CERTIFICATE_AUTHORITY_DATA}'),
    command('kubectl config set-credentials gitlab --token="${USER_TOKEN}"'),
    command('kubectl config set-context default --cluster=k8s --user=gitlab'),
    command('kubectl config use-context default'),
    command('sed -i "s/<TAG>/${TAG}/g" deployment.yaml'),
    command(`sed -i "s/<ENV>/${env}/g" deployment.yaml`),
    command('echo "Deploying image - ${CONTAINER_IMAGE}"'),
    command('kubectl apply -f account.yaml'),
    command('kubectl apply -f deployment.yaml'),
    command('kubectl apply -f service.yaml')
  ])
}

const pipeline = new Pipeline({
  target: Target.Bash
})

pipeline.append(command('echo No tests yet'))
pipeline.append(stopUnlessBranch('master'))
pipeline.append(deploy('staging'))
pipeline.append(manual())
pipeline.append(deploy('production'))

console.log(pipeline.generate())
