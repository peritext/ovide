const peritextConfig = require('./app/src/peritextConfig.render');
const buildBundler = require('./services/htmlBuildBundler');


const buildBundle = ({templateId, generatorId}) => {
  return new Promise((resolve) => {
    console.log('build bundle', templateId);
    return buildBundler({
      templateId,
      generatorId,
    })
  })
}

/**
 * Resolve based on config
 */
if (peritextConfig.htmlBuilds) {
  Object.keys(peritextConfig.htmlBuilds)
    .reduce((cur, generatorId) => {
      return cur.then(() => {
        return new Promise((resolve, reject) => {
          const templates = peritextConfig.htmlBuilds[generatorId];
          Object.keys(templates)
            .reduce((cur2, templateId) => {
                return cur2.then(() => 
                  buildBundle({templateId, generatorId})
                )
            }, Promise.resolve())
            .then(resolve)
            .catch(reject)
        })
      })
    }, Promise.resolve())
}