// Variables for API Objects
// var stockList
// var compInfo
// var symbolInfo
// var tempName

// Variables for Stocks and Year High/Lows
var closeingPrice
var yearHigh
var yearLow
var isoDatefix

// Variables for Company Card
var sector
var exchange
var qEarningsGrowthYOY
var qRevenueGrowthYOY
var qRevenue
var compName


// NEWS API
var news
var abstract
var url
var title
var image
var caption
var hotTitle


// Infor for Local Storage and Watch List
var lswl
var lsCompCheck
var newCompany
var stockSymb

// stock search varibles
let companySearch

let stockSymbolSearch = []
let stockSymbolSearchResults = []




let corpQuote = []
let compDetails = []
let basicFinancials = []
let candleInfo = []


// check local storage for entry
function LS() {
  lswl = localStorage.lswl ? JSON.parse(localStorage.lswl) : []
  console.log(lswl)

  // if local storage has an entry populate watchlist
  watchlist()
}

function stockSearch(){

  companySearch = document.querySelector('#stockSearch').value.toUpperCase()
  // console.log(companySearch)

  if((companySearch.length > 2) && (stockSymbolSearch.find(e => (e===`${companySearch}`)))){
    // console.log(`we fount it `)
    // console.log(companySearch.length)
    // console.log(Boolean(stockSymbolSearch.find(e => (e!==`${companySearch}`))))
    alphaStockSearch(companySearch)

  }else if (stockSymbolSearchResults.find(e=>e.displaySymbol===companySearch)) {
    // console.log(companySearch)
    alphaStockSearch(companySearch)

  }  else {console.log(`keep searching`)
  
    getAlpha(companySearch)}

}


async function getAlpha(autoQuery){
  console.log(autoQuery)

  let stockSymbols = await fetch ('https://finnhub.io/api/v1/stock/symbol?exchange=US&token=c2m4iqqad3idnodd7tdg').then(r=>r.json())
  stockSymbolSearchResults = stockSymbols.filter(e => e.description.includes(`${autoQuery}`) || e.displaySymbol.includes(`${autoQuery}`))
  console.log(stockSymbolSearchResults)

  console.log(stockSymbols)

  document.querySelector('#datalistOptions').innerHTML = ""
  stockSymbolSearch = []

  stockSymbolSearchResults.slice(0,11).forEach(stock =>  {
    document.querySelector('#datalistOptions').innerHTML +=
    ` <option value=${stock["displaySymbol"]} > ${stock["description"]}</option>`
    stockSymbolSearch.push({symbol: `${stock["displaySymbol"]}`, name: `${stock["description"]}`})
  })

  console.log(`symbol array values`, stockSymbolSearch)  

}


async function alphaStockSearch(symbolSelected){

  console.log(`this is the passed symbol`, symbolSelected)

    let todaysDate = Math.floor(Date.now()/1000)
    let aYearAgo = Math.floor((new Date().setDate(new Date().getDate()-365))/1000)
    console.log(`todays date is ${todaysDate} as a number and in human text ${new Date(todaysDate*1000)}`)
    console.log(`365 days ago was ${aYearAgo} as a number and in human txt ${new Date(aYearAgo*1000)}`)


    compDetails  = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbolSelected}&token=c2m4iqqad3idnodd7tdg`).then(r => r.json())
    corpQuote = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbolSelected}&token=c2m4iqqad3idnodd7tdg`).then(r => r.json())
    basicFinancials = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbolSelected}&metric=all&token=c2m4iqqad3idnodd7tdg`).then(r => r.json())
    candleInfo = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbolSelected}&resolution=M&from=${aYearAgo}&to=${todaysDate}&token=c2m4iqqad3idnodd7tdg`).then(r=>r.json())
      
    let timeStampHumanDate = new Date(corpQuote.t*1000)
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months = ["January","February","March","April","May","June","July", "August","September","October","November","December"];
 

    let timeStampMonth = months[timeStampHumanDate.getMonth()]
    let timeStampDay = days[timeStampHumanDate.getDay()]
    let timeStampDate = timeStampHumanDate.getDate()
    let timeStampYear = timeStampHumanDate.getFullYear()


    console.log(`this is alpha corpQuote`, corpQuote)
    console.log(`this is alpha CompDetails`, compDetails)
    console.log(`this is alpha basicFinancials`, basicFinancials)
    console.log(`this is alpha candleInfo`, candleInfo)


    document.querySelector('#sharePrice').innerHTML = `Share Price (USD):  <span>$ ${corpQuote.c}</span>`
    document.querySelector('#dateNow').innerHTML = `<small>As of:  ${timeStampDay} ${timeStampMonth} ${timeStampDate}, ${timeStampYear}</small>`


    document.querySelector('#yearHigh').innerHTML = `52 Week High:  <span>$ ${(basicFinancials.metric["52WeekHigh"]).toFixed(2)} </span>`
    document.querySelector('#yearLow').innerHTML = `52 Week Low:   <span>$ ${(basicFinancials.metric["52WeekLow"]).toFixed(2)} </span>`
    document.querySelector('#allEarnings').innerHTML = `Quarter Earnings Growth:  <span id="cardQRevenue" >${(basicFinancials.metric["revenueGrowthQuarterlyYoy"]).toFixed(2)}%</span>`
    document.querySelector('#allRevenue').innerHTML = `Quarter Rev Growth:  <span id="cardQEarnings" >${(basicFinancials.metric["epsGrowthQuarterlyYoy"]).toFixed(2)}%</span>`


    document.querySelector('#companyName').innerHTML = `<img style="width:50px" src=${compDetails.logo} />  ${compDetails["name"]}`

    document.querySelector('#cardheadQuarters').innerHTML = `Headquarters: ${compDetails["country"]}`
    document.querySelector('#cardType').innerHTML = `Sector:  ${compDetails["finnhubIndustry"]}`

    if (basicFinancials.metric["revenueGrowthQuarterlyYoy"] < 0) { document.querySelector("#cardQRevenue").style.color = "red" }
    if (basicFinancials.metric["epsGrowthQuarterlyYoy"] < 0) { document.querySelector("#cardQEarnings").style.color = "red" }


    companySearch = symbolSelected


    // candleInfo Timestamps to Months Conversion
    let candleInfoMonths = []
    candleInfo.t.forEach(time => {
      
      candleInfoDates = months[(new Date(time*1000)).getMonth()]
      console.log(`this is the canle info time stamp to get month function`, candleInfoDates)
      candleInfoMonths.push(candleInfoDates)
      console.log(candleInfoMonths)

    })




    checkLS(symbolSelected)
    renderChart(candleInfo.c, candleInfoMonths)



}
//------------------------------------------------------------------------------------------------------------------------------------------
//START NEWS API
// get news API
async function getNews() {
  news = await fetch('https://api.nytimes.com/svc/topstories/v2/business.json?api-key=IlIdSVUvpiF5PABbTeerA3kRncTqyqAo').then(r => r.json())
  console.log(news)
  for (i = 0; i < 3; i++) {

    title = news.results[i].title
    console.log(title)
    url = news.results[i].url
    hotTitle = title.link(`${url}`)
    console.log(url)
    image = news.results[i].multimedia[0].url
    caption = news.results[i].multimedia[0].caption
    changeNewsInfo()
    changeNewsImage()
    changeNewsCaption()

  }
}

