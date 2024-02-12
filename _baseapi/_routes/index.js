
const _ = require('underscore')

const organizeRoutes = (routesConfig) => {

	const flatRoutes = []
	const totalRoutes = routesConfig.length

	let routes = routesConfig.map(route => {
		const pattern = RegExp(/([^\/]*)\/([^\(]+)\(([^\(]+)\)/)
		const [id, parentPath, path, model] = route._id.match(pattern)
		const fullPath = `${parentPath}/${path}`
		for (let method of ['_create', '_readAll', '_read', '_update', '_delete']) {
			if (route[method]) {
				if (route[method].where) {
					route[method].url = `${path}/:${model}${route[method].where}`
				} else {
					route[method].url = path
				}
			}
		}
		const parents = []
		flatRoutes.push(_.omit({ ...route, model, path, fullPath, parentPath }, '_id'))
		return _.omit({ ...route, parents, model, parentPath, path, fullPath }, '_id')
	})

	console.log(routes)

	let processed = 0
	while (processed < totalRoutes) {
		for (const route of routes) {
			let cursor = route.parentPath
			while (cursor !== '') {
				const foundRoute = flatRoutes.find(r => cursor === r.path)
				route.parents.push(foundRoute)
				cursor = foundRoute.parentPath
			}
			processed++
		}
	}

	routes = routes.map(route => {
		route.parents = _.sortBy(route.parents, parent => -parent.fullPath.length)
		if (route.parents.length > 0) {
			route.fullPath = route.parents[0].fullPath + '/' + route.path
		}
		return route
	})

	return routes
}



module.exports = (API, { routes }) => {

	routes = organizeRoutes(routes)

	for (const route of routes) {
		console.log(route)



	}






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

