
const path = require('path')

const api = require('./_baseapi')({
	name: 'Entreheart Class',
	envPath: path.resolve(__dirname, '.env'),
	collections: {
		classes: {
			create: [true, ['name', 'active', 'professor_id', 'created_at']],
			readAll: [true],
			read: [true, '_id'],
			update: [true, '_id', ['name', 'active', 'updated_at']],
			delete: [true, '_id'],
		},
		assignments: {
			create: [true, ['name', 'type', 'details', 'points', 'rubric', 'lateness', 'data', 'class_id', 'due_at', 'open_at', 'close_at', 'created_at']],
			readAll: [true],
			read: [true, '_id'],
			update: [true, '_id', ['name', 'type', 'details', 'points', 'rubric', 'lateness', 'data', 'due_at', 'open_at', 'close_at', 'updated_at']],
			delete: [true, '_id'],
		},
		submissions: {
			create: [true, ['data', 'points', 'raw_points', 'points_possible', 'lateness_percentage', 'lateness_deduction', 'assignment_id', 'student_id', 'group_id', 'class_id', 'submitted_at', 'created_at']],
			readAll: [true],
			read: [true, '_id'],
			update: [true, '_id', ['data', 'points', 'raw_points', 'points_possible', 'lateness_percentage', 'lateness_deduction', 'submitted_at', 'updated_at']],
			delete: [true, '_id'],
		},
		assessments: {
			create: [true, ['professor_id', 'student_id', 'data', 'submission_id', 'class_id', 'submitted_at', 'created_at']],
			readAll: [true],
			read: [true, '_id'],
			update: [true, '_id', ['data', 'submitted_at', 'updated_at']],
			delete: [true, '_id'],
		},
		groups: {
			create: [true, ['name', 'student_ids', 'class_id', 'created_at']],
			readAll: [true],
			read: [true, '_id'],
			update: [true, '_id', ['name', 'student_ids', 'updated_at']],
			delete: [true, '_id'],
		}
	},
	auth: {
		collection: {
			name: 'users',
			whitelist: ['first_name', 'last_name', 'display_name'], //in addition to 'email', 'sms', 'password_hash'
		},
	},
	notifications: {
		email: {
			use: 'postmark',
			postmark: {
				token() { return process.env.POSTMARK_SERVER_API_TOKEN },
			},
		},
	},
})


api.start({
	// key: path.resolve(__dirname, 'ssl/private.key'),
	// crt: path.resolve(__dirname, 'ssl/certificate.crt'),
})
