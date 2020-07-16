
const dotenv = require('dotenv');
dotenv.config();

const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

var dataAircraft = require("./data_airplanes.json");

bot.start((ctx) => ctx.reply('Bot started!'))

// ------------------------ b o t  c o m m a n d s --------------------------------

bot.command('help', (ctx) => ctx.replyWithMarkdown('*--- Bot Help ---\n*' + '"*/ticket X*" with X = distance of the route to get optimum ticket prices\n' + '"*/info aircraft-ref*" to get infos about an aircraft\n' + '"*/config X Y Z Aircraft-ref*" to have infos about\n'))

// -- 1. tickets price
bot.command('ticket', (ctx) => {
  let routeDistance = splitCmd(ctx.update.message.text)
  ctx.replyWithMarkdown('@' + ctx.message.from.username + ', The best ticket prices for your route distance of *'+ routeDistance +'KM* are: ' + getTicketPrice(routeDistance))
})

// -- 2. infos about aircraft config
bot.command('info', (ctx) => {
  let airplaneInfo = splitCmd(ctx.update.message.text)
  ctx.replyWithMarkdown('@' + ctx.message.from.username + ', About *' + airplaneInfo.toUpperCase() + '*: \n Range: ' + dataAircraft[airplaneInfo].range + 'km\n Runway min: ' + dataAircraft[airplaneInfo].runway + 'fts\n Speed: ' + dataAircraft[airplaneInfo].speed + 'kph\n Pax: ' + dataAircraft[airplaneInfo].pax + '\n Fuel consumption: ' + dataAircraft[airplaneInfo].fuel + 'lbs/km')
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





