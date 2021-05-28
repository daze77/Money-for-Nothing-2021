const require = ('require')


// Variables for search functions
var query
var userSearched

// Variables for API Objects
var stockList
var compInfo
var symbolInfo
var tempName

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
var LSWL


//NEWS API
var news
var abstract
var url
var title
var image
var caption
var hotTitle


//Infor for Local Storage and Watch List
var lswl
var lsCompCheck
var newCompany
var stockSymb







function LS() {
  lswl = localStorage.lswl ? JSON.parse(localStorage.lswl) : []
  console.log(lswl)

  watchlist()
}

// Saves the last thing searched in a variable
function searchButton(event) {
  event.preventDefault()
  document.querySelector('#btnGroup').innerHTML = ''
  userSearched = `${document.querySelector('#input').value}`
  // Query is stored in upper-case. Lower-case was affecting some results
  // query = tempQuery.toUpperCase()
  console.log(`You searched for "${userSearched}"`)
  nameToSymbol(userSearched)
}

// ------------------------------------------------USER SEARCH & SEARCH OPTIONS----------------------------------------------------------------------------
async function nameToSymbol(userSearched) {
  symbolInfo = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${userSearched}&apikey=RTGQ9JMEEPU9J881`).then(r => r.json())
  console.log(symbolInfo.bestMatches[0]["1. symbol"])

  for (i = 0; i < 3; i++) {

    query = symbolInfo.bestMatches[i]["1. symbol"]
    tempName = symbolInfo.bestMatches[i]["2. name"]
    createSearchOptions(query)
    console.log('Hi')
  }
}

function createSearchOptions(query) {
  document.querySelector('#btnGroup').innerHTML +=
    // Creates button for current query
    `
    <button  onclick="runFromOption('${query}')" type="button" class="btn btn-secondary mx-1"><strong>Symbol:</strong> ${query} <strong>Company Name:</strong> ${tempName}</button>
    `
}
// Presents information depending on which search optin use selects
function runFromOption(query) {
  companySearch(query)
  stockSearch(query)
  document.querySelector('#btnGroup').innerHTML = ''
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------




//-----------------------------------------------FINDING & DISPLAYING COMPANY INFO--------------------------------------------------------------------------
// Uses the query to find the searched companies' information
async function companySearch(query) {
  // API query is saved to a variable
  compInfo = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${query}&outputsize=size&apikey=RTGQ9JMEEPU9J881`).then(r => r.json())

  console.log(compInfo)
  // Saves needed information in their own variables
  sector = compInfo.Sector
  exchange = compInfo.Exchange
  qEarningsGrowthYOY = compInfo.QuarterlyEarningsGrowthYOY
  qRevenueGrowthYOY = compInfo.QuarterlyRevenueGrowthYOY
  compName = compInfo.Name
  yearHigh = parseFloat(compInfo["52WeekHigh"]).toFixed(2)
  yearLow = parseFloat(compInfo["52WeekLow"]).toFixed(2)

  //bill added this
  stockSymb = compInfo.Symbol

  // LOGS INFO TO THE CONSOLE
  console.log(`${query}'s info\nTheir sector is: [${sector}]\nTheir exchange is: [${exchange}]\nTheir Quarter Earnings is: [${qEarningsGrowthYOY}]\nTheir Quarterly Revenue Growth is: [${qRevenueGrowthYOY}]`)
  console.log('query')

  console.log(stockSymb)

  stockSymb = compInfo.Symbol

  // Check Local Storage for company
  checkLS(compName, query, stockSymb)
}

