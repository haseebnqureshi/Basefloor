
module.exports = ({ API, paths, project }) => {

  const loadFileById = async (req, res, next) => {
    try {
      //pulling our file from db
      const user_id = req.user._id
      const { _id } = req.params
      const where = { _id, user_id }
      const file = await API.DB.Files.read({ where })
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

  module.exports = {
    loadFileById,
    loadFilesByParentId,
    increaseRequestTimeout,
  }

}