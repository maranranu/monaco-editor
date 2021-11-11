const express = require('express');
const ws = require('ws');
const url = require('url');
const { launch } =  require('./json-server-launcher');
require('dotenv').config();

const app = express()

const wss = new ws.Server({
  noServer: true,
  perMessageDeflate: false
})

let cors = require('cors')
app.use(cors({
  origin: '*'
}))

let server = app.listen(process.env.PORT, function () {
  console.log(`App listening on port ${process.env.PORT}`)
})

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url ? url.parse(request.url).pathname : undefined
  if (pathname === process.env.SOCKETPATH) {
    wss.handleUpgrade(request, socket, head, webSocket => {
      const socket = {
        send: content => webSocket.send(content, error => {
          if (error) {
            throw error
          }
        }),
        onMessage: cb => webSocket.on('message', cb),
        onError: cb => webSocket.on('error', cb),
        onClose: cb => webSocket.on('close', cb),
        dispose: () => webSocket.close()
      }
      // launch the server when the web socket is opened
      if (webSocket.readyState === webSocket.OPEN) {
        launch(socket)
      } else {
        webSocket.on('open', () => launch(socket))
      }
    })
  }
})
