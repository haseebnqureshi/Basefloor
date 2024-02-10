
const path = require('path')

const API = require('./_baseAPI')({
	envPath: path.resolve(__dirname, '.env'),
	projectPath: path.resolve(__dirname),
})

API.DB.students = {}
API.DB.students.readAll = async (where) => {
	const result = await API.Utils.tryCatch(`try:students:readAll`,
		API.DB.collection('user')
			.find(where || {})
			.toArray())
	return result
}

API.get('/students', async (req, res) => {
	try {
		const students = await API.Utils.tryCatch('try:students:readAll', 
			API.DB.students.readAll({ role: 'student' }))
		res.status(200).send({ data: students })
	}
	catch (err) {
		API.Utils.errorHandler({ res, err })
	}
})

API.Start()