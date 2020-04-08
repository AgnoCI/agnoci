import * as fs from 'fs'
import * as path from 'path'

import { Command, flags } from '@oclif/command'
import * as inquirer from 'inquirer'

const providerOptions = [ 'Buildkite', 'Gitlab', 'Bash' ]

export default class Init extends Command {
  static description = 'Generate a new pipeline.ts'

  static flags = {
    file: flags.string({
      description: 'The filename to generate'
    }),

    provider: flags.enum({
      description: 'The provider you are targeting',
      options: providerOptions
    })
  }

  async run () {
    const { flags } = this.parse(Init)

    const questions: inquirer.QuestionCollection[] = []

    // Output filename
    if (!flags.file) {
      questions.push({
        type: 'input',
        name: 'file',
        message: 'Please enter a filename to generate',
        default: 'pipeline.ts'
      })
    }

    // Provider we should replace in the template.
    if (!flags.provider) {
      questions.push({
        type: 'list',
        name: 'provider',
        message: 'What provider are you initially targeting?',
        choices: providerOptions
      })
    }

    const answers = await inquirer.prompt(questions)

    const file = flags.file || answers.file
    const provider = flags.provider || answers.provider

    // At the moment we only support a single template
    // so just load it, replace our provider, and then
    // write it out to the specified path.
    let pipeline = fs.readFileSync(path.resolve(__dirname, '../../templates/basic/pipeline.ts')).toString()
    pipeline = pipeline.replace('Target.Buildkite', `Target.${provider}`)

    const outPath = path.resolve(process.cwd(), file)

    fs.writeFileSync(outPath, pipeline)

    console.log('Wrote pipeline to', outPath)
  }
}
