import * as fs from 'fs'
import * as path from 'path'

import { Pipeline } from '@agnoci/core'
import { Command, flags } from '@oclif/command'
import * as ts from 'typescript'

export default class Generate extends Command {
  static description = 'Generate and output a provider pipeline'

  static flags = {
    input: flags.string({
      default: 'pipeline.ts'
    }),

    write: flags.boolean({
      default: false
    })
  }

  async run () {
    const { flags } = this.parse(Generate)

    // hack: if `export default` exists in the file
    // then we'll assume that we can require it, and the
    // exported value is a pipeline instance. If it doesn't,
    // then we're going to execute the file and use stdout.
    const pipelineFile = fs.readFileSync(flags.input).toString()
    const containsExport = pipelineFile.includes('export default')

    let result: string | null = null

    if (containsExport) {
      // If we have to require this file, check
      // if the file is TS, and compile if required.
      const isTypescript = path.extname(flags.input) === '.ts'
      const directory = path.dirname(flags.input)

      let requireFile = flags.input

      if (isTypescript) {
        const program = ts.createProgram([ requireFile ], {
          target: ts.ScriptTarget.ES2017,
          outDir: directory,
          module: ts.ModuleKind.CommonJS
        })

        program.emit()

        requireFile = requireFile.replace('.ts', '.js')
      }

      try {
        let pipeline = require(path.resolve(process.cwd(), requireFile))

        // Remove our compiled file if we had to
        if (isTypescript) {
          fs.unlinkSync(requireFile)
        }

        if (pipeline.default) {
          pipeline = pipeline.default
        }

        if (pipeline instanceof Pipeline) {
          result = pipeline.generate()
        } else {
          throw new Error(`Something other than a Pipeline instance is exported from pipeline`)
        }
      } catch (e) {
        console.error(e)
        throw new Error(`Failed to require: ${flags.input}`)
      }
    } else {
      // TODO: implement execution if nothing is exported
    }

    if (flags.write) {
      // TOOD: implement write

      return
    }

    if (typeof result === 'object') {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(result)
    }
  }
}