// Displays news info in a card on screen
function changeNewsInfo() {
  // Displays title of News
  document.querySelector(`#newsstory0`).innerHTML = news.results[0].title.link(news.results[0].url)
  document.querySelector(`#newsstory1`).innerHTML = news.results[1].title.link(news.results[1].url)
  document.querySelector(`#newsstory2`).innerHTML = news.results[2].title.link(news.results[2].url)
}
function changeNewsImage(){
  //Displays image that accompanies article
  document.querySelector(`#nwsImg0`).src = news.results[0].multimedia[0].url
  document.querySelector(`#nwsImg1`).src = news.results[1].multimedia[0].url
  document.querySelector(`#nwsImg2`).src = news.results[2].multimedia[0].url
}

  function changeNewsCaption(){
  //Displays caption that accompanies article
  document.querySelector(`#caption0`).innerHTML = news.results[0].multimedia[0].caption
  document.querySelector(`#caption1`).innerHTML = news.results[1].multimedia[0].caption
  document.querySelector(`#caption2`).innerHTML = news.results[2].multimedia[0].caption
}
//END NEWS API
//----------------------------------------------------------------------------------------------------






console.log(lswl)

// Scan local storage
function checkLS(ssymbol) {
  
  lswl.find(e => (e.ticker===`${ssymbol}`)) ? 
  (console.log("already on list"), document.querySelector('.wlbtn').classList.replace("btn-success", "btn-danger"),
  document.querySelector('.wlbtn').innerHTML = "- from Watchlist") :  (console.log("not yet on list"),document.querySelector('.wlbtn').classList.replace("btn-danger", "btn-success"),
  document.querySelector('.wlbtn').innerHTML = "+ to Watchlist")
}

// Watchlist button trigger (add or remove from list)
function watchListBtn(event) {
  
  console.log("Watch List button pressed")
  var wlbtnresults = document.querySelector('.wlbtn').innerText
  if (wlbtnresults === "+ to Watchlist") {
    addLocalStorage()

  } else {
    console.log("no go")
    removeLocalStorage()

  }
}


// save items to local storage
function addLocalStorage() {
  console.log("add Local Storage function started")
  newCompany = {
    name: `${compDetails["name"]}`,
    ticker: `${companySearch}`,
  }

  lswl.push(newCompany)
  localStorage.lswl=JSON.stringify(lswl)

  checkLS( `${companySearch}`)
  watchlist()
}

// remove from local storage
function removeLocalStorage() {
  lswl = lswl.filter(e => (e.ticker !== `${companySearch}`))
  localStorage.lswl = JSON.stringify(lswl)
  watchlist(`${companySearch}`)
  checkLS(`${companySearch}`)
}

// Add to  Watchlist
function watchlist(removedstock) {
  document.querySelector('.list-group').innerHTML = ""
  var lswlLength = lswl.length
  console.log(lswl)
  console.log(lswlLength)

  for (i = 0; i < lswlLength; i++) {
    var tick = lswl[i].ticker
    var nam = lswl[i].name

    document.querySelector('.list-group').innerHTML += `<li class="wlBtn"> <button type="button" class="btn btn-outline-light" onClick="wlBtnSearch('${tick}')"><span id="stkName">${nam}</span> - <span id = "stkSymb">${tick}</span></button>    </li>`  
  }
}

//when the watchlist button is pushed, pass the company name via the search function trigger
function wlBtnSearch(tick) {
  console.log(tick)
  alphaStockSearch(tick)
  checkLS(tick)
}
LS()
getNews()
checkLS()

// chart rendering function
function renderChart(data, months){
  labels = months;
  data = {
    labels: labels,
    datasets: [{
      label: 'Monthly Closing Prices',
      backgroundColor: 'rgb(84,10,154)',
      borderColor: 'rgb(84,10,154)',
      data: data,
    }]
  };
    
  config = {
    type: 'line',
    data,
    options: {}
  };
  
  (myChart.id >= 0)? (myChart.destroy(),
    myChart = new Chart(
    document.getElementById('myChart'),
    config)) : (myChart = new Chart(
    document.getElementById('myChart'),
    config))

}
