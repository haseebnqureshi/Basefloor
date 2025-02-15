
const os = require('os')
const path = require('path')
const fs = require('fs')

const TMP_DIR = os.tmpdir()

module.exports = ({ API, paths, project }) => {

  const { Sharp, Libreoffice, Remote } = API.Files

  const IMAGE_MAX_SIZE = Sharp.MAX_FILE_SIZE

  const FILE_CONVERTERS = [
    {
      to: ".pdf",
      compatible: (inType) => Libreoffice.SUPPORTED_FORMATS[inType] ? true : false,
      convert: async (inPath, outPath) => await Libreoffice.convertToPdf({ inputPath: inPath }),
      out: ({ response, inPath, outPath }) => ({ outPaths: [outPath] }) //have to return at least outPaths (plural)
    },
    {
      to: ".png",
      compatible: (inType) => inType === ".pdf" ? true : false,
      convert: async (inPath, outPath) => await Sharp.convertPdfToImages({
        outputDir: outPath,
        pdfPath: inPath,
      }),
      out: ({ response, inPath, outPath }) => ({ outPaths: response.images }) //have to return at least outPaths (plural)
    },
    {
      to: ".png",
      compatible: (inType) => inType !== ".pdf" && Sharp.SUPPORTED_FORMATS[inType] ? true : false,
      convert: async (inPath, outPath) => await Sharp.optimizeImage({
        inputPath: inPath,
        outputPath: outPath,
        maxSize: IMAGE_MAX_SIZE,
      }),
      out: ({ response, inPath, outPath }) => ({ outPaths: [outPath], info: response }) //have to return at least outPaths (plural)
    },
  ]

  // common MIME types mapping (with dots)
  const MIME_TYPES = {
    // Images
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    
    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    
    // Text
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.csv': 'text/csv',
    
    // Audio
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    
    // Video
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    
    // Applications
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.zip': 'application/zip',
    
    // MS Office
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }

  const getTempFilepath = name => path.join(TMP_DIR, `${new Date().toISOString()}-${name}`)

  const getFileSize = (filepath) => {
    const stats = fs.statSync(filepath)
    return stats.size
  }

  const getFileExtension = (filepath) => path.extname(filepath).toLowerCase()

  const getFileContentType = (filepath) => {
    const extension = getFileExtension(filepath)
    
    // return the MIME type if found, or a default binary type if not recognized
    return MIME_TYPES[extension] || 'application/octet-stream'
  }

  const getTypesByCategory = (category) => {
    category = category.toLowerCase()
    let types = {}
    for (let ext in MIME_TYPES) {
      const type = MIME_TYPES[ext]
      if (type.match(category)) {
        types[ext] = type
      }
    }
    return types
  }

  const autoDetectConvertTo = ({ extension, filepath }) => {
    extension = filepath ? getFileExtension(filepath) : extension
    for (let converter of FILE_CONVERTERS) {
      if (converter.compatible(extension)) {
        return converter.to
      }
    }
  }

  const createFileValues = ({ prefix, user_id, name, extension, size, content_type, file_modified_at, provider, bucket }) => {

    /*
    still not ideal, as same files may have different names, and so we're still 
    storing duplicates. may need client to send hash of file contents, because 
    it's the client's duty to pipeline the body of the file to end cdn.
    */
    const hash = API.Utils.hashObject({ 
      user_id: user_id.toString(), //ensure user_id is a string and not a mongo ObjectId (can use user_id.toString())
      name, 
      size, 
      content_type 
    }, { algorithm: 'md5' })

    extension = extension || getFileExtension(name)
    const filename = `${hash}${extension}`
    const url = Remote.CDN_URL + `/${filename}`
    const key = prefix ? `${prefix}/${filename}` : filename

    const values = {
      hash,
      filename,
      extension,
      user_id,
      name,
      size,
      content_type,
      file_modified_at,
      key,
      url,
      provider: provider || Remote.NAME,
      bucket: bucket || Remote.ENV.bucket,
    }

    API.Log('createFileValues values', values)
    return values
  }

  const createManyFileValues = ({ filepaths, parentName, parentId, user_id }) => {

    //iterate through images and load up values into an array
    const parentBasename = parentName.replace(/\.[a-z0-9]+/, '')
    const total = filepaths.length
    let bulk = []

    for (let i in filepaths) {
      const filepath = filepaths[i]
      const extension = getFileExtension(filepath)
      const content_type = getFileContentType(filepath)
      const number = parseInt(i)+1
      const name = `${parentBasename} (${String(number)} of ${String(total)})`
      bulk[i] = {
        ...createFileValues({ 
          user_id,
          name,
          extension,
          size: getFileSize(filepath),
          content_type,
          file_modified_at: new Date().toISOString(),
        }),
        filepath,
        parent_file: parentId,
      }
    }
    return bulk
  }

  const downloadFile = async ({ key }) => {

    //downloading our pdf to local storage
    const filepath = getTempFilepath(key)
    await Remote.downloadFile({
      Key: key,
      localPath: filepath,
    })
    return filepath
  }

  const convertFile = async ({ inType, outType, inPath, outPath }) => {

    //finds the first converter that accepts the "to" and is compatible with "extension"
    for (let converter of FILE_CONVERTERS) {
      if (converter.to === outType && converter.compatible(inType)) {

        //converting the filepath
        const response = await converter.convert(inPath, outPath)

        //logging and returning response (sometimes is the outPath)
        API.Log('convertFile response', response)

        //now wrapping this into a standardized return object
        return converter.out({ response, inPath, outPath })
      }
    }
  }

  const uploadFile = async (fileValues, fileStream) => {

    //uploading our file
    const { key, filepath, size } = fileValues
    const contentType = fileValues.contentType || fileValues.content_type
    const upload = Remote.uploadFile({
      Key: key,
      ContentType: contentType,
      Body: fileStream || fs.createReadStream(filepath),
    })

    const logProgress = progress => {
      const percent = Math.round(10000 * progress.loaded / size) / 100
      API.Log(`  - uploaded ${percent}% of part ${progress.part} (Key:${progress.Key} Bucket:${progress.Bucket})`)
    }

    upload.on('httpUploadProgress', progress => logProgress(progress))

    try {
      const result = await upload.done()

      //we update our fileValues (such as uploaded_at)
      API.Log(`- finished uploading!`)
      fileValues = {
        ...fileValues,
        uploaded_at: new Date().toISOString(),
        provider: Remote.NAME,
        bucket: Remote.ENV.bucket,
      }
      delete fileValues.filepath
      return fileValues
    }
    catch (err) {
      API.Log('uploadFile err', err)
      throw err
    }
    
  }

  const uploadFiles = (filesValues) => {
    return new Promise(async (resolve, reject) => {
      for (let i in filesValues) {
        filesValues[i] = await uploadFile(filesValues[i])
      }
      resolve(filesValues)
    })
  }

  return {
    IMAGE_MAX_SIZE,
    TMP_DIR,
    FILE_CONVERTERS,
    MIME_TYPES,
    getTempFilepath,
    getFileExtension,
    getFileContentType,
    getTypesByCategory,
    autoDetectConvertTo,
    getFileSize,
    createFileValues,
    createManyFileValues,
    downloadFile,
    convertFile,
    uploadFile,
    uploadFiles,
  }

}
