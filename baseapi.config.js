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
			_auth: { 
			},
			_label: ['User', 'Users'],
			_collection: 'user',
			_values: {
				_id: 							['ObjectId', 'r,u,d'], /* for r, u, d, simply for where -- what about safe views, data returns? */
				email: 						['String', 'c,u', ['email']],
				email_verified: 	['Boolean', 'c,u'],
				sms: 							['String', 'c,u', ['email']],
				sms_verified: 		['Boolean', 'c,u'],
				password_hash: 		['String', 'c,u', ['_default', 'test']],
				first_name: 			['String', 'c,u', ['first']],
				last_name: 				['String', 'c,u', ['last']],
				display_name: 		['String', 'c,u', ['name']],
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
				name: 					['String', 'c,u', ['sentence', { words: 3 }]],
				active: 				['Boolean', 'c,u'],
				professor_id: 	['ObjectId', 'c'],
				student_ids: 		['Array(ObjectId)', 'c,u'],
			},
		},
		{
			_name: 'assignment',
			_label: ['Assignment', 'Assignments'],
			_collection: 'assignment',
			_values: {
				_id: 				['ObjectId', 'r,u,d'],
				name: 			['String', 'c,u', ['sentence', { words: 4 }]],
				type: 			['String', 'c,u'],
				details: 		['String', 'c,u', ['paragraph']],
				points: 		['Number', 'c,u'],
				rubric: 		['Object', 'c,u'],
				lateness: 	['Object', 'c,u'],
				data: 			['Object', 'c,u'],
				course_id: 	['ObjectId', 'c'],
				due_at: 		['Date', 'c,u', ['date']],
				open_at: 		['Date', 'c,u', ['date']],
				close_at: 	['Date', 'c,u', ['date']],
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
				course_id: 						['ObjectId', 'c'],
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
				course_id: 			['ObjectId', 'c'],
				submitted_at: 	['Date', 'c,u', ['date']],
			},
		},
		{
			_name: 'group',
			_label: ['Group', 'Groups'],
			_collection: 'group',
			_values: {
				_id: 					['ObjectId', 'r,u,d'],
				name: 				['String', 'c,u', ['sentence', { words: 2 }]],
				student_ids: 	['Array(ObjectId)', 'c,u'],
				course_id: 		['ObjectId', 'c'],
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
				first_name: 		['String', 'c,u', ['first']],
				last_name: 			['String', 'c,u', ['last']],
				display_name: 	['String', 'c,u', ['name']],
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
				_id: "/courses(course)",
				_create: { allow: allProfessors },
				_readAll: { allow: professor },
				_read: { where, allow: { $or: [professor, students] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_id: "courses/assignments(assignment)",
				_create: { allow: professor },
				_readAll: { allow: { $or: [professor, students] }},
				_read: { where, allow: { $or: [professor, students] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_id: "assignments/submissions(submission)",
				_create: { allow: students },
				_readAll: { allow: { $or: [professor, studentAuthor('submission'), groupAuthor('submission')] }},
				_read: { where, allow: { $or: [professor, studentAuthor('submission'), groupAuthor('submission')] }},
				_update: { where, allow: studentAuthor('submission') },
				_delete: { where, allow: studentAuthor('submission') },
			},
			{
				_id: "submissions/assessments(assessment)",
				_create: { allow: professor },
				_readAll: { allow: professor },
				_read: { where, allow: { $or: [professor, studentAuthor('submission')] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_id: "courses/groups(group)",
				_create: { allow: { $or: [professor, students] }},
				_readAll: { allow: { $or: [professor, students] }},
				_read: { where, allow: { $or: [professor, students] }},
				_update: { where, allow: { $or: [professor, group] }},
				_delete: { where, allow: { $or: [professor, group] }},
			},
			{
				_id: "/students(student)",
				_readAll: { where: { '_token' : ['_id', 'first_name', 'last_name', 'email']}, allow: professor },
				_read: { where, allow: professor },
			},
			{
				_id: "courses/students(student)",
				_readAll: { where: { '_token' : ['_id', 'first_name', 'last_name', 'email']}, allow: { $or: [professor, students] }, filter: students },
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