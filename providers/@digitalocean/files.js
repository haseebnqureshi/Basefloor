const fs = require('fs');
const { PutObjectCommand, S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

module.exports = ({ providerVars }) => {

  const CDN_URL = providerVars.cdn

	const client = new S3Client({
    endpoint: `https://${providerVars.region}.digitaloceanspaces.com`, // DigitalOcean Spaces endpoint
    region: providerVars.region,
	// 	accessKeyId: providerVars.access,
	// 	secretAccessKey: providerVars.secret,
    credentials: {
      accessKeyId: providerVars.accessKeyId,
      secretAccessKey: providerVars.secretAccessKey
    }
  });

	async function streamToBuffer(stream) {
		const chunks = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		return Buffer.concat(chunks);
	}

	const downloadFile = async ({ key, localPath }) => {
		const response = await client.send(new GetObjectCommand({
			Bucket: providerVars.bucket,
			Key: key
		}));
		const buffer = await streamToBuffer(response.Body);
		fs.writeFileSync(localPath, buffer);
		return localPath;
	};

	const uploadFile = ({ bucket, key, stream, content_type }) => {
		const url = `${providerVars.cdn}/${key}`
	  const upload = new Upload({
	  	client,
	  	params: {
	  		Bucket: bucket || providerVars.bucket,
	  		Key: key,
	  		Body: stream,
	  		ContentType: content_type,
	  	}
	  })
	  return { url, upload }
		// await client.send(new PutObjectCommand({
		// 	Bucket: providerVars.bucket,
		// 	Key: key,
		// 	Body: stream,
		// 	ContentType: contentType,
		// 	ACL: 'public-read'
		// }));
		// return `${providerVars.cdn}/${key}`;
	};

	const presign = async (command) => {
		try {
			return await getSignedUrl(client, command, { expiresIn: 3600 });
		} catch (err) {
			console.error(err);
			return err;
		}
	};

	return {
		CDN_URL,
		client,
		presign,
		downloadFile,
		uploadFile,
	}
};