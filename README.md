# prettier_d

Run `prettier` in a separate daemon process to speed it up.

`prettier_d` has no dependencies because it bundles `prettier` with it. The bundled version is `2.5.1`.

This project is modfied from [prettier_d_slim](https://github.com/mikew/prettier_d_slim).

## Install && Usage

```bash
$ npm install -g @cjting/prettier_d
# specify a file
$ prettier_d test.js
# or use stdin
$ prettier_d --stdin --stdin-path test.js < test.js
```

`prettier_d` will try to resolve the prettier config path from the input path (or use `--stdin-path` if input comes from stdin).

You can use `--config-path` to clearly specify it.

Use these commands the control the daemon process:

- `pretter_d status`: check daemon status
- `pretter_d start`: start the daemon
- `pretter_d stop`: stop the daemon
- `pretter_d restart`: restart the daemon

The daemon statsu file is in `~/.pretter_d`.

## Change Log

### 0.1.0

First release version.
