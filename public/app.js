
let analysisAPI = 'http://192.168.99.100:39999/analysis/v1.0/search/'
let gMap



//----------TextOverlay-Begin----------//

function TextOverlay(pos, text, cluster) {
    this.pos = pos
    this.text = text
    this.div = null
    this.setMap(gMap)
    this.cluster = cluster
}

TextOverlay.prototype = new google.maps.OverlayView()

TextOverlay.prototype.onAdd = function() {
    this.div = document.createElement('div')
    let c = this.cluster
    this.div.onclick = function() {
        document.querySelector('.side').classList.remove('display-none')    
        let i = new InfoBox(c)
        i.clear()
        i.drawPopWords()
    }
    this.div.textContent = this.text
    this.div.className = 'text-overlay'
    let pos = this.getProjection().fromLatLngToDivPixel(this.pos)
    this.div.style.left = pos.x + 'px'
    this.div.style.top = pos.y + 'px'
    this.getPanes().floatPane.appendChild(this.div)
}
// Position erneuern wenn z.B. gezoomed wird
TextOverlay.prototype.draw = function() {
    let pos = this.getProjection().fromLatLngToDivPixel(this.pos)
    this.div.style.left = pos.x + 'px'
    this.div.style.top = pos.y + 'px'
}

TextOverlay.prototype.remove = function() {
    this.div.parentNode.removeChild(this.div)
    this.div = null
}

//----------TextOverlay-End----------//




//----------Informationbox-Begin----------//

function InfoBox(cluster){
    this.popWord = document.getElementById("popularWords")
    this.conWord = document.getElementById("connectetWords")
    this.popTweets = document.getElementById("popularTweets")
    this.cluster = cluster
}

InfoBox.prototype.drawPopWords = function(){
     let tags = Object.keys(this.cluster.connections)
     this.FillBox(this.popWord, tags)
}

InfoBox.prototype.drawConWords = function(word){
    let tags = Object.keys(this.cluster.connections[word])
    this.FillBox(this.conWord, tags)
}

InfoBox.prototype.clear = function(){
    this.clearBox(this.popWord)
    this.clearBox(this.conWord)
    this.clearBox(this.popTweets)
}

InfoBox.prototype.clearBox = function(element){
    while(element.childElementCount > 0){
        element.removeChild(element.firstChild);    
    }
}

InfoBox.prototype.FillBox = function(box, tags){
    this.clearBox(box)
    for(let tag of tags){
        let link = document.createElement('a')
        let name = document.createElement('div')
        let info = document.createElement('div')
        
        let i = this
        link.href = "javascript:void(0)"
        if(tag in this.cluster.connections){
            link.onclick = function(){i.drawConWords(tag)}
        }else{
            link.onclick = function(){}
        }
        
        name.innerHTML = tag
        name.style.fontSize = "20px"
        
        info.innerHTML = this.cluster.words[tag] + " mentions | Sentiment: " + this.cluster.polarities[tag]
        info.style.fontSize = "15px"

        
        link.appendChild(name)
        link.appendChild(info)
        box.appendChild(link)
     }
}

InfoBox.prototype.drawTweets+function(word){
    alert("Tweets not implemented")
}

//----------Informationbox-End----------//




document.querySelector('.close-btn').onclick = function() {
    this.parentNode.classList.toggle('display-none')
}

function buildRequest() {
    return analysisAPI + [...arguments].join('/')
}

async function update() {
        //TestData
        let testData = getTestData()    
        drawCluster(testData)
    
        let center = gMap.getCenter()
        let res = await fetch(buildRequest(center.lat(), center.lng(), getRad(), '1331856000.2', '2000000000.2'))
        let json = await res.json()
        drawCluster(json)
}

gMapsLoaded.then(async map => {
    gMap = map 
    gMap.addListener('idle', update)
})

//Getestet aber muss noch eingebunden werden, die map muss initialisiert sein damit es funktioniert sonst gibt es undifiend oder null errors
//Funktion zum berechnen des Radius
function getRad(){
    let ne = gMap.getBounds().getNorthEast()
    let center = gMap.getBounds().getCenter()
    let lat = ne.lat() - center.lat()
    let lng = ne.lng() - center.lng()
    let rad = Math.sqrt(lat * lat + lng * lng)
    return rad
}

//Zeichnet die Cluster auf der Map ein
function drawCluster(data){
    for(let cluster of data.clusters){
        let pos = new google.maps.LatLng(cluster.center[0], cluster.center[1])
            
        let mostPopularWord = ''
        let mostPopularValue = 0
        for (let key in cluster.words) {
            let value = cluster.words[key]
            if (value > mostPopularValue) {
                mostPopularWord = key
                mostPopularValue = value
            }
        }
            
        new TextOverlay(pos, mostPopularWord, cluster)
        
    }
}

//----------Testfunction----------//

function getTestData(){
    return {
        clusters: [
            {
                center: [53.557047, 10.023038],
                connections: {
                    someword: {
                        someword1: 15,
                        other: 26,
                        words: 28,
                        and: 26,
                        their: 27,
                        connection: 27,
                        strength: 81
                    },
                    someword1: {
                        other: 26,
                        words: 28,
                        and: 26,
                        their: 27,
                        strength: 81
                    },
                    someword2: {
                        other: 26,
                        words: 28,
                        and: 26,
                        their: 27,
                        connection: 27,
                    },
                    someword3: {
                        other: 26,
                        their: 27,
                        connection: 27,
                        strength: 81
                    },
                    someword4: {
                        other: 26,
                        words: 28,
                        and: 26,
                        their: 27,
                        connection: 27,
                        strength: 81
                    },
                    someotherword: { 
                        other: 26,
                        words: 28,
                        and: 26,
                        their: 27,
                        connection: 27,
                        strength: 81,
                        testdata: 1
                    }
                    
                },
                polarities: {
                    someword: 0.5,
                    someotherword: 0.6,
                    someword1: 0.1,
                    someword2: 0.3,
                    someword3: 0.6,
                    someword4: 0.7,
                    other: 0.26,
                    words: 0.28,
                    and: 0.26,
                    their: 0.27,
                    connection: 0.27,
                    strength: 0.81,
                    testdata: 1
                },
                words:{
                    someword: 5,
                    someotherword: 6,
                    someword1: 5,
                    someword2: 3,
                    someword3: 2,
                    someword4: 1,
                    other: 26,
                    words: 28,
                    and: 26,
                    their: 27,
                    connection: 27,
                    strength: 81,
                    testdata: 100
                }
            }
        ],
        query: {
            end: 2000000000,
            lat: 53.552050,
            lng: 9.992694,
            radius: 3,
            start: 1331856000
        }
    }
}
