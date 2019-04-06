const fs = require('fs-extra');
const version = require('./package.json').version;

const targets = [
    'app/index.html',
    'app/electronIndex.html',
    'app/electronIndex.dev.html',
]

targets.reduce((cur, target) => {
    return cur.then(() => new Promise((resolve, reject) => {
        console.log('updating app version in ', target);
        return fs.readFile(target, 'utf8')
            .then(htmlInput => {
                const htmlOutput = htmlInput.replace(/window\.__OVIDE_VERSION__ = '([^']*)';/gi, `window.__OVIDE_VERSION__ = '${version}';`);
                return fs.writeFile(target, htmlOutput, 'utf8');
            })
            .then(resolve)
            .catch(reject)
    }))
}, Promise.resolve())
.then(() => console.log('done updating app version'))