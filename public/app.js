
let analysisAPI = 'http://127.0.0.1:5000/analysis/v1.0/search/'
let gMap

function TextOverlay(pos, text) {
    this.pos = pos
    this.text = text
    this.div = null
    this.setMap(gMap)
}
TextOverlay.prototype = new google.maps.OverlayView()
TextOverlay.prototype.onAdd = function() {
    this.div = document.createElement('div')
    this.div.onclick = function() {
        this.style.fontSize = this.style.fontSize ? (parseInt(this.style.fontSize.replace('px', '')) + 4) + 'px' : '16px'
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

function fetchO() {
    return Promise.resolve({
        marks: [
            {
                lat: 53.557047,
                lng: 10.023038,
                text: "TI"
            },
            {
                lat: 53.569014,
                lng: 10.032815,
                text: "DMI"
            }
        ]
    })
}

function buildRequest() {
    return analysisAPI + arguments.join('/')
}

async function update() {
    let center = gMap.getCenter()
    let res = await fetch(buildRequest(center.lat(), center.lng(), 2, '1331856000.2', '2000000000.2'))
    let json = await res.json()
    for (let cluster of json.clusters) {
        let mostPopularWord = ''
        let mostPopularValue = 0
        for (let key in cluster.words) {
            let value = cluster.words[key]
            if (value > mostPopularValue) {
                mostPopularWord = key
                mostPopularValue = value
            }
        }
        new TextOverlay(new google.maps.LatLng(cluster.center[0], cluster.center[1]), popularWord)
    }
}

gMapsLoaded.then(async map => {
    gMap = map
    // map.panTo(new google.maps.LatLng())

    // let res = await fetchO()
    // for (let mark of res.marks) {
    //     let pos = new google.maps.LatLng(mark.lat, mark.lng)
    //     new TextOverlay(map, pos, mark.text)
    //     // new google.maps.Marker({
    //     //     position: pos,
    //     //     map: map,
    //     //     title: 'test'
    //     // })
    // }
    update()
    gMap.addListener('center_changed', update)
    gMap.addListener('zoom_changed', update)
    gMap.addListener('resize', update)
})
