
const _ = require('underscore')

const organizeRoutes = (routesArray) => {

	let byPath = {}
	let byPathTotal = 0
	let byModel = {}
	let byModelTotal = 0

	while (byPathTotal < routesArray.length && byModelTotal < routesArray.length) {
		for (let route of routesArray) {
			const pattern = RegExp(/([^\(]+)\(([^\/]*)\/([^\))]+)\)/)
			const [id, model, parentPath, path] = route._id.match(pattern)
			route = { ...route, model, parentPath, path }

			if (byModel[model]) {
				byModel[model].push(route)
				byModelTotal++
			} else {
				byModel[model] = [route]
				byModelTotal++
			}

			if (byPath[parentPath]) {
				byPath[parentPath].push(route)
				byPathTotal++
			} else {
				byPath[parentPath] = [route]
				byPathTotal++
			}
		}
	}

	return { byPath, byModel }
}

module.exports = (API, { routes }) => {

	const organized = organizeRoutes(routes)

	console.log(organized)




	// for (let routeName in routes) {

	// 	const route = routes[routeName]

	// 	const { _parent, _create, _readAll, _read, _update, _delete } = route	

	// 	const router = API.Express.Router({ mergeParams: true })






	// 	if (_parent) {

	// 	}
	// 	else {
	// 		API.

	// 	}









	// 	if (_create) {
	// 		router.post('/', async (req, res) => {

	// 		})
	// 	}


	// }







	/* REGISTERING ROUTES ==========================
	it's up to the routes to use any middlewares
	if middlewares not used in routes, then must be bound at definition
	so at auth, auth must API.use any and all middlewares
	*/

	// for (let key in loadedRoutes) {
	// 	for (let route of routes[key]) {
	// 		API[route.method](route.path, route.middlewares || [], route.fn)
	// 	}
	// }

	return API

}

