const dotenv = require('dotenv');
dotenv.config();

const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

var dataAircraft = require("./data_airplanes.json");

bot.start((ctx) => ctx.reply('Bot started!'))
.catch((err) => {
  console.error('start failed')
  console.error(err.stack || err.toString())
})
// ------------------------ b o t  c o m m a n d s --------------------------------

bot.command('help', (ctx) => ctx.replyWithMarkdown('*--- Bot Help ---\n*' + '"*/ticket X*" with X = distance of the route to get optimum ticket prices\n' + '"*/info aircraft-ref*" to get infos about an aircraft\n' + '"*/config X Y Z Aircraft-ref*" to have infos about\n'))
.catch((err) => {
  console.error('/help failed')
  console.error(err.stack || err.toString())
})
// -- 1. tickets price
bot.command('ticket', (ctx) => {
  let routeDistance = splitCmd(ctx.update.message.text)
  ctx.replyWithMarkdown('@' + ctx.message.from.username + ', The best ticket prices for your route distance of *'+ routeDistance +'KM* are: ' + getTicketPrice(routeDistance))
})
.catch((err) => {
  console.error('/ticket failed')
  console.error(err.stack || err.toString())
})

// -- 2. infos about aircraft config
bot.command('info', (ctx) => {
  let airplaneInfo = splitCmd(ctx.update.message.text)
  ctx.replyWithMarkdown('@' + ctx.message.from.username + ', About *' + airplaneInfo.toUpperCase() + '*: \n Range: ' + dataAircraft[airplaneInfo].range + 'km\n Runway min: ' + dataAircraft[airplaneInfo].runway + 'fts\n Speed: ' + dataAircraft[airplaneInfo].speed + 'kph\n Pax: ' + dataAircraft[airplaneInfo].pax + '\n Fuel consumption: ' + dataAircraft[airplaneInfo].fuel + 'lbs/km')
})
.catch((err) => {
  console.error('/info failed')
  console.error(err.stack || err.toString())
})

// -- 3. get optimal seat config
bot.command('getconfig', (ctx) => {
  ctx.replyWithMarkdown('@' + ctx.message.from.username + ', Here the best seat config for your airplane:\n' + getSeatConfig(ctx.update.message.text))
})
.catch((err) => {
  console.error('/getconfig failed')
  console.error(err.stack || err.toString())
})

bot.launch()

// ------------------------ f u n c t i o n s -------------------------------------

// ------ function helpers ------ //
function splitCmd (cmd) {
  return cmd.split(" ").splice(-1).toString()
}

// ------ 1. tickets price function
// Get optimal ticket prices for a given route distance
// @Params param: int
function getTicketPrice (param) {
  let yClass = Math.floor(((( (0.4 * param) + 170) * 1.1)) / 10) * 10
  let bClass = Math.floor(((( (0.4 * param) + 560) * 1.1)) / 10) * 10
  let fClass = Math.floor(((( (0.4 * param) + 1200) * 1.1)) / 10) * 10
  msgTicketsPrice = '\n Economy (Y): ' + yClass + ' $\n Business (B): ' + bClass + ' $\n First (F): ' + fClass + ' $'
  return msgTicketsPrice
}

// ------ 2. seat config calculation
// Get optimal seat config for a given route, demand, and airplane
// @Params param: string
function getSeatConfig (param) {

  param = param.substr(param.indexOf(" ") + 1);

  // Splitting the input into 3 parts
  let splitInput = param.split(",");

  // Assign then into seperate variables
  let [planeType, seatConfig, distance] = [splitInput[0], splitInput[1], splitInput[2]];
  // Typecast into appropriate type
  seatConfig = seatConfig.split("/").map(Number);

  distance = parseInt(distance);

  airplaneselected = dataAircraft[planeType]

  let yDemand = seatConfig[0]
  let bDemand = seatConfig[1]
  let fDemand = seatConfig[2]

  let aircraftMaxPax = airplaneselected.pax

  let ySeat = Math.floor((yDemand/((yDemand+bDemand+fDemand))*aircraftMaxPax)*(aircraftMaxPax/(yDemand/((yDemand+bDemand+fDemand))*aircraftMaxPax+2*bDemand/((yDemand+bDemand+fDemand))*aircraftMaxPax+3*fDemand/((yDemand+bDemand+fDemand))*aircraftMaxPax)))
  let bSeat = Math.floor((bDemand/(yDemand+bDemand+fDemand)*aircraftMaxPax)*(aircraftMaxPax/(yDemand/(yDemand+bDemand+fDemand)*aircraftMaxPax+2*bDemand/(yDemand+bDemand+fDemand)*aircraftMaxPax+3*fDemand/(yDemand+bDemand+fDemand)*aircraftMaxPax)))
  let fSeat = Math.floor((fDemand/(yDemand+bDemand+fDemand)*aircraftMaxPax)*(aircraftMaxPax/(yDemand/(yDemand+bDemand+fDemand)*aircraftMaxPax+bDemand/(yDemand+bDemand+fDemand)*aircraftMaxPax*2+fDemand/(yDemand+bDemand+fDemand)*aircraftMaxPax*3)))
  let maxTraject = Math.floor(24/(distance / airplaneselected.speed))

  return (ySeat + 'Y, ' + bSeat + 'B, ' + fSeat + 'F\nTraject by 24h: ' + maxTraject)
}
