const fs = require('fs');
const Minio = require('minio');
const stream = require('stream');
const { promisify } = require('util');

module.exports = ({ providerVars, providerName }) => {

  const NAME = providerName;
  const ENV = providerVars;
  const CDN_URL = providerVars.cdn || `http://${providerVars.endPoint}:${providerVars.port}/${providerVars.bucket}`;

  // Create a MinIO client instance
  const client = new Minio.Client({
    endPoint: providerVars.endPoint || 'localhost',
    port: providerVars.port || 9000,
    useSSL: providerVars.useSSL || false,
    accessKey: providerVars.access,
    secretKey: providerVars.secret,
  });

  // Helper for streaming into a buffer
  async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  // Download a file from MinIO to local storage
  const downloadFile = async ({ Bucket, Key, localPath }) => {
    const bucket = Bucket || providerVars.bucket;
    
    return new Promise((resolve, reject) => {
      client.getObject(bucket, Key, (err, dataStream) => {
        if (err) {
          return reject(err);
        }
        
        const fileStream = fs.createWriteStream(localPath);
        dataStream.pipe(fileStream);
        
        fileStream.on('error', reject);
        fileStream.on('finish', () => resolve(localPath));
      });
    });
  };

  // Get a readable stream for a file
  const getFileStream = async ({ Bucket, Key }) => {
    const bucket = Bucket || providerVars.bucket;
    
    return new Promise((resolve, reject) => {
      client.getObject(bucket, Key, (err, dataStream) => {
        if (err) {
          return reject(err);
        }
        resolve(dataStream);
      });
    });
  };

  // Upload a file to MinIO (compatible with the S3 Upload interface)
  const uploadFile = ({ Bucket, Key, Body, ContentType, ACL }) => {
    const bucket = Bucket || providerVars.bucket;
    
    // Create a custom upload class that mimics AWS S3 Upload
    class MinioUpload extends stream.EventEmitter {
      constructor(params) {
        super();
        this.params = params;
        this.bucket = params.Bucket;
        this.key = params.Key;
      }
      
      async done() {
        return new Promise((resolve, reject) => {
          const metaData = {
            'Content-Type': this.params.ContentType || 'application/octet-stream',
          };
          
          if (this.params.Body instanceof stream.Readable) {
            // Handle stream upload
            client.putObject(
              this.bucket,
              this.key,
              this.params.Body,
              null,
              metaData,
              (err, etag) => {
                if (err) {
                  return reject(err);
                }
                
                this.emit('httpUploadProgress', {
                  loaded: 100,
                  total: 100,
                  part: 1,
                  Key: this.key,
                  Bucket: this.bucket
                });
                
                resolve({ 
                  ETag: etag,
                  Key: this.key,
                  Bucket: this.bucket
                });
              }
            );
          } else {
            // Handle buffer or string upload
            const buffer = this.params.Body instanceof Buffer 
              ? this.params.Body 
              : Buffer.from(this.params.Body);
            
            client.putObject(
              this.bucket,
              this.key,
              buffer,
              buffer.length,
              metaData,
              (err, etag) => {
                if (err) {
                  return reject(err);
                }
                
                this.emit('httpUploadProgress', {
                  loaded: buffer.length,
                  total: buffer.length,
                  part: 1,
                  Key: this.key,
                  Bucket: this.bucket
                });
                
                resolve({
                  ETag: etag,
                  Key: this.key,
                  Bucket: this.bucket
                });
              }
            );
          }
        });
      }
    }
    
    // Return an instance of our custom upload class
    return new MinioUpload({
      Bucket: bucket,
      Key,
      Body,
      ContentType
    });
  };

  // Initialize bucket if it doesn't exist
  const initBucket = async () => {
    const bucketExists = await client.bucketExists(providerVars.bucket);
    if (!bucketExists) {
      await client.makeBucket(providerVars.bucket, providerVars.region || 'us-east-1');
      
      // Set bucket policy to public if ACL is public-read by default
      if (providerVars.defaultAcl === 'public-read') {
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${providerVars.bucket}/*`],
            },
          ],
        };
        await client.setBucketPolicy(providerVars.bucket, JSON.stringify(policy));
      }
    }
  };

  // Initialize the bucket on provider startup
  initBucket().catch(err => {
    console.error('Failed to initialize MinIO bucket:', err);
  });

  return {
    NAME,
    ENV,
    CDN_URL,
    client,
    downloadFile,
    getFileStream,
    uploadFile,
  };
}; 