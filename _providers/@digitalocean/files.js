
const fs = require('fs');
const { PutObjectCommand, S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

module.exports = ({ providerVars }) => {

	async function streamToBuffer(stream) {
		const chunks = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		return Buffer.concat(chunks);
	}

	const client = new S3Client({
		accessKeyId: providerVars.access,
		secretAccessKey: providerVars.secret,
		endpoint: providerVars.endpoint,
		region: providerVars.region,
	});

	const downloadFile = async ({ key, localPath }) => {
		const response = await client.send(new GetObjectCommand({
			Bucket: providerVars.bucket,
			Key: key
		}));
		const buffer = await streamToBuffer(response.Body);
		fs.writeFileSync(localPath, buffer);
		return localPath;
	};

	const uploadFile = async ({ key, filepath, contentType }) => {
		await client.send(new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: fs.readFileSync(filepath),
			ContentType: contentType,
			ACL: 'public-read'
		}));
		return `${providerVars.cdn}/${key}`;
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
		client,
		presign,
		downloadFile,
		uploadFile,
	}
};