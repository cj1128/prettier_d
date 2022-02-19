const conn = require("./connect")

function wait(callback) {
  conn((err, socket, token) => {
    if (err) {
      if (err != conn.NOT_RUNNING) {
        callback(err)
        return
      }

      setTimeout(() => {
        wait(callback)
      }, 100)

      return
    }

    callback(null, socket, token)
  })
}

function launch(cb) {
  const env = Object.create(process.env)
  const { spawn } = require("child_process")
  const daemon = require.resolve("./daemon")

  const child = spawn("node", [daemon], {
    detached: true,
    env,
    stdio: ["ignore", "inherit", "inherit"],
  })

  child.unref()

  setTimeout(() => {
    wait(cb)
  }, 100)
}

// callback: (err, socket, token)
exports.launch = function (cb) {
  conn((err, socket) => {
    if (err) {
      if (err === conn.NOT_RUNNING) {
        launch(cb)
      } else {
        cb(err)
      }

      return
    }

    socket.end()
    console.log("Already running\n")
  })
}
