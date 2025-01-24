const fs = require('fs');
const { PutObjectCommand, S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

module.exports = ({ providerVars }) => {

  const CDN_URL = providerVars.cdn

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

	// const presign = async (command) => {
	// 	try {
	// 		return await getSignedUrl(client, command, { expiresIn: 3600 });
	// 	} catch (err) {
	// 		console.error(err);
	// 		return err;
	// 	}
	// };

	return {
		CDN_URL,
		client,
		// presign,
		downloadFile,
		uploadFile,
	}
};