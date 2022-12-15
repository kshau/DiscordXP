const WebSocket = require("ws");
const {fetch} = require("undici");

require("dotenv").config();

const {TOKEN, CHANNEL_ID, CLIENT_ID} = process.env;

function wsConnect() {

  var ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
  var interval;

  ws.on("open", () => {

    ws.send(JSON.stringify({
      "op": 2,
      "d": {
        "token": TOKEN,
        "properties": {
          "os": "linux",
          "browser": "chrome"
        }
      }
    }))

  })


  ws.on("message", (data) => {

      var json = JSON.parse(data);

      var {op, t, d} = json;

      if (t == "MESSAGE_CREATE" && d.author.id == CLIENT_ID && d.content == "...hi" && d.channel_id == CHANNEL_ID) {
        
        fetch(`https://discord.com/api/v9/channels/${CHANNEL_ID}/messages/${d.id}`, {
          "headers": {
            "authorization": TOKEN
          },
          "body": null,
          "method": "DELETE"
        }).then();

      }

      if (op == 10) {
        interval = d.heartbeat_interval;
        setInterval(ms => {
          ws.send(JSON.stringify({
            op: 1,
            d: null
          }))
        }, interval)
      }
      
  })

  ws.on("close", wsConnect);

}

wsConnect();

setInterval(() => {

  fetch(`https://discord.com/api/v9/channels/${CHANNEL_ID}/messages`, {
    "headers": {
      "authorization": TOKEN,
      "content-type": "application/json"
    },
    "body": "{\"content\":\"...hi\"}",
    "method": "POST"
  }).then();

}, 4000)