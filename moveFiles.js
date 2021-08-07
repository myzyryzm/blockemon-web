/** @format */

const path = require('path')
const fs = require('fs')
const files = ['wallet-account.js', 'account.js']
const customFolder = path.join(__dirname, 'backend', 'custom')
const targetFolder = path.join(
    __dirname,
    'backend',
    'node_modules',
    'near-api-js',
    'lib'
)

files.forEach((file) => {
    const oldPath = path.join(customFolder, file)
    const newPath = path.join(targetFolder, file)
    fs.copyFile(oldPath, newPath, function (err) {
        if (err) throw err
        console.log('Successfully renamed - AKA moved!')
    })
})
