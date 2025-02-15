
const Busboy = require('busboy')

module.exports = (API, { paths, project }) => {

  const loadFileById = async (req, res, next) => {
    try {
      //pulling our file from db
      const user_id = req.user._id
      const { _id } = req.params
      const where = { _id, user_id }
      const file = await API.DB.Files.read({ where })
      API.Log('loadFileById', { where, file })
      if (!file) { throw 404 }
      req.file = file
      next()
    }
    catch (err) {
      API.Utils.errorHandler({ res, err })
    }
  }

  const loadFilesByParentId = async (req, res, next) => {
    try {
      const user_id = req.user._id
      const { _id } = req.params
      const where = { 
        user_id: new API.DB.mongodb.ObjectId(user_id),
        parent_file: new API.DB.mongodb.ObjectId(_id),
      }
      const files = await API.DB.Files.readAll({ where })
      if (!files) { throw 404 }

      req.files = files
      next()
    }
    catch (err) {
      API.Utils.errorHandler({ res, err })
    }
  }

  const increaseRequestTimeout = async (req, res, next) => {
    /*
      Increase timeout for request to ensure upload has time to occur
      - need to implement resumable uploads
      - if we make it to this point, we've reduced the risk of duplicates and now we attempt to upload
    */
    const minutes = 10
    API.Log('- setting request timeout to this many minutes: ', minutes)
    req.socket.setTimeout(minutes * 60 * 1000) // 10 minutes for uploading (need to implement resumable uploads)
    next()
  }

  const handleUpload = async (req, res, next) => {
    const handler = new Promise((resolve, reject) => {
      if (!req.file) { 
        return reject(new Error('no req.file!'))
      }

      const busboy = Busboy({ 
        headers: req.headers,
        limits: {
          fileSize: parseInt(req.file.size)
        }
      })

      busboy.on('file', async (fieldName, fileStream, file) => {
        try {

          //upload our file
          req.file = await API.Files.uploadFile(req.file, fileStream)
          if (!req.file) { throw new Error('- failed to upload req.file...') }

          //and then update/upsert values into db
          const _id = req.file._id || null
          const updateResponse = await API.DB.Files.update({
            where: { _id },
            values: req.file,
            options: { upsert: true },
          })

          //if we had an upsert, persist the new _id
          if (updateResponse.upsertedId) {
            req.file._id = updateResponse.upsertedId
          }

          //read the full file
          req.file = await API.DB.Files.read({
            where: { _id: req.file._id }
          })

          resolve()
        }
        catch (err) {
          console.error('handleUpload err inside try/catch', err)
          reject(err)
          return
        }
      })

      // busboy.on('finish', () => resolve({ }))

      // busboy.on('error', err => reject({ err }))

      req.pipe(busboy)
    })

    try {
      await handler
      console.log('handleUpload req.file', req.file)
      next()
    }
    catch (err) {
      console.error('err', err)
      return API.Utils.errorHandler({ res, err })
    }
  }

  API.Files = {
    ...API.Files,
    loadFileById,
    loadFilesByParentId,
    increaseRequestTimeout,
    handleUpload,
  }

  return API

}