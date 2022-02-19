const net = require("net")
const portfile = require("./portfile")

const NOT_RUNNING = "Not running"
const COULD_NOT_CONNECT = "Could not connect"

module.exports = function (callback) {
  portfile.read((config) => {
    if (!config) {
      callback(NOT_RUNNING)
      return
    }

    const socket = net.connect(config.port, "127.0.0.1", () => {
      callback(null, socket, config.token)
    })

    socket.once("error", (err) => {
      if (err.code === "ECONNREFUSED") {
        portfile.unlink()
      }

      callback(COULD_NOT_CONNECT)
    })
  })
}

module.exports.NOT_RUNNING = NOT_RUNNING
module.exports.COULD_NOT_CONNECT = COULD_NOT_CONNECT
