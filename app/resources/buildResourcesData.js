const path = require('path');
const {
  readFile,
  readdir,
  writeFile
} = require('fs-extra');

const parseXMLString = require('xml2js').parseString;


const localesFolder = path.resolve(__dirname + '/locales');
const stylesFolder = path.resolve(__dirname + '/styles');
const localesRep = require(localesFolder + '/locales.json');


const getCitationLocales = () => {
  return new Promise((resolve, reject) => {
    return readdir(localesFolder)
            .then(filesList => {
              const locales = [];
              return filesList
                .filter(file => file.split('.').pop() === 'xml')
                .reduce((curr, fileName) => {
                return curr.then(() => {
                  return new Promise((resolve, reject) => {
                    const filePath = `${localesFolder}/${fileName}`;
                    readFile(filePath, 'utf8')
                      .then(cslStr => {
                        parseXMLString(cslStr, (xmlErr, xml) => {
                          if (xmlErr) {
                            reject(xmlErr);
                          } else {
                            const id = xml['locale']['$']['xml:lang'];
                            const names = localesRep['language-names'][id];
                            locales.push({
                              id,
                              names,
                              fileName,
                              data: cslStr,
                              xmlJs: xml,
                            });
                            resolve();
                          }
                        });
                      })
                      .catch(reject)
                  })
                });
              }, Promise.resolve())
              .then(() => resolve(locales))
              .catch(reject)
            });
  });
}

const getCitationStyles = () => {
  return new Promise((resolve, reject) => {
    return readdir(stylesFolder)
            .then(filesList => {
              const styles = [];
              return filesList
                .filter(file => file.split('.').pop() === 'csl')
                .reduce((curr, fileName) => {
                return curr.then(() => {
                  return new Promise((resolve, reject) => {
                    const filePath = `${stylesFolder}/${fileName}`;
                    readFile(filePath, 'utf8')
                      .then(cslStr => {
                        parseXMLString(cslStr, (xmlErr, xml) => {
                          if (xmlErr) {
                            reject(xmlErr);
                          } else {
                            const metadata = xml.style.info[0];
                            const title = metadata.title[0];
                            const idUrl = metadata.id[0];
                            const id = fileName.split('.').slice(0, fileName.split('.').length - 1).join('.');
                            styles.push({
                              title,
                              idUrl,
                              id,
                              fileName,
                              data: cslStr,
                              xmlJs: xml
                            });
                            resolve();
                          }
                        });
                      })
                      .catch(reject)
                  })
                });
              }, Promise.resolve())
              .then(() => resolve(styles))
              .catch(reject)
            });
  });
}

const buildCitationLocales = () => 
  getCitationLocales()
    .then(locales => {
      return new Promise((resolve, reject) => {
        const map = locales.reduce((res, locale) => Object.assign(res, {
          [locale.id]: locale
        }), {});

        const list = locales.map(({id, names, fileName}) => {
          return {
            id, names, fileName
          }
        });

        writeFile(path.join(__dirname, 'citation-locales-list.json'), JSON.stringify(list), 'utf8')
          .then(() => writeFile(path.join(__dirname, 'citation-locales-map.json'), JSON.stringify(map), 'utf8'))
          .then(resolve)
          .catch(reject)

      })
  })


const buildCitationStyles = () => 
  getCitationStyles()
    .then(styles => {
      return new Promise((resolve, reject) => {
        const map = styles.reduce((res, style) => Object.assign(res, {
          [style.id]: style
        }), {});

        const list = styles.map(({title, idUrl, id, fileName}) => {
          return {
           title, idUrl, id, fileName
          }
        });

        writeFile(path.join(__dirname, 'citation-styles-list.json'), JSON.stringify(list), 'utf8')
          .then(() => writeFile(path.join(__dirname, 'citation-styles-map.json'), JSON.stringify(map), 'utf8'))
          .then(resolve)
          .catch(reject)

      })
  })


buildCitationStyles()
  .then(() => buildCitationLocales())
  .then(() => console.log('done'))
  .catch(e => console.log('error', e))
    
