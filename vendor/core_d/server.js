const net = require("net")
const crypto = require("crypto")
const portfile = require("./portfile")
const service = require(process.env.CORE_D_SERVICE)

// err: string
// result: string
function end(con, data) {
  con.end(JSON.stringify(data))
}

function _err(con, err) {
  end(con, { err })
}

function remove(connections, con) {
  const p = connections.indexOf(con)
  if (p !== -1) {
    connections.splice(p, 1)
  }
}

exports.start = function () {
  const token = crypto.randomBytes(8).toString("hex")
  const open_connections = []

  const server = net.createServer(
    {
      allowHalfOpen: true,
    },
    (con) => {
      let data = ""

      con.on("data", (chunk) => {
        data += chunk
      })

      con.on("end", () => {
        remove(open_connections, con)

        let payload

        try {
          payload = JSON.parse(data)
        } catch (err) {
          _err(con, "invalid payload")
          return
        }

        if (payload.token !== token) {
          _err(con, "invalid token")
          return
        }

        if (payload.cmd === "stop") {
          end(con, { resutl: "Server is closing..." })
          server.close()
          return
        }

        try {
          service.invoke(payload.arg, (err, result) => {
            if (err) {
              _err(con, err)
            } else {
              end(con, { result })
            }
          })
        } catch (e) {
          _err(con, e.message)
        }
      })
    }
  )

  server.on("connection", (con) => {
    open_connections.push(con)
  })

  server.listen(0, "127.0.0.1", () => {
    const port = server.address().port
    portfile.write(port, token, process.pid)
  })

  return server
}
