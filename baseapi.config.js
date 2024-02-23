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
				university: 			['String', 'c,r,u'],
				department: 			['String', 'c,r,u'],
				role: 						['String', 'c,r,u'],
			},
		},
		{	
			_name: 'course',
			_label: ['Course', 'Courses'],
			_collection: 'course',
			_values: {
				_id: 						['ObjectId', 'r,u,d'],
				name: 					['String', 'c,r,u', ['sentence', { words: 3 }]],
				active: 				['Boolean', 'c,r,u'],
				professor_id: 	['ObjectId', 'c,r'],
				student_ids: 		['Array(ObjectId)', 'c,r,u'],
			},
		},
		{
			_name: 'assignment',
			_label: ['Assignment', 'Assignments'],
			_collection: 'assignment',
			_values: {
				_id: 				['ObjectId', 'r,u,d'],
				name: 			['String', 'c,r,u', ['sentence', { words: 4 }]],
				type: 			['String', 'c,r,u'],
				details: 		['String', 'c,r,u', ['paragraph']],
				points: 		['Number', 'c,r,u'],
				rubric: 		['Object', 'c,r,u'],
				lateness: 	['Object', 'c,r,u'],
				data: 			['Object', 'c,r,u'],
				course_id: 	['ObjectId', 'c,r'],
				due_at: 		['Date', 'c,r,u', ['date']],
				open_at: 		['Date', 'c,r,u', ['date']],
				close_at: 	['Date', 'c,r,u', ['date']],
			},
		},
		{
			_name: 'submission',
			_label: ['Submission', 'Submissions'],
			_collection: 'submission',
			_values: {
				_id: 									['ObjectId', 'r,u,d'],
				data: 								['Object', 'c,r,u'],
				points: 							['Number', 'c,r,u'],
				raw_points: 					['Number', 'c,r,u'],
				points_possible: 			['Number', 'c,r,u'],
				lateness_percentage: 	['Number', 'c,r,u'],
				lateness_deduction: 	['Number', 'c,r,u'],
				assignment_id: 				['ObjectId', 'c,r'],
				author_id: 						['ObjectId', 'c,r'],
				author_is_group:			['Boolean', 'c,r'],
				course_id: 						['ObjectId', 'c,r'],
				submitted_at: 				['Date', 'c,r,u'],
			},
		},
		{
			_name: 'assessment',
			_label: ['Assessment', 'Assessments'],
			_collection: 'assessment',
			_values: {
				_id: 						['ObjectId', 'r,u,d'],
				data: 					['Object', 'c,r,u'], 
				submission_id: 	['ObjectId', 'c,r'],
				course_id: 			['ObjectId', 'c,r'],
				submitted_at: 	['Date', 'c,r,u', ['date']],
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
				course_id: 		['ObjectId', 'c,r'],
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

		const professor = {and: [ `@user.role=professor`, `@user._id=@course.professor_id`]}
		const allProfessors = `@user.role=professor`
		const allStudents = `@user.role=student`
		const students = `@user._id=in=@course.student_ids`
		const studentAuthor = collection => `@user._id=@${collection}.author_id`
		const groupAuthor = collection => {and: [ `@user._id=in=@group.student_ids`, `@group._id=@${collection}.author_id` ]}
		const group = `@user._id=in=@group.student_ids`

		return [
			{
				_id: "/courses(course)",
				_create: { allow: allProfessors },
				_readAll: { allow: professor },
				_read: { where, allow: {or: [professor, students] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_id: "courses/assignments(assignment)",
				_create: { allow: professor },
				_readAll: { allow: { $or: [professor, students] }},
				_read: { where, allow: {or: [professor, students] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_id: "assignments/submissions(submission)",
				_create: { allow: students },
				_readAll: { allow: {or: [professor, studentAuthor('submission'), groupAuthor('submission')] }},
				_read: { where, allow: {or: [professor, studentAuthor('submission'), groupAuthor('submission')] }},
				_update: { where, allow: studentAuthor('submission') },
				_delete: { where, allow: studentAuthor('submission') },
			},
			{
				_id: "submissions/assessments(assessment)",
				_create: { allow: professor },
				_readAll: { allow: professor },
				_read: { where, allow: {or: [professor, studentAuthor('submission')] }},
				_update: { where, allow: professor },
				_delete: { where, allow: professor },
			},
			{
				_id: "courses/groups(group)",
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
				_id: "courses/students(student)",
				_readAll: { where: { '_token' : ['_id', 'first_name', 'last_name', 'email']}, allow: {or: [professor, students] }, filter: students },
				_read: { where, allow: {or: [professor, students] }, filter: students },
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
					getFrom: () => process.env.EMAIL_FROM,
				},
			},
		},
	},	
}