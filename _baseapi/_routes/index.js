
const _ = require('underscore')

module.exports = (API, { routes }) => {

	API.Routes = {}

	for (let routeName in routes) {
		const route = routes[routeName]
		const { _parent, _create, _readAll, _read, _update, _delete } = route
		
		



	}







	/* REGISTERING ROUTES ==========================
	it's up to the routes to use any middlewares
	if middlewares not used in routes, then must be bound at definition
	so at auth, auth must API.use any and all middlewares
	*/

	for (let key in API.Routes) {
		for (let route of API.Routes[key]) {
			API[route.method](route.path, route.middlewares || [], route.fn)
		}
	}

	return API

}

