
function fetch() {
    return Promise.resolve({
        marks: [
            {
                lat: 53.557047,
                lng: 10.023038
            }
        ]
    })
}

gMapsLoaded.then(async map => {
    let res = await fetch()
    for (let mark of res.marks) {
        new google.maps.Marker({
            position: mark,
            map: map
        })
    }
})
