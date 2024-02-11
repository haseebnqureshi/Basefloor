module.exports = {
	"name": 'api.entreheart.com',
	"models": [
		{
			_name: 'user',
			_auth: { 
				_enabled: true, 
				_verify: { 
					_email: true, 
					_sms: false,
				}, 
				_roles: { 
					_enabled: true,
				},
				_env: {
					getSecret: () => process.env.AUTH_SECRET,
				}
			},
			_label: ['User', 'Users'],
			_collection: 'user',
			_values: {
				_id: 							['ObjectId', 'r,u,d'],
				email: 						['String', 'c,u'],
				email_verified: 	['Boolean', 'c,u'],
				sms: 							['String', 'c,u'],
				sms_verified: 		['Boolean', 'c,u'],
				password_hash: 		['String', 'c,u'],
				first_name: 			['String', 'c,u'],
				last_name: 				['String', 'c,u'],
				display_name: 		['String', 'c,u'],
				university: 			['String', 'c,u'],
				department: 			['String', 'c,u'],
				role: 						['String', 'c,u'],
			},
		},
		{	
			_name: 'course',
			_label: ['Course', 'Courses'],
			_collection: 'course',
			_values: {
				_id: 						['ObjectId', 'r,u,d'],
				name: 					['String', 'c,u'],
				active: 				['String', 'c,u'],
				professor_id: 	['ObjectId', 'c'],
				student_ids: 		['Array(ObjectId)', 'c,u']
			},
		},
		{
			_name: 'assignment',
			_label: ['Assignment', 'Assignments'],
			_collection: 'assignment',
			_values: {
				_id: 				['ObjectId', 'r,u,d'],
				name: 			['String', 'c,u'],
				type: 			['String', 'c,u'],
				details: 		['String', 'c,u'],
				points: 		['Number', 'c,u'],
				rubric: 		['Object', 'c,u'],
				lateness: 	['Object', 'c,u'],
				data: 			['Object', 'c,u'],
				class_id: 	['ObjectId', 'c'],
				due_at: 		['Date', 'c,u'],
				open_at: 		['Date', 'c,u'],
				close_at: 	['Date', 'c,u'],
			},
		},
		{
			_name: 'submission',
			_label: ['Submission', 'Submissions'],
			_collection: 'submission',
			_values: {
				_id: 									['ObjectId', 'r,u,d'],
				data: 								['Object', 'c,u'],
				points: 							['Number', 'c,u'],
				raw_points: 					['Number', 'c,u'],
				points_possible: 			['Number', 'c,u'],
				lateness_percentage: 	['Number', 'c,u'],
				lateness_deduction: 	['Number', 'c,u'],
				assignment_id: 				['ObjectId', 'c'],
				author_id: 						['ObjectId', 'c'],
				author_is_group:			['Boolean', 'c'],
				class_id: 						['ObjectId', 'c'],
				submitted_at: 				['Date', 'c,u'],
			},
		},
		{
			_name: 'assessment',
			_label: ['Assessment', 'Assessments'],
			_collection: 'assessment',
			_values: {
				_id: 						['ObjectId', 'r,u,d'],
				data: 					['Object', 'c,u'], 
				submission_id: 	['ObjectId', 'c'],
				class_id: 			['ObjectId', 'c'],
				submitted_at: 	['Date', 'c,u'],
			},
		},
		{
			_name: 'group',
			_label: ['Group', 'Groups'],
			_collection: 'group',
			_values: {
				_id: 					['ObjectId', 'r,u,d'],
				name: 				['String', 'c,u'],
				student_ids: 	['Array(ObjectId)', 'c,u'],
				class_id: 		['ObjectId', 'c'],
				author_id: 		['ObjectId', 'c'],
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
				first_name: 		['String', 'c,u'],
				last_name: 			['String', 'c,u'],
				display_name: 	['String', 'c,u'],
			},
		}
	],
	"routes": () => {
		const where = '_id'
		const professor = { $and: [ {'user.role': { $eq: 'professor' }}, {'user._id': { $eq: 'course.professor_id' }} ]}
		const allProfessors = { 'user.role': { $eq: 'professor' }}
		const allStudents = { 'user.role': { $eq: 'student'}}
		const students = { 'user._id': { $in: 'course.student_ids' }}
		const studentAuthor = (collection) => ({ 'user._id': { $eq: `${collection}.author_id` }})
		const groupAuthor = (collection) => ({ $and: [ {'user._id': { $in: 'group.student_ids' }}, {'group._id': { $eq: `${collection}.author_id` }} ]})
		const group = { 'user._id': { $in: 'group.student_ids' }}

		return [
			{
				_name: "course",
				_path: "courses",
				_parent: null,
				_create: { allow: allProfessors },
				_readAll: { allow: professor },
				_read: { where, allow: { $or: [professor, students] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_name: "assignment",
				_path: "assignments",
				_parent: "course",
				_create: { allow: professor },
				_readAll: { allow: { $or: [professor, students] }},
				_read: { where, allow: { $or: [professor, students] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_name: "submission",
				_path: "submissions",
				_parent: "assignment",
				_create: { allow: students },
				_readAll: { allow: { $or: [professor, studentAuthor('submission'), groupAuthor('submission')] }},
				_read: { where, allow: { $or: [professor, studentAuthor('submission'), groupAuthor('submission')] }},
				_update: { where, allow: studentAuthor('submission') },
				_delete: { where, allow: studentAuthor('submission') },
			},
			{
				_name: "assessment",
				_path: "assessments",
				_parent: "submission",
				_create: { allow: professor },
				_readAll: { allow: professor },
				_read: { where, allow: { $or: [professor, studentAuthor('submission')] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_name: "group",
				_path: "groups",
				_parent: "course",
				_create: { allow: { $or: [professor, students] }},
				_readAll: { allow: { $or: [professor, students] }},
				_read: { where, allow: { $or: [professor, students] }},
				_update: { where, allow: { $or: [professor, group] }},
				_delete: { where, allow: { $or: [professor, group] }},
			},
			{
				_name: "student",
				_path: "students",
				_parent: null,
				_readAll: { where: ['_id', 'first_name', 'last_name', 'email'], allow: professor },
				_read: { where, allow: professor },
			},
			{
				_name: "student",
				_path: "students",
				_parent: "course",
				_readAll: { where: ['_id', 'first_name', 'last_name', 'email'], allow: { $or: [professor, students] }, filter: students },
				_read: { where, allow: { $or: [professor, students] }, filter: students },
			},
		]
	},
	"notifications": {
		_active: {
			"email": 'postmark',
		},
		_providers: {
			"postmark": {
				_env: {
					getToken: () => process.env.POSTMARK_SERVER_API_TOKEN,
				},
			},
		},
	},	
}