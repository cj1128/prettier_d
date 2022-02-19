import prettier from "prettier"
import type { Options } from "./bin/prettier_d"

export const invoke = (
  options: Options,
  cb: (err: unknown, output?: string) => void
) => {
  const config = prettier.resolveConfig.sync(options.filePath, {
    config: options.configPath,
    useCache: false,
  })

  try {
    const result = prettier.format(options.source, {
      filepath: options.filePath,
      ...config,
    })
    cb(null, result)
  } catch (err) {
    cb(err.message)
  }
}
