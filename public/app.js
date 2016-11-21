
let analysisAPI = '/analysis/v1.0/search/'
let gMap
let iDisplay


//----------TextOverlay-Begin----------//

function TextOverlay(pos, text, cluster, bColor, iBox) {
    this.pos = pos
    this.text = text
    this.div = null
    this.setMap(gMap)
    this.cluster = cluster
    this.bColor = bColor
    this.iBox = iDisplay
}

TextOverlay.prototype = new google.maps.OverlayView()

TextOverlay.prototype.onAdd = function() {
    this.div = document.createElement('div')
    let c = this.cluster
    let iB = this.iBox
    this.div.onclick = function() {
        document.querySelector('.side').classList.remove('display-none')  
        iB.cluster = c
        iB.draw()
    }
    this.div.textContent = this.text
    this.div.className = 'text-overlay'
    let pos = this.getProjection().fromLatLngToDivPixel(this.pos)
    this.div.style.left = pos.x + 'px'
    this.div.style.top = pos.y + 'px'
    this.getPanes().floatPane.appendChild(this.div)
    this.div.style.backgroundColor = this.bColor 
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

function InfoBox(){
    this.topNav = document.getElementById("navigationBar")
    this.popWord = document.getElementById("popularWords")
    this.diagram = document.getElementById('dia')
    this.cluster = null
    this.selectedWord = null
}

InfoBox.prototype.draw = function(){
    if(this.cluster != null){
        this.clearAll()
        this.drawPopWords()
        this.drawChart()
    }
}

InfoBox.prototype.createDiaData = function(){
    if(this.selectedWord == null){
        let data = [['Popular Word','Mentions', {role: 'style'}]]
        for (let key in this.cluster.connections) {
            data.push([key, this.cluster.words[key], sentimentToColor(this.cluster.polarities[key])])
        }
        return data
    }else{
        let data = [['Connected Words','Mentions', {role: 'style'}]]
        for (let key in this.cluster.connections[this.selectedWord]) {
            data.push([key, this.cluster.connections[this.selectedWord][key], sentimentToColor(this.cluster.polarities[key])])
        }
        return data
    }
}

InfoBox.prototype.drawChart = function(){
    let arrayData = this.createDiaData()
    var data = google.visualization.arrayToDataTable(arrayData)
    let title = (this.selectedWord == null ? 'Popular Words' : 'Connected Words')
    
    var options = {
        'legend': {position: 'none'},
        'title':title,
        'is3D':true
    }
    
    var chart = new google.visualization.BarChart(this.diagram);
    chart.draw(data, options);
}  

InfoBox.prototype.drawPopWords = function(){
    let tags = Object.keys(this.cluster.connections)
    let box = this.popWord
    for(let tag of tags){
        let link = document.createElement('a')
        let name = document.createElement('div')
        let info = document.createElement('div')
        
        let i = this
        link.href = "javascript:void(0)"
        let iBox = this
        if(this.selectedWord != null && tag == this.selectedWord){
            link.onclick = function(){iBox.selectedWord = null; iBox.draw()}
            link.style.backgroundColor = '#DCDCDC'
        }else{
            link.onclick = function(){iBox.selectedWord = tag; iBox.draw()}
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



InfoBox.prototype.clearBox = function(element){
    while(element.childElementCount > 0){
        element.removeChild(element.firstChild);    
    }
}

InfoBox.prototype.clearAll = function(){
    this.clearBox(this.popWord)
    this.clearBox(this.topNav)
    this.clearBox(this.diagram)
}

InfoBox.prototype.drawTweets = function(word){
    alert("Tweets not implemented")
}

//----------Informationbox-End----------//



//----------Color-Calculation-Begin----------//

function sentimentToColor(sVal){
    var hue = sVal * 120 / 360;
    let sat = 1
    let light = 0.5
    
    var rgb = hslToRgb(hue, sat, light);
    
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l;
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

//----------Color-Calculation-End----------//



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
    
        //let center = gMap.getCenter()
        //let res = await fetch(buildRequest(center.lat(), center.lng(), getRad(), '1331856000.2', '2000000000.2'))
        //let json = await res.json()
        //drawCluster(json)
}

gMapsLoaded.then(async map => {
    iDisplay = new InfoBox()

    window.addEventListener("resize", function(){iDisplay.draw()})
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
        
        let bColor = sentimentToColor(cluster.polarities[mostPopularWord])
        new TextOverlay(pos, mostPopularWord, cluster, bColor)
        
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
                    testdata: 0.5
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
