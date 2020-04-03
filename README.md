
<br />
<p align="center">
  <h1 align="center">AgnoCI</h3>

  <p align="center">
    A provider agnostic framework for building CI pipelines
    <br />
    <a href="https://github.com/agnoci/agnoci/blob/master/examples">View Examples</a>
    ·
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Report Bug</a>
    ·
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Request Feature</a>
  </p>

  <hr />
</p>

## Table of Contents

* [About the Project](#about-the-project)
  * [Example](#example)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Supported Abstractions](#supported-abstractions)
  * [Providers](#providers)
  * [Building blocks](#building-blocks)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)

## About The Project

Built out of the desire to dynamically generate pipelines, and move between providers when required - this project provides an abstraction layer above the provided DSL from many CI companies.

### Example

```ts
import * as agnoci from '@agnoci/core'

const builder: agnoci.PipelineBuilder = (ctx) => {
  ctx.append(agnoci.command('echo hello world'))
  ctx.append(agnoci.manual({ description: 'Please unblock me' }))
  ctx.append(agnoci.parallel([
    agnoci.command('echo I have been unblocked!'),
    agnoci.command('echo My git branch is $branch', {
      env: { branch: agnoci.env.branch() }
    })
  ]))
}

const pipeline = agnoci.Pipeline(builder, {
  target: agnoci.Target.Buildkite
})

console.log(pipeline)
```

Which, when executed, outputs a valid Buildkite pipeline:

```js
{
  steps: [
    { command: 'echo hello world' },
    { type: 'manual', label: 'Please unblock me' },
    { command: 'echo I have been unblocked!' },
    {
      command: 'echo My git branch is $branch',
      env: {
        branch: '${BUILDKITE_BRANCH}'
      }
    }
  ]
}
```

### Why not declarative?

Tabs vs Spaces. Vim vs Emacs. Declarative vs Imperative.

Imperative input allows you to dynamically generate your pipelines.

For example: abstract your business logic into an npm module, and then generate an output based entirely on if a `package.json` or a `gomod.sum` file exists in the repository.

If you're still not convinced, there's a declarative DSL you can write that AgnoCI supports, that is completely compatible with our imperative input.

## Getting Started

### Prerequisites

Currently, the only prerequisite for AgnoCI is NodeJS (and `npm`).

If you're wanting to use TypeScript to write your pipelines (**highly recommended!**) then you also require a way to execute the resulting code. Either something like `ts-node`, or can also use the AgnoCI CLI tool.

### Installation (CLI)

The AgnoCI CLI, while not necessary, is a useful tool to help you get started.

```sh
npm install -g @agnoci/cli
```

The CLI tool providers some useful functionality, such as generating templates you can continue to build on.

If you're looking to use AgnoCI in a project that is not utilising `npm`, you can avoid having to set up a `package.json` with the required depedencies by using the CLI tool to temporarily install the required dependencies on-demand.

### Installation (Libraries)

AgnoCI ships with a core library, and multiple utility libraries, that wrap functionality of other tooling, such as `npm`, `docker` and `awscli`.

For basic usage, only the `@agnoci/core` library is required.

```bash
npm install @agnoci/core --save
```

## Usage

Provided you have the CLI installed, running `agno init .` will give you a basic pipeline that you can modify at will.

It will include basic examples of things you can do, such as the provided _building block_ types, environment abstraction, and utilising artifacts.

### Ahead of time compilation

Most providers do not support dynamic generation of the pipeline.

This means that whenever you change your pipeline builder, you need to "compile" out the resulting pipeline.

As an example, for Gitlab:

```bash
ts-node deployment.ts > .gitlab-ci.yml
```

This resulting file should then be checked into source control, as it needs to be available in the repository for your CI provider to read when creating the build job.

### Just in time compilation

For the providers that **do** support dynamic generation (eg. Buildkite) then you have the option of compiling the remainder of the pipeline as part of the triggered execution.

As an example, for Buildkite:

```bash
ts-node deployment.ts | buildkite-agent pipeline upload
```

You do not need to check anything into source control (other than your pipeline builder) if using JIT compilation.

## Supported Abstractions

### Providers

- Buildkite
- Gitlab
- Bash

### Building Blocks

- Commands
- Wait steps
- Manual unblock steps
- Parallel steps
- Artifacts
- Environment variables

Additional abstractions can be requested by [opening an issue](https://github.com/agnoci/agnoci/issues), or by voting on an existing issue.

## Roadmap

See the [open issues](https://github.com/agnoci/agnoci/issues) for a list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[ISC](./LICENSE.md)
