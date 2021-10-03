/** @format */

const axios = require('axios')
const util = require('util')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const baseUrl = 'http://localhost:8080'
let endpoint = '/api/dragons/seed-database'
// endpoint = '/api/dragons/remove-from-market'
const startId = 60000
const numberOfDragons = 500
const maxId = 100000

function addToMarket(id) {
    console.log('current id', id)
    axios
        .post(`${baseUrl}${endpoint}`, {
            startId: id,
            numberOfDragons,
        })
        .then((res) => {
            console.log('RESULT')
            console.log(
                util.inspect(res.data, false, null, true /* enable colors */)
            )
            const newId = id + numberOfDragons
            if (newId < maxId) {
                addToMarket(newId)
            }
        })
        .catch((err) => {
            console.log('ERROR')
            console.error(err)
        })
}

addToMarket(startId)
