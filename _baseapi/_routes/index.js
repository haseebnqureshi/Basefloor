
const _ = require('underscore')

module.exports = (API, { routes }) => {

	//order the routes, from top root down the tree of parents
	const total = routes.length
	let found = 0
	let filed = {}

	while (found < total) {
		for (let route of routes) {
			const { _parent, _name } = route
			if (!_parent) {
				filed[_name] = { ...route, depth: 0 }
				found++
			}
			else if (filed[_parent]) {
				const depth = filed[_parent].depth
				filed[_name] = { ...route, depth: depth+1 }
				found++
			}
		}
	}

	console.log({ found, total, filed })





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

