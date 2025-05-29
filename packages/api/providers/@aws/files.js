const fs = require('fs');
const { PutObjectCommand, S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

module.exports = ({ providerVars, providerName }) => {

  const CDN_URL = providerVars.cdn || `https://${providerVars.bucket}.s3.${providerVars.region}.amazonaws.com`
  const NAME = providerName
  const ENV = providerVars

	const client = new S3Client({
    region: providerVars.region || 'us-east-1',
    credentials: {
			accessKeyId: providerVars.accessKeyId,
			secretAccessKey: providerVars.secretAccessKey,
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

	const deleteFile = async ({ Bucket, Key }) => {
		return await client.send(new DeleteObjectCommand({
			Key,
			Bucket: Bucket || providerVars.bucket,
		}));
	};

	const getSignedDownloadUrl = async ({ Bucket, Key, expiresIn = 3600 }) => {
		const command = new GetObjectCommand({
			Key,
			Bucket: Bucket || providerVars.bucket,
		});
		return await getSignedUrl(client, command, { expiresIn });
	};

	const getSignedUploadUrl = async ({ Bucket, Key, ContentType, expiresIn = 3600 }) => {
		const command = new PutObjectCommand({
			Key,
			Bucket: Bucket || providerVars.bucket,
			ContentType,
		});
		return await getSignedUrl(client, command, { expiresIn });
	};

	return {
		NAME,
		ENV,
		CDN_URL,
		client,
		downloadFile,
		getFileStream,
		uploadFile,
		deleteFile,
		getSignedDownloadUrl,
		getSignedUploadUrl,
	}
}; 