const {readdir, copy, lstatSync} = require('fs-extra');

const iconsPath = __dirname + '/assets/icons';

const listFilesRecursive = ({folderPath, filePaths = []}) => {
  return readdir(folderPath)
    .then(files => {
      return files.reduce((cur, file) => 
        cur
        .then(() => {
          const thatPath = `${folderPath}/${file}`;
          const isFolder = lstatSync(thatPath).isDirectory();
          if (isFolder) {
            return listFilesRecursive({folderPath: thatPath, filePaths})
          } else {
            filePaths.push(thatPath);
            return Promise.resolve({filePaths})
          }
        })
      , Promise.resolve())
    })
}

listFilesRecursive({folderPath: iconsPath})
  .then(({filePaths}) => {
    return filePaths.reduce((curr, input) => 
      curr.then(() => {
        const fileName = input.split('/').pop();
        const output = `${iconsPath}/${fileName}`;
        if (input !== output) {
          return copy(input, output)
        } else return Promise.resolve();
      })
      , Promise.resolve())
  })
  .catch(console.error);