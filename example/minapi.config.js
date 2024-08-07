module.exports = {
	"name": 'api.entreheart.com',
	"auth": {
		_verify: { 
			_email: true, 
			_sms: false,
		}, 
		_env: {
			getSecret: () => process.env.AUTH_SECRET,
		},
	},
	"models": [
		{
			_name: 'user',
			_label: ['User', 'Users'],
			_collection: 'user',
			_values: {
				_id: 							['ObjectId', 'r,u,d'], /* for r, u, d, simply for where -- what about safe views, data returns? */
				email: 						['String', 'c,r,u', ['email']],
				email_verified: 	['Boolean', 'c,r,u'],
				sms: 							['String', 'c,r,u', ['email']],
				sms_verified: 		['Boolean', 'c,r,u'],
				password_hash: 		['String', 'c,r,u', ['_default', 'test']],
				first_name: 			['String', 'c,r,u', ['first']],
				last_name: 				['String', 'c,r,u', ['last']],
				display_name: 		['String', 'c,r,u', ['name']],
				role: 						['String', 'c,r,u'],
			},
		},
		{	
			_name: 'organization',
			_label: ['Organization', 'Organizations'],
			_collection: 'organization',
			_values: {
				_id: 						['ObjectId', 'r,u,d'],
				name: 					['String', 'c,r,u', ['sentence', { words: 3 }]],
				active: 				['Boolean', 'c,r,u'],
				professor_id: 	['ObjectId', 'c,r'],
				student_ids: 		['Array(ObjectId)', 'c,r,u'],
			},
		},
		{
			_name: 'group',
			_label: ['Group', 'Groups'],
			_collection: 'group',
			_values: {
				_id: 					['ObjectId', 'r,u,d'],
				name: 				['String', 'c,r,u', ['sentence', { words: 2 }]],
				student_ids: 	['Array(ObjectId)', 'c,r,u'],
				organization_id: 		['ObjectId', 'c,r'],
				author_id: 		['ObjectId', 'c,r'],
			},
		},
		{
			_name: 'student',
			_label: ['Student', 'Students'],
			_collection: {
				_name: 'user',
				_filter: { role: 'student' },
			},
			_values: {
				_id: 						['ObjectId', 'r,u,d'],
				first_name: 		['String', 'c,r,u', ['first']],
				last_name: 			['String', 'c,r,u', ['last']],
				display_name: 	['String', 'c,r,u', ['name']],
			},
		}
	],
	"routes": () => {
		const where = '_id'

		const professor = {and: [ `@user.role=professor`, `@user._id=@organization.professor_id`]}
		const allProfessors = `@user.role=professor`
		const students = `@user._id=in=@organization.student_ids`
		const studentAuthor = collection => `@user._id=@${collection}.author_id`
		const group = `@user._id=in=@group.student_ids`

		return [
			{
				_id: "/organizations(organization)",
				_create: { allow: allProfessors },
				_readAll: { allow: professor },
				_read: { where, allow: {or: [professor, students] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_id: "organizations/groups(group)",
				_create: { allow: {or: [professor, students] }},
				_readAll: { allow: {or: [professor, students] }},
				_read: { where, allow: {or: [professor, students] }},
				_update: { where, allow: {or: [professor, group] }},
				_delete: { where, allow: {or: [professor, group] }},
			},
			{
				_id: "/students(student)",
				_readAll: { where: { '_token' : ['_id', 'first_name', 'last_name', 'email']}, allow: professor },
				_read: { where, allow: professor },
			},
			{
				_id: "organizations/students(student)",
				_readAll: { where: { '_token' : ['_id', 'first_name', 'last_name', 'email']}, allow: {or: [professor, students] }, filter: students },
				_read: { where, allow: {or: [professor, students] }, filter: students },
			},
		]
	},
	"notifications": {
		_active: {
			"email": 'mailgun',
		},
		_providers: {
			"postmark": {
				_env: {
					getToken: () => process.env.POSTMARK_TOKEN,
					getFrom: () => process.env.POSTMARK_FROM,
				},
			},
			"mailgun": {
				_env: {
					getToken: () => process.env.MAILGUN_TOKEN,
					getDomain: () => process.env.MAILGUN_DOMAIN, //forthlaw.com
					getFrom: () => process.env.MAILGUN_FROM, //Forthlaw PLLC <hello@forthlaw.com>
				}
			}
		},
	},
	"files": {
		_active: {
			"storage": "digitalocean",
		},
		_providers: {
			"digitalocean": {
				_env: {
					getAccess: () => process.env.DIGITALOCEAN_SPACES_ACCESS,
					getSecret: () => process.env.DIGITALOCEAN_SPACES_SECRET,
					getEndpoint: () => process.env.DIGITALOCEAN_SPACES_ENDPOINT,
					getRegion: () => process.env.DIGITALOCEAN_SPACES_REGION,
					getBucket: () => process.env.DIGITALOCEAN_SPACES_BUCKET,
				}
			}
		}
	}
}