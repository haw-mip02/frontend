
function TextOverlay(map, pos, text) {
    this.pos = pos
    this.text = text
    this.div = null
    this.setMap(map)
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

function fetch() {
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

gMapsLoaded.then(async map => {
    let res = await fetch()
    for (let mark of res.marks) {
        let pos = new google.maps.LatLng(mark.lat, mark.lng)
        new TextOverlay(map, pos, mark.text)
        // new google.maps.Marker({
        //     position: pos,
        //     map: map,
        //     title: 'test'
        // })
    }
})
