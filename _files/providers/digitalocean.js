
const _ = require('underscore') 

const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

module.exports = ({ config }) => {

	const { _env } = config

	let output = {}

	const client = output.client = new S3Client({
		accessKeyId: _env.getAccess(),
		secretAccessKey: _env.getSecret(),
		// signatureVersion: 'v4',
		endpoint: _env.getEndpoint(),
		region: _env.getRegion(),
	})

	output.putObjectCommand = ({ Key, ContentType, Bucket, ACL }) => {
		return new PutObjectCommand({
			Bucket: Bucket || _env.getBucket(),
			Key,
			ContentType,
			ACL: ACL || 'public-read',
		})
	}

	output.getObjectCommand = ({ }) => {

		
	}

	output.presign = async (command) => {
		try {
			return await getSignedUrl(client, command, { 
				expiresIn: 3600 
			})
		}
		catch (err) {
			console.log(err)
			return err
		}
	}

	return output
	
}



// const S3 = require('aws-sdk/clients/s3')

// module.exports = ({ config }) => {

// 	const { _env } = config

// 	let output = {}

// 	const client = output.client = new S3({
// 		accessKeyId: _env.getAccess(),
// 		secretAccessKey: _env.getSecret(),
// 		signatureVersion: 'v4',
// 		endpoint: _env.getEndpoint(),
// 		region: _env.getRegion(),
// 	})

// 	output.getPresignedUrl = async ({ Key, ContentType, Bucket, ACL }) => {
// 		try {
// 			const res = await client.getSignedUrl('putObject', {
// 				Bucket: Bucket || _env.getBucket(),
// 				Key,
// 				ContentType,
// 				ACL: ACL || 'public-read',
// 			})
// 			console.log('getPresignedUrl', { res })
// 			return res
// 		}
// 		catch (err) {
// 			console.log(err)
// 			return err
// 		}
// 	}

// 	return output
	
// }