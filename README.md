# API Rest
Port 3000
Documentation can be found at localhost:3000/documentation

# Socket.io

## Server listener
Port 4242
Requests that can be send from the client to the server. All functions parameters are json Object.
#### joinRoom({id: `string`})
**Returns** {success, room: `class Room`, message *(if success == false)*}

#### exitRoom()
**Returns** {success}

#### createRoom({name: `string`})
**Returns** {success, room: `class Room`}

#### playSign({sign: `string`})
- `sign` "rock" || "paper" || "scissors"

**Returns** {success}

## Server emit
Requests that will be send from the server to the client. All functions parameters represent json Object sent by the server.
#### ready()
Sent by the server when client connection is fully ready

#### playerJoined(`class Player`)
Sent by the server when player join the room

#### gameStart()
Sent by the server when there is 2 players in the room and that the game start

#### gameEnd({winner: `class Player`})
Sent by the server when all rounds are finished
**winner can be null **if result is a draw

#### roundStart({duration: `seconds` })
Sent by the server when a new round is started

#### roundEnd({roundResult: Array[player: `class Player`, sign: `string`], winner: `class Player` })
Sent by the server when round is finished (All players have played or round have timeout)
RoundResult contains what players have played for this round, and winner is ... the winner.
**winner can be null **if result is a draw

## Class

#### Player
- username: `string`
- userId: `integer`
-
#### Room
- playerList: Array[`class Player`]
- id: `String` (uuid)
- name: `String`
- config: `config`
- roomOwner: `class Player`
- state: `String`
