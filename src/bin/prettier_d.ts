#!/usr/bin/env node
const path = require("path")
const fs = require("fs")

process.env.CORE_D_TITLE = "prettier_d"
process.env.CORE_D_DOTFILE = ".prettier_d"
process.env.CORE_D_SERVICE = require.resolve("../core_d_service")

// NOTE(cj): needs to be imported after env vars are set.
const coreD = require("../../vendor/core_d/client")

export interface Options {
  source: string
  filePath: string
  configPath?: string
}

const readStdin = async (): Promise<string> => {
  return new Promise((resolve) => {
    let text = ""

    process.stdin.setEncoding("utf8")

    process.stdin.on("data", (chunk) => {
      text += chunk
    })

    process.stdin.on("end", () => {
      resolve(text)
    })
  })
}

// --stdin
// --stdin-path
// --config-path prettier config path
async function parseOptions(args: string[]): Promise<Options> {
  const result: Partial<Options> = {}

  while (args.length > 0) {
    const arg = args.shift()

    if (arg === "--stdin") {
      result.source = await readStdin()
      continue
    }

    if (arg === "--stdin-path") {
      result.filePath = args.shift()

      if (result.filePath != null) {
        result.filePath = path.resolve(result.filePath)
      }

      continue
    }

    if (arg === "--config-path") {
      result.configPath = args.shift()

      if (result.configPath != null) {
        result.configPath = path.resolve(result.configPath)
      }

      continue
    }

    // if file param exists, ignore --stdin and --stdin-path
    result.source = fs.readFileSync(arg, "utf8")
    result.filePath = path.resolve(arg)
  }

  if (result.source == null) {
    fatal("No file or stdin specified")
  }

  if (result.filePath == null) {
    fatal("Must use --stdin-path to specify stdin content path")
  }

  return result as Options
}

const usage = `usage: prettier_d [options] [file]

Options:
  --config <path>       specify prettier config path
  --stdin               read source from stdin
  --stdin-path <path>   used for prettier to find config and infer parser

Examples:
  # format a.js
  prettier_d a.js

  # format stdin content
  prettier_d --stdin --stdin-path a.js
`

const fatal = (msg) => {
  console.error(msg)
  process.exit(1)
}

// prettier_d [command]
// prettier_d [options] [file]
async function main() {
  const cmd = process.argv[2]

  if (["start", "stop", "restart", "status"].includes(cmd)) {
    coreD[cmd]()
    return
  }

  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.log(usage)
    return
  }

  const options = await parseOptions(args)
  coreD.invoke(options)
}

main()
