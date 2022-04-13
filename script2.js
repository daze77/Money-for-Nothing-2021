
const token = 'sandbox_c2m4iqqad3idnodd7te0'

const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ["January","February","March","April","May","June","July", "August","September","October","November","December"];

// stock search API varibles
let fullStockList

pullStockList()



// Infor for Local Storage and Watch List
var lswl
var lsCompCheck
var newCompany
var stockSymb


// API variables
// let corpQuote = []
let compDetails = []
let basicFinancials = []
let candleInfo = []

// check local storage for entry
function LS() {
    lswl = localStorage.lswl ? JSON.parse(localStorage.lswl) : []
  
    // if local storage has an entry populate watchlist
    watchlist()
  }


async function pullStockList(){
    
      fullStockList = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&securityType=Common Stock&token=${token}`).then(r=>r.json())

      fullStockList = fullStockList.filter(e=> e.mic === "XNYS"
      || e.mic === "XASE"
      || e.mic === "BATS"
      || e.mic === "ARCX"
      || e.mic === "XNMS"
      || e.mic === "XNCM"
      || e.mic === "XNGS"
      || e.mic === "IEXG"
      || e.mic === "XNAS"
      )
      console.log('this is the filtered list --> newStockList', fullStockList)

}

let filterResults = []


function stockSearch(){
    let companySearch = document.querySelector('#stockSearch').value.toUpperCase()

    filterResults = fullStockList.filter(list => list.description.includes(companySearch) || list.displaySymbol.includes(companySearch))
    
    filterResultsOptions(filterResults)

    if(companySearch.includes('-')){
      companySearch = companySearch.split('-')

      const results = fullStockList.filter(item => item.displaySymbol === companySearch[0] && item.description.includes(companySearch[1]))

      filterResultsOptions(results)
    }
}

function filterResultsOptions(res){

    if(res.length === 1){
        document.querySelector('#datalistOptions1').innerHTML = ""
        
        res.forEach(stock => document.querySelector('#datalistOptions1').innerHTML += `<option value=${stock.displaySymbol}-${stock.description} > ${stock.description}</option>`
        )
        stockDetailAPI(res[0].displaySymbol)
    }else if(res.length <=30){
        document.querySelector('#datalistOptions1').innerHTML = ""
        
        res.forEach(stock => document.querySelector('#datalistOptions1').innerHTML += `<option value=${stock.displaySymbol}-${stock.description} > ${stock.description}</option>`
        )
    }
}



async function stockDetailAPI(symbolSelected){
    console.log('we made it')

    let todaysDate = Math.floor(Date.now()/1000)
    let aYearAgo = Math.floor((new Date().setDate(new Date().getDate()-365))/1000)

    compDetails  = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbolSelected}&token=c2m4iqqad3idnodd7tdg`).then(r => r.json())

    console.log(compDetails)
    
    let corpQuote = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbolSelected}&token=c2m4iqqad3idnodd7tdg`).then(r => r.json())
    
    basicFinancials = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbolSelected}&metric=all&token=c2m4iqqad3idnodd7tdg`).then(r => r.json())
    
    candleInfo = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbolSelected}&resolution=M&from=${aYearAgo}&to=${todaysDate}&token=c2m4iqqad3idnodd7tdg`).then(r=>r.json())

    let timeStampHumanDate = new Date(corpQuote.t*1000)
 
    let timeStampMonth = months[timeStampHumanDate.getMonth()]
    let timeStampDay = days[timeStampHumanDate.getDay()]
    let timeStampDate = timeStampHumanDate.getDate()
    let timeStampYear = timeStampHumanDate.getFullYear()



      // fill the company card with details
      document.querySelector('#sharePrice').innerHTML = `Share Price (USD):  <span>$ ${corpQuote.c}</span>`
      document.querySelector('#dateNow').innerHTML = `<small>As of:  ${timeStampDay} ${timeStampMonth} ${timeStampDate}, ${timeStampYear}</small>`

      document.querySelector('#yearHigh').innerHTML = `52 Week High:  <span>$ ${(basicFinancials.metric["52WeekHigh"]).toFixed(2)} </span>`
      document.querySelector('#yearLow').innerHTML = `52 Week Low:  <span>$ ${(basicFinancials.metric["52WeekLow"]).toFixed(2)} </span>`
      document.querySelector('#allEarnings').innerHTML = `Quarter Earnings Growth:  <span id="cardQRevenue" >${(basicFinancials.metric["revenueGrowthQuarterlyYoy"]).toFixed(2)}%</span>`
      document.querySelector('#allRevenue').innerHTML = `Quarter Rev Growth:  <span id="cardQEarnings" >${(basicFinancials.metric["epsGrowthQuarterlyYoy"]).toFixed(2)}%</span>`
  
      document.querySelector('#companyName').innerHTML = `<img style="width:50px" src=${compDetails.logo} />  ${compDetails["name"]}`
  
      document.querySelector('#cardheadQuarters').innerHTML = `Headquarters: ${compDetails["country"]}`
      document.querySelector('#cardType').innerHTML = `Sector:  ${compDetails["finnhubIndustry"]}`


    // flag color of quarterlies - negative value is red
    if (basicFinancials.metric["revenueGrowthQuarterlyYoy"] < 0) { document.querySelector("#cardQRevenue").style.color = "red" }
    if (basicFinancials.metric["epsGrowthQuarterlyYoy"] < 0) { document.querySelector("#cardQEarnings").style.color = "red" }


    // candleInfo Timestamps to Months Conversion - for chart rendering
    let candleInfoMonths = []
    candleInfo.t.forEach(time => {
      candleInfoDates = months[(new Date(time*1000)).getMonth()]
      candleInfoMonths.push(candleInfoDates)

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
    news = news.results.filter(item => item.multimedia !== null)
  
    for (i = 0; i < 5; i++) {
  
      title = news[i].title
      console.log(title)
      url = news[i].url
      hotTitle = title.link(`${url}`)
      console.log(url)
     
      image = news[i].multimedia[0].url
      caption = news[i].multimedia[0].caption
  
      changeNews()     
    }
}
  
// Displays news info in a card on screen

function changeNews(){
    // Displays title of News
    document.querySelector(`#newsstory${i}`).innerHTML = hotTitle
    //Displays image that accompanies article
    document.querySelector(`#nwsImg${i}`).src = image
    //Displays caption that accompanies article
    document.querySelector(`#caption${i}`).innerHTML = caption 

}
//END NEWS API
//----------------------------------------------------------------------------------------------------
  

  // Scan local storage