// Uses query to find they previous day's closing price
async function stockSearch(query) {
  // API query is saved to a variable
  stockList = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${query}&apikey=RTGQ9JMEEPU9J881`).then(r => r.json())

  console.log(stockList)
  // Closing price is parsed to a float and saved to a variable
  closeingPrice = parseFloat(stockList["Global Quote"]["08. previous close"])
  isoDatefix = stockList["Global Quote"]["07. latest trading day"]

  console.log(closeingPrice)

  changeCompInfo()
}

// Displays company info in a card on screen
function changeCompInfo() {
  // Dispalys Sector if it has a valid value
  sector === undefined ? document.querySelector('#cardSector').innerHTML = '' : document.querySelector('#cardSector').innerHTML = `Sector: <strong>${sector}</strong>`
  // Dispalys Exchange if it has a valid value
  exchange === undefined ? document.querySelector('#cardExchange').innerHTML = '' : document.querySelector('#cardExchange').innerHTML = `Exchange: <strong>${exchange}</strong>`
  // Dispalys Quarterly Earnings if it has a valid value
  qEarningsGrowthYOY === undefined ? document.querySelector('#allEarnings').innerHTML = '' : document.querySelector('#cardQEarnings').innerHTML = `<strong>${qEarningsGrowthYOY}</strong>`
  // Dispalys Year Over Year heading if Quarterly Earnings has a valid value
  qEarningsGrowthYOY === undefined ? document.querySelector('#YOY').innerHTML = '' : document.querySelector('#YOY').innerHTML = `Year over Year`
  // Dispalys Quarterly Revenue if it has a valid value
  qRevenueGrowthYOY === undefined ? document.querySelector('#allRevenue').innerHTML = '' : document.querySelector('#cardQRevenue').innerHTML = `<strong>${qRevenueGrowthYOY}</strong>`
  // Dispalys the latest Closing Price if it has a valid value
  isoDatefix === undefined ? document.querySelector('#dateNow').innerHTML = '' : document.querySelector('#dateNow').innerHTML = `As of: <strong>${isoDatefix}</strong>`
  // Dispalys the latest Closing Price
  closeingPrice === undefined ? document.querySelector('#sharePrice').innerHTML = '' : document.querySelector('#sharePrice').innerHTML = `Share Price (USD): <strong>$${closeingPrice}</strong>`
  // Dispalys the Company Name if it has a valid value
  compName === undefined ? document.querySelector('#companyName').innerHTML = '' : document.querySelector('#companyName').innerHTML = `${compName}`
  // Dispalys the 52 Week High if it has a valid value
  document.querySelector('#yearHigh').innerHTML = `52 Week High (USD): <strong>$${yearHigh}</strong>`
  if (document.querySelector('#yearHigh').innerText === "52 Week High (USD): $undefined") { document.querySelector('#yearHigh').innerHTML = '' }
  // Dispalys the 52 Week Low if it has a valid value
  document.querySelector('#yearLow').innerHTML = `52 Week Low (USD): <strong>$${yearLow}</strong>`
  if (document.querySelector('#yearLow').innerText === "52 Week Low (USD): $undefined") { document.querySelector('#yearLow').innerHTML = '' }

  // if (`${qEarningsGrowthYOY}` < 0) { document.querySelector("#cardQEarnings").style.color = "red" }
  // if (`${qRevenueGrowthYOY}` < 0) { document.querySelector("#cardQRevenue").style.color = "red" }
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
    ticker: `${searchStockValue}`,
  }

  lswl.push(newCompany)
  localStorage.lswl=JSON.stringify(lswl)

  checkLS( `${searchStockValue}`)
  watchlist()
}

// remove from local storage
function removeLocalStorage() {
  lswl = lswl.filter(e => (e.ticker !== `${searchStockValue}`))
  localStorage.lswl = JSON.stringify(lswl)
  watchlist(`${searchStockValue}`)
  checkLS(`${searchStockValue}`)
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
  // checkLS(tick)
}

//when the watchlist button is pushed, pass the company name via the search function trigger
function wlBtnSearch(tick) {
 
  console.log(tick)
  alphaStockSearch(tick)
  checkLS(tick)
}


LS()
getNews()



// Testing a new API 

let searchStockValue
function testSearch(event){

  searchStockValue = document.querySelector('#testinput').value.toUpperCase()
  console.log(searchStockValue)



  if((searchStockValue.length > 2) && (stockCompanySearchSymbols.find(e => (e===`${searchStockValue}`)))){
    console.log(`we fount it `)
    console.log(searchStockValue.length)
    console.log(Boolean(stockCompanySearchSymbols.find(e => (e!==`${searchStockValue}`))))
    alphaStockSearch(searchStockValue)

    
  }else if (stockCompanySearchResults.find(e=>e.displaySymbol===searchStockValue)) {
    console.log(searchStockValue)
    alphaStockSearch(searchStockValue)


  }  else {console.log(`keep searching`)
  getAlpha(searchStockValue)}
}


let stockCompanySearch = []
let stockCompanySearchSymbols = []
let stockCompanySearchResults = []

async function getAlpha(autoQuery){
  console.log(autoQuery)

  stockCompanySearch = await fetch ('https://finnhub.io/api/v1/stock/symbol?exchange=US&token=c2m4iqqad3idnodd7tdg').then(r=>r.json())
  stockCompanySearchResults = stockCompanySearch.filter(e => e.description.includes(`${autoQuery}`) || e.displaySymbol.includes(`${autoQuery}`))
  console.log(stockCompanySearchResults)

 

  // stockCompanySearch = bestMatches1
  console.log(stockCompanySearch)
  // let stockCompanySearchResults=stockCompanySearch

  document.querySelector('#datalistOptions').innerHTML = ""
  stockCompanySearchSymbols = []

  stockCompanySearchResults.slice(0,11).forEach(stock =>  {
    document.querySelector('#datalistOptions').innerHTML +=
    ` <option value=${stock["displaySymbol"]} > ${stock["description"]}</option>`
    stockCompanySearchSymbols.push({symbol: `${stock["displaySymbol"]}`, name: `${stock["description"]}`})
  })

  console.log(`symbol array values`, stockCompanySearchSymbols)  

}

let corpQuote = []
let compDetails = []
let basicFinancials = []
async function alphaStockSearch(symbolSelected){
  // searchStockValue = document.querySelector('#testinput').value = ""
  console.log(`this is the passed symbol`, symbolSelected)

  // will be the test code here
    // corpQuote = globalQuote.filter(e=>e["01. symbol"]=== symbolSelected)
    // console.log(corpQuote)
    
    // compDetails = companyDetails.filter(e=>e["Symbol"]=== symbolSelected)
    // console.log(compDetails)
    let todaysDate = Date.now();
    let aYearAgo = new Date().setDate(new Date().getDate()-364)
    console.log(`todays date is ${todaysDate} as a number and in human text ${new Date(todaysDate)}`)
    console.log(`365 days ago was ${aYearAgo} as a number and in human txt ${new Date(aYearAgo)}`)


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

  


 
  
  // url
  









    if (basicFinancials.metric["revenueGrowthQuarterlyYoy"] < 0) { document.querySelector("#cardQRevenue").style.color = "red" }
    if (basicFinancials.metric["epsGrowthQuarterlyYoy"] < 0) { document.querySelector("#cardQEarnings").style.color = "red" }



  searchStockValue = symbolSelected
    checkLS(symbolSelected)










}
checkLS()


// chart testing

// var Chart = require('chart.js');
// var myChart = new Chart(ctx, {
//   type: 'bar',
//   data: {
//       labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
//       datasets: [{
//           label: '# of Votes',
//           data: [12, 19, 3, 5, 2, 3],
//           backgroundColor: [
//               'rgba(255, 99, 132, 0.2)',
//               'rgba(54, 162, 235, 0.2)',
//               'rgba(255, 206, 86, 0.2)',
//               'rgba(75, 192, 192, 0.2)',
//               'rgba(153, 102, 255, 0.2)',
//               'rgba(255, 159, 64, 0.2)'
//           ],
//           borderColor: [
//               'rgba(255, 99, 132, 1)',
//               'rgba(54, 162, 235, 1)',
//               'rgba(255, 206, 86, 1)',
//               'rgba(75, 192, 192, 1)',
//               'rgba(153, 102, 255, 1)',
//               'rgba(255, 159, 64, 1)'
//           ],
//           borderWidth: 1
//       }]
//   },
//   options: {
//       scales: {
//           y: {
//               beginAtZero: true
//           }
//       }
//   }
// });

// var ctx = document.getElementById('myChart').getContext('2d');

const labels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
];
const data = {
  labels: labels,
  datasets: [{
    label: 'My First dataset',
    // backgroundColor: 'rgb(255, 99, 132)',
    // borderColor: 'rgb(255, 99, 132)',
    data: [0, 10, 5, 2, 20, 30, 45],
  }]
};




const config = {
  type: 'line',
  data,
  options: {}
};




var myChart = new Chart(
  document.getElementById('myChart'),
  config
);




// a bunch of JSON Data for testing - kept it down here to avoid creating a server file to serve them up

// globalQuote =[
//   {
//     "01. symbol": "IBM",
//     "02. open": "142.3200",
//     "03. high": "143.2000",
//     "04. low": "140.9200",
//     "05. price": "143.1900",
//     "06. volume": "4300732",
//     "07. latest trading day": "2021-05-19",
//     "08. previous close": "143.9100",
//     "09. change": "-0.7200",
//     "10. change percent": "-0.5003%"
//   },
//   {
//     "01. symbol": "FK1",
//     "02. open": "142.3200",
//     "03. high": "143.2000",
//     "04. low": "140.9200",
//     "05. price": "143.1900",
//     "06. volume": "4300732",
//     "07. latest trading day": "2021-05-19",
//     "08. previous close": "143.9100",
//     "09. change": "-0.7200",
//     "10. change percent": "-0.5003%"
//   },
//   {
//     "01. symbol": "FK2",
//     "02. open": "142.3200",
//     "03. high": "143.2000",
//     "04. low": "140.9200",
//     "05. price": "143.1900",
//     "06. volume": "4300732",
//     "07. latest trading day": "2021-05-19",
//     "08. previous close": "143.9100",
//     "09. change": "-0.7200",
//     "10. change percent": "-0.5003%"
//   }

// ]



// companyDetails = [
//   {
//     "Symbol": "IBM",
//     "AssetType": "Common Stock",
//     "Name": "International Business Machines Corporation",
//     "Description": "International Business Machines Corporation provides integrated solutions and services worldwide. Its Cloud & Cognitive Software segment offers software for vertical and domain-specific solutions in health, financial services, supply chain, and asset management, weather, and security software and services application areas; and customer information control system and storage, and analytics and integration software solutions to support client mission critical on-premise workloads in banking, airline, and retail industries. It also offers middleware and data platform software, including Red Hat that enables the operation of clients' hybrid multi-cloud environments; and Cloud Paks, WebSphere distributed, and analytics platform software, such as DB2 distributed, information integration, and enterprise content management, as well as IoT, Blockchain and AI/Watson platforms. The company's Global Business Services segment offers business consulting services; system integration, application management, maintenance, and support services for packaged software; and finance, procurement, talent and engagement, and industry-specific business process outsourcing services. Its Global Technology Services segment provides IT infrastructure and platform services; and project, managed, outsourcing, and cloud-delivered services for enterprise IT infrastructure environments; and IT infrastructure support services. The company's Systems segment offers servers for businesses, cloud service providers, and scientific computing organizations; data storage products and solutions; and z/OS, an enterprise operating system, as well as Linux. Its Global Financing segment provides lease, installment payment, loan financing, short-term working capital financing, and remanufacturing and remarketing services. The company was formerly known as Computing-Tabulating-Recording Co. The company was incorporated in 1911 and is headquartered in Armonk, New York.",
//     "CIK": "51143",
//     "Exchange": "NYSE",
//     "Currency": "USD",
//     "Country": "USA",
//     "Sector": "Technology",
//     "Industry": "Information Technology Services",
//     "Address": "One New Orchard Road, Armonk, NY, United States, 10504",
//     "FullTimeEmployees": "345900",
//     "FiscalYearEnd": "December",
//     "LatestQuarter": "2021-03-31",
//     "MarketCapitalization": "127943565312",
//     "EBITDA": "15822000128",
//     "PERatio": "23.9528",
//     "PEGRatio": "1.5614",
//     "BookValue": "23.938",
//     "DividendPerShare": "6.52",
//     "DividendYield": "0.0453",
//     "EPS": "5.978",
//     "RevenuePerShareTTM": "82.734",
//     "ProfitMargin": "0.0728",
//     "OperatingMarginTTM": "0.1232",
//     "ReturnOnAssetsTTM": "0.0376",
//     "ReturnOnEquityTTM": "0.2536",
//     "RevenueTTM": "73779003392",
//     "GrossProfitTTM": "35575000000",
//     "DilutedEPSTTM": "5.978",
//     "QuarterlyEarningsGrowthYOY": "-0.192",
//     "QuarterlyRevenueGrowthYOY": "0.009",
//     "AnalystTargetPrice": "143.63",
//     "TrailingPE": "23.9528",
//     "ForwardPE": "13.2802",
//     "PriceToSalesRatioTTM": "1.7667",
//     "PriceToBookRatio": "6.062",
//     "EVToRevenue": "2.4349",
//     "EVToEBITDA": "13.2425",
//     "Beta": "1.2262",
//     "52WeekHigh": "148.38",
//     "52WeekLow": "101.8909",
//     "50DayMovingAverage": "139.9232",
//     "200DayMovingAverage": "127.6438",
//     "SharesOutstanding": "893523008",
//     "SharesFloat": "891896616",
//     "SharesShort": "28585173",
//     "SharesShortPriorMonth": "27009286",
//     "ShortRatio": "4.96",
//     "ShortPercentOutstanding": "0.03",
//     "ShortPercentFloat": "0.032",
//     "PercentInsiders": "0.134",
//     "PercentInstitutions": "57.742",
//     "ForwardAnnualDividendRate": "6.56",
//     "ForwardAnnualDividendYield": "0.0456",
//     "PayoutRatio": "0.7593",
//     "DividendDate": "2021-06-10",
//     "ExDividendDate": "2021-05-07",
//     "LastSplitFactor": "2:1",
//     "LastSplitDate": "1999-05-27"
//   },
//   {
//     "Symbol": "FK1",
//     "AssetType": "Common Stock",
//     "Name": "Fake Company 1",
//     "Description": "International Business Machines Corporation provides integrated solutions and services worldwide. Its Cloud & Cognitive Software segment offers software for vertical and domain-specific solutions in health, financial services, supply chain, and asset management, weather, and security software and services application areas; and customer information control system and storage, and analytics and integration software solutions to support client mission critical on-premise workloads in banking, airline, and retail industries. It also offers middleware and data platform software, including Red Hat that enables the operation of clients' hybrid multi-cloud environments; and Cloud Paks, WebSphere distributed, and analytics platform software, such as DB2 distributed, information integration, and enterprise content management, as well as IoT, Blockchain and AI/Watson platforms. The company's Global Business Services segment offers business consulting services; system integration, application management, maintenance, and support services for packaged software; and finance, procurement, talent and engagement, and industry-specific business process outsourcing services. Its Global Technology Services segment provides IT infrastructure and platform services; and project, managed, outsourcing, and cloud-delivered services for enterprise IT infrastructure environments; and IT infrastructure support services. The company's Systems segment offers servers for businesses, cloud service providers, and scientific computing organizations; data storage products and solutions; and z/OS, an enterprise operating system, as well as Linux. Its Global Financing segment provides lease, installment payment, loan financing, short-term working capital financing, and remanufacturing and remarketing services. The company was formerly known as Computing-Tabulating-Recording Co. The company was incorporated in 1911 and is headquartered in Armonk, New York.",
//     "CIK": "51143",
//     "Exchange": "NYSE",
//     "Currency": "USD",
//     "Country": "USA",
//     "Sector": "Technology",
//     "Industry": "Information Technology Services",
//     "Address": "One New Orchard Road, Armonk, NY, United States, 10504",
//     "FullTimeEmployees": "345900",
//     "FiscalYearEnd": "December",
//     "LatestQuarter": "2021-03-31",
//     "MarketCapitalization": "127943565312",
//     "EBITDA": "15822000128",
//     "PERatio": "23.9528",
//     "PEGRatio": "1.5614",
//     "BookValue": "23.938",
//     "DividendPerShare": "6.52",
//     "DividendYield": "0.0453",
//     "EPS": "5.978",
//     "RevenuePerShareTTM": "82.734",
//     "ProfitMargin": "0.0728",
//     "OperatingMarginTTM": "0.1232",
//     "ReturnOnAssetsTTM": "0.0376",
//     "ReturnOnEquityTTM": "0.2536",
//     "RevenueTTM": "73779003392",
//     "GrossProfitTTM": "35575000000",
//     "DilutedEPSTTM": "5.978",
//     "QuarterlyEarningsGrowthYOY": "-0.192",
//     "QuarterlyRevenueGrowthYOY": "0.009",
//     "AnalystTargetPrice": "143.63",
//     "TrailingPE": "23.9528",
//     "ForwardPE": "13.2802",
//     "PriceToSalesRatioTTM": "1.7667",
//     "PriceToBookRatio": "6.062",
//     "EVToRevenue": "2.4349",
//     "EVToEBITDA": "13.2425",
//     "Beta": "1.2262",
//     "52WeekHigh": "148.38",
//     "52WeekLow": "101.8909",
//     "50DayMovingAverage": "139.9232",
//     "200DayMovingAverage": "127.6438",
//     "SharesOutstanding": "893523008",
//     "SharesFloat": "891896616",
//     "SharesShort": "28585173",
//     "SharesShortPriorMonth": "27009286",
//     "ShortRatio": "4.96",
//     "ShortPercentOutstanding": "0.03",
//     "ShortPercentFloat": "0.032",
//     "PercentInsiders": "0.134",
//     "PercentInstitutions": "57.742",
//     "ForwardAnnualDividendRate": "6.56",
//     "ForwardAnnualDividendYield": "0.0456",
//     "PayoutRatio": "0.7593",
//     "DividendDate": "2021-06-10",
//     "ExDividendDate": "2021-05-07",
//     "LastSplitFactor": "2:1",
//     "LastSplitDate": "1999-05-27"
//   },
//   {
//     "Symbol": "FK2",
//     "AssetType": "Common Stock",
//     "Name": "Fake Company 2",
//     "Description": "International Business Machines Corporation provides integrated solutions and services worldwide. Its Cloud & Cognitive Software segment offers software for vertical and domain-specific solutions in health, financial services, supply chain, and asset management, weather, and security software and services application areas; and customer information control system and storage, and analytics and integration software solutions to support client mission critical on-premise workloads in banking, airline, and retail industries. It also offers middleware and data platform software, including Red Hat that enables the operation of clients' hybrid multi-cloud environments; and Cloud Paks, WebSphere distributed, and analytics platform software, such as DB2 distributed, information integration, and enterprise content management, as well as IoT, Blockchain and AI/Watson platforms. The company's Global Business Services segment offers business consulting services; system integration, application management, maintenance, and support services for packaged software; and finance, procurement, talent and engagement, and industry-specific business process outsourcing services. Its Global Technology Services segment provides IT infrastructure and platform services; and project, managed, outsourcing, and cloud-delivered services for enterprise IT infrastructure environments; and IT infrastructure support services. The company's Systems segment offers servers for businesses, cloud service providers, and scientific computing organizations; data storage products and solutions; and z/OS, an enterprise operating system, as well as Linux. Its Global Financing segment provides lease, installment payment, loan financing, short-term working capital financing, and remanufacturing and remarketing services. The company was formerly known as Computing-Tabulating-Recording Co. The company was incorporated in 1911 and is headquartered in Armonk, New York.",
//     "CIK": "51143",
//     "Exchange": "NYSE",
//     "Currency": "USD",
//     "Country": "USA",
//     "Sector": "Technology",
//     "Industry": "Information Technology Services",
//     "Address": "One New Orchard Road, Armonk, NY, United States, 10504",
//     "FullTimeEmployees": "345900",
//     "FiscalYearEnd": "December",
//     "LatestQuarter": "2021-03-31",
//     "MarketCapitalization": "127943565312",
//     "EBITDA": "15822000128",
//     "PERatio": "23.9528",
//     "PEGRatio": "1.5614",
//     "BookValue": "23.938",
//     "DividendPerShare": "6.52",
//     "DividendYield": "0.0453",
//     "EPS": "5.978",
//     "RevenuePerShareTTM": "82.734",
//     "ProfitMargin": "0.0728",
//     "OperatingMarginTTM": "0.1232",
//     "ReturnOnAssetsTTM": "0.0376",
//     "ReturnOnEquityTTM": "0.2536",
//     "RevenueTTM": "73779003392",
//     "GrossProfitTTM": "35575000000",
//     "DilutedEPSTTM": "5.978",
//     "QuarterlyEarningsGrowthYOY": "-0.192",
//     "QuarterlyRevenueGrowthYOY": "0.009",
//     "AnalystTargetPrice": "143.63",
//     "TrailingPE": "23.9528",
//     "ForwardPE": "13.2802",
//     "PriceToSalesRatioTTM": "1.7667",
//     "PriceToBookRatio": "6.062",
//     "EVToRevenue": "2.4349",
//     "EVToEBITDA": "13.2425",
//     "Beta": "1.2262",
//     "52WeekHigh": "148.38",
//     "52WeekLow": "101.8909",
//     "50DayMovingAverage": "139.9232",
//     "200DayMovingAverage": "127.6438",
//     "SharesOutstanding": "893523008",
//     "SharesFloat": "891896616",
//     "SharesShort": "28585173",
//     "SharesShortPriorMonth": "27009286",
//     "ShortRatio": "4.96",
//     "ShortPercentOutstanding": "0.03",
//     "ShortPercentFloat": "0.032",
//     "PercentInsiders": "0.134",
//     "PercentInstitutions": "57.742",
//     "ForwardAnnualDividendRate": "6.56",
//     "ForwardAnnualDividendYield": "0.0456",
//     "PayoutRatio": "0.7593",
//     "DividendDate": "2021-06-10",
//     "ExDividendDate": "2021-05-07",
//     "LastSplitFactor": "2:1",
//     "LastSplitDate": "1999-05-27"
//   }
// ]

// bestMatches1 = [
//     {
//       "1. symbol": "TESO",
//       "2. name": "Tesco Corporation USA",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.8889"
//     },
//     {
//       "1. symbol": "TSCO.LON",
//       "2. name": "Tesco PLC",
//       "3. type": "Equity",
//       "4. region": "United Kingdom",
//       "5. marketOpen": "08:00",
//       "6. marketClose": "16:30",
//       "7. timezone": "UTC+01",
//       "8. currency": "GBX",
//       "9. matchScore": "0.7273"
//     },
//     {
//       "1. symbol": "TSCDF",
//       "2. name": "Tesco plc",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.7143"
//     },
//     {
//       "1. symbol": "TSCDY",
//       "2. name": "Tesco plc",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.7143"
//     },
//     {
//       "1. symbol": "TCO.DEX",
//       "2. name": "Tesco PLC",
//       "3. type": "Equity",
//       "4. region": "XETRA",
//       "5. marketOpen": "08:00",
//       "6. marketClose": "20:00",
//       "7. timezone": "UTC+02",
//       "8. currency": "EUR",
//       "9. matchScore": "0.7143"
//     },
//     {
//       "1. symbol": "TCO.FRK",
//       "2. name": "Tesco PLC",
//       "3. type": "Equity",
//       "4. region": "Frankfurt",
//       "5. marketOpen": "08:00",
//       "6. marketClose": "20:00",
//       "7. timezone": "UTC+02",
//       "8. currency": "EUR",
//       "9. matchScore": "0.7143"
//     },
//     {
//       "1. symbol": "TCEHY",
//       "2. name": "Tencent Holdings Ltd",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.5185"
//     },
//     {
//       "1. symbol": "TCTZF",
//       "2. name": "Tencent Holdings Ltd",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.5185"
//     },
//     {
//       "1. symbol": "0Z4S.LON",
//       "2. name": "Tencent Holdings Limited",
//       "3. type": "Equity",
//       "4. region": "United Kingdom",
//       "5. marketOpen": "08:00",
//       "6. marketClose": "16:30",
//       "7. timezone": "UTC+01",
//       "8. currency": "GBX",
//       "9. matchScore": "0.4516"
//     },
//     {
//       "1. symbol": "NNN1.FRK",
//       "2. name": "Tencent Holdings Limited",
//       "3. type": "Equity",
//       "4. region": "Frankfurt",
//       "5. marketOpen": "08:00",
//       "6. marketClose": "20:00",
//       "7. timezone": "UTC+02",
//       "8. currency": "EUR",
//       "9. matchScore": "0.4516"
//     },
//     {
//       "1. symbol": "NNND.FRK",
//       "2. name": "Tencent Holdings Limited",
//       "3. type": "Equity",
//       "4. region": "Frankfurt",
//       "5. marketOpen": "08:00",
//       "6. marketClose": "20:00",
//       "7. timezone": "UTC+02",
//       "8. currency": "EUR",
//       "9. matchScore": "0.4516"
//     },
//     {
//       "1. symbol": "TME",
//       "2. name": "Tencent Music Entertainment Group",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.4000"
//     },
//     {
//       "1. symbol": "BA",
//       "2. name": "Boeing Company",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "1.0000"
//     },
//     {
//       "1. symbol": "BAA",
//       "2. name": "Banro Corporation USA",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.8000"
//     },
//     {
//       "1. symbol": "BAB",
//       "2. name": "Invesco Taxable Municipal Bond ETF",
//       "3. type": "ETF",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.8000"
//     },
//     {
//       "1. symbol": "BA.LON",
//       "2. name": "BAE Systems plc",
//       "3. type": "Equity",
//       "4. region": "United Kingdom",
//       "5. marketOpen": "08:00",
//       "6. marketClose": "16:30",
//       "7. timezone": "UTC+01",
//       "8. currency": "GBX",
//       "9. matchScore": "0.6667"
//     },
//     {
//       "1. symbol": "BABA",
//       "2. name": "Alibaba Group Holding Ltd",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.6667"
//     },
//     {
//       "1. symbol": "BABB",
//       "2. name": "BAB Inc",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.6667"
//     },
//     {
//       "1. symbol": "BA3.FRK",
//       "2. name": "Brooks Automation",
//       "3. type": "Equity",
//       "4. region": "Frankfurt",
//       "5. marketOpen": "08:00",
//       "6. marketClose": "20:00",
//       "7. timezone": "UTC+02",
//       "8. currency": "EUR",
//       "9. matchScore": "0.5714"
//     },
//     {
//       "1. symbol": "BAAPX",
//       "2. name": "BlackRock Aggressive GwthPrprdPtfInvstrA",
//       "3. type": "Mutual Fund",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.5714"
//     },
//     {
//       "1. symbol": "BABAF",
//       "2. name": "Alibaba Group Holding Ltd",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.5714"
//     },
//     {
//       "1. symbol": "BABA34.SAO",
//       "2. name": "BABA34",
//       "3. type": "Equity",
//       "4. region": "Brazil/Sao Paolo",
//       "5. marketOpen": "10:00",
//       "6. marketClose": "17:30",
//       "7. timezone": "UTC-03",
//       "8. currency": "BRL",
//       "9. matchScore": "0.5000"
//     },
//     {
//       "1. symbol": "SAIC",
//       "2. name": "Science Applications International Corp",
//       "3. type": "Equity",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "1.0000"
//     },
//     {
//       "1. symbol": "SAICX",
//       "2. name": "JPMORGAN SMARTALLOCATION INCOME FUND CLASS C",
//       "3. type": "Mutual Fund",
//       "4. region": "United States",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "16:00",
//       "7. timezone": "UTC-04",
//       "8. currency": "USD",
//       "9. matchScore": "0.8889"
//     },
//     {
//       "1. symbol": "SAIC11B.SAO",
//       "2. name": "Fundo Investimento Imobiliario FII",
//       "3. type": "ETF",
//       "4. region": "Brazil/Sao Paolo",
//       "5. marketOpen": "10:00",
//       "6. marketClose": "17:30",
//       "7. timezone": "UTC-03",
//       "8. currency": "BRL",
//       "9. matchScore": "0.5714"
//     },
//     {
//       "1. symbol": "600104.SHH",
//       "2. name": "SAIC Motor Corporation Ltd",
//       "3. type": "Equity",
//       "4. region": "Shanghai",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "15:00",
//       "7. timezone": "UTC+08",
//       "8. currency": "CNY",
//       "9. matchScore": "0.2667"
//     },
//     {
//       "1. symbol": "IBM",
//       "2. name": "International Business Machines Corporation",
//       "3. type": "Equity",
//       "4. region": "USA",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "15:00",
//       "7. timezone": "UTC+08",
//       "8. currency": "USD",
//       "9. matchScore": "0.26671"
//     },
//     {
//       "1. symbol": "FK1",
//       "2. name": "Fake Company 1",
//       "3. type": "Equity",
//       "4. region": "USA",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "15:00",
//       "7. timezone": "UTC+08",
//       "8. currency": "USD",
//       "9. matchScore": "0.26671"
//     },
//     {
//       "1. symbol": "FK2",
//       "2. name": "Fake Company 2",
//       "3. type": "Equity",
//       "4. region": "USA",
//       "5. marketOpen": "09:30",
//       "6. marketClose": "15:00",
//       "7. timezone": "UTC+08",
//       "8. currency": "USD",
//       "9. matchScore": "0.26671"
//     }
// ]



