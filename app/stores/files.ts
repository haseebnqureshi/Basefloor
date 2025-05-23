//@see https://docs.digitalocean.com/reference/api/spaces-api/
//@see https://docs.digitalocean.com/products/spaces/how-to/use-aws-sdks/
//@see multipart for greater than 5MB, https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_UsingLargeFiles_section.html


import { defineStore } from 'pinia'

export const useFilesStore = defineStore('filesStore', {
	state: () => ({
		fields: [

		],
		keys: {
			identifier: '_id',
			name: 'files',
		},
		labels: {
			singular: 'File',
			plural: 'Files',
		},
		rows: [],
		api: '',
		storage: {
			client: null,
			bucket: null,
			cdn: null,
		},
	}),
	actions: {
		setToken(token) {
			// console.log({ token })
			this.token = token
		},
		init() {
			const config = useRuntimeConfig()
			this.api = config.public.apiUrl + '/v1/doc'
		},

		async create({ file, onProgress }) {

			try {
				//checking to see if our filetype is allowed, can be converted
				const name = file.name
				const matches = name.match(/\.([a-zA-Z0-9]+)$/)
				const extension = matches[1]
				const allowed = await $fetch(this.api + '/convert/' + extension.toLowerCase(), {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${this.token}`
					}
				})
				if (!allowed) { throw undefined }
				if (!allowed.accepted) { throw undefined }
			}
			catch (err) {
				if (err) { return undefined }
			}

			this.init()
			
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest()
				const formData = new FormData()
				formData.append('file', file)

				xhr.upload.addEventListener('progress', (event) => {
					if (event.lengthComputable && onProgress) {
						const percentage = Math.round((event.loaded / event.total) * 1000) / 10
						onProgress({
							loaded: event.loaded,
							total: event.total,
							progress: percentage
						})
					}
				})

				xhr.addEventListener('load', () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve(JSON.parse(xhr.response))
					} else {
						reject(new Error(`Upload failed with status ${xhr.status}`))
					}
				})

				xhr.addEventListener('error', () => {
					reject(new Error('Upload failed'))
				})

				xhr.open('POST', this.api + '/files')
				xhr.setRequestHeader('Authorization', `Bearer ${this.token}`)
				xhr.setRequestHeader('x-basefloor-size', file.size.toString())
				xhr.setRequestHeader('x-basefloor-name', encodeURIComponent(file.name))
				xhr.setRequestHeader('x-basefloor-type', file.type)
				xhr.setRequestHeader('x-basefloor-prefix', '@req_user._id') //setting professor id as prefix for any put object
				xhr.setRequestHeader('x-basefloor-modified', file.lastModified.toString())

				xhr.send(formData)
			})
		},

		async convert({ fileId }) {
			this.init()
			const response = await $fetch(this.api + '/files/' + fileId + '/convert', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`
				}
			})
			console.log({ response })
			return response
		},

		async getFileFiles({ fileId }) {
			this.init()
			return await $fetch(this.api + '/files/' + fileId + '/files', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${this.token}`
				}
			})
		},

		async fetch() {
			this.init()
			const res = await $fetch(this.api + '/files', {
				headers: {
					Authorization: `Bearer ${this.token}`
				}
			})
			this.rows = res.data
		},

		async get({ _id }) {
			this.init()
			const res = await $fetch(this.api + '/files/' + _id, {
				headers: {
					Authorization: `Bearer ${this.token}`
				}
			})
			return res
		},

		async delete({ _id }) {
			this.init()
			const res = await $fetch(this.api + '/files/' + _id, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${this.token}`
				}
			})
			return res
		},

	}
})