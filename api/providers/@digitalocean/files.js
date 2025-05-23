const fs = require('fs');
const { PutObjectCommand, S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

module.exports = ({ providerVars, providerName }) => {

  const CDN_URL = providerVars.cdn
  const NAME = providerName
  const ENV = providerVars

	const client = new S3Client({
    endpoint: `https://${providerVars.region}.digitaloceanspaces.com`, // DigitalOcean Spaces endpoint
    region: providerVars.region,
    credentials: {
			accessKeyId: providerVars.access,
			secretAccessKey: providerVars.secret,
    },
  });

	async function streamToBuffer(stream) {
		const chunks = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		return Buffer.concat(chunks);
	}

	const downloadFile = async ({ Bucket, Key, localPath }) => {
		const response = await client.send(new GetObjectCommand({
			Key,
			Bucket: Bucket || providerVars.bucket,
		}));
		const buffer = await streamToBuffer(response.Body);
		fs.writeFileSync(localPath, buffer);
	};

	const getFileStream = async ({ Bucket, Key }) => {
		return await client.send(new GetObjectCommand({
			Key,
			Bucket: Bucket || providerVars.bucket,
		}));	
	}

	const uploadFile = ({ Bucket, Key, Body /* can be stream */, ContentType, ACL }) => {
	  return new Upload({
	  	client,
	  	params: {
	  		Key,
	  		Body,
	  		ContentType,
	  		Bucket: Bucket || providerVars.bucket,
	  		ACL: ACL || 'public-read',
	  	}
	  })
	};

	return {
		NAME,
		ENV,
		CDN_URL,
		client,
		downloadFile,
		getFileStream,
		uploadFile,
	}
};