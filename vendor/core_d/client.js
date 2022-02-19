const connect = require("./connect")
const launcher = require("./launcher")

function fatal(msg) {
  console.error(msg)
  process.exit(1)
}

function sendCommand(command) {
  connect((err, socket, token) => {
    if (err) {
      fatal(err)
    }

    const msg = {
      token,
      command,
    }

    socket.end(`${msg}`)

    socket.on("data", (chunk) => std.write(chunk))
  })
}

// cb: (err, response)
function sendMsg(socket, msg, cb) {
  let buf = ""

  socket.on("data", (chunk) => {
    buf += chunk
  })

  socket.on("end", () => {
    let ret

    try {
      ret = JSON.parse(buf)
    } catch (err) {
      cb(`invalid return from server: ${buf}`)
    }

    cb(null, ret)
  })

  socket.end(JSON.stringify(msg))
}

function invoke(socket, token, arg) {
  sendMsg(socket, { token, arg }, (err, res) => {
    if (err != null) {
      fatal(err)
    }

    if (res.err) {
      fatal(res.err)
    }

    if (res.result) {
      process.stdout.write(res.result)
    }
  })
}

exports.invoke = function (arg) {
  connect((err, socket, token) => {
    if (err) {
      if (err === connect.NOT_RUNNING) {
        launcher.launch((err, socket, token) => {
          if (err) {
            fatal(err)
          }

          invoke(socket, token, arg)
        })
      } else {
        fatal(err)
      }
    } else {
      invoke(socket, token, arg)
    }
  })
}

exports.start = function () {
  launcher.launch((err, socket) => {
    if (err != null) {
      fatal(err)
    }

    socket.end()
  })
}

exports.stop = function (cb) {
  connect((err, socket, token) => {
    if (err) {
      if (err === connect.NOT_RUNNING) {
        cb && cb()
      } else {
        fatal(err)
      }
    } else {
      sendMsg(socket, { token, cmd: "stop" }, (err) => {
        if (err) {
          fatal(err)
        } else {
          cb && cb()
        }
      })
    }
  })
}

exports.restart = function () {
  exports.stop(() => {
    process.nextTick(exports.start)
  })
}

exports.status = function () {
  connect((err, socket) => {
    if (err) {
      console.error(err)
      return
    }

    socket.end()
    console.log("Running")
  })
}