function checkLS(ssymbol) {
    lswl.find(e => (e.ticker===ssymbol)) ? 
    (console.log("already on list"), document.querySelector('.wlbtn').classList.replace("btn-success", "btn-danger"),
    document.querySelector('.wlbtn').innerHTML = "- from Watchlist") :  (console.log("not yet on list"),document.querySelector('.wlbtn').classList.replace("btn-danger", "btn-success"),
    document.querySelector('.wlbtn').innerHTML = "+ to Watchlist")
  }


  // Watchlist button trigger (add or remove from list)
function watchListBtn(event) {
  // console.log("Watch List button pressed")
  var wlbtnresults = document.querySelector('.wlbtn').innerText
  wlbtnresults === "+ to Watchlist" ? addLocalStorage(event) : removeLocalStorage(event)
}
  
  
  // save items to local storage
  function addLocalStorage(symbol) {
    newCompany = {
      name: `${compDetails["name"]}`,
      ticker: symbol,
    }
  
    lswl.push(newCompany)
    localStorage.lswl=JSON.stringify(lswl)
  
    checkLS(symbol)
    watchlist()
  }
  
  // remove from local storage
  function removeLocalStorage(symbol) {
    lswl = lswl.filter(e => (e.ticker !== symbol))
    localStorage.lswl = JSON.stringify(lswl)
    watchlist(symbol)
    checkLS(symbol)
  }
  
  // Add to  Watchlist
  function watchlist() {
    document.querySelector('.list-group').innerHTML = ""
  
    for (i = 0; i < lswl.length; i++) {
      var tick = lswl[i].ticker
      var nam = lswl[i].name
  
      document.querySelector('.list-group').innerHTML += 
        `<li class="wlBtn"> 
            <button type="button" class="btn btn-outline-light" onClick="wlBtnSearch('${tick}')">
              <span id="stkName">${nam}</span> - <span id = "stkSymb">${tick}</span>
            </button>
          </li>
        `  
    }
  }
  
  // when the watchlist button is pushed, pass the company name via the search function trigger
  function wlBtnSearch(tick) {
    stockDetailAPI(tick)
    checkLS(tick)
  }
  
  
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
  
  
  let tickerTape = {
    "symbols": [
    {
        "proName": "FOREXCOM:SPXUSD",
        "title": "S&P 500"
    },
    {
        "proName": "FOREXCOM:NSXUSD",
        "title": "Nasdaq 100"
    },
    {
        "proName": "FX_IDC:EURUSD",
        "title": "EUR/USD"
    },
    {
        "proName": "BITSTAMP:BTCUSD",
        "title": "BTC/USD"
    },
    {
        "proName": "BITSTAMP:ETHUSD",
        "title": "ETH/USD"
    }
    ],
    "colorTheme": "light",
    "isTransparent": false,
    "showSymbolLogo": true,
    "locale": "en"
  }
  
  
  LS()
  getNews()
  checkLS()