export default new webix.DataCollection({
	url: "http://localhost:8096/api/v1/activities/",
	scheme: {
		$init(item) {
			if (item.DueDate) {
				item.ObjDate = new Date(item.DueDate);
				item.Date = new Date(item.ObjDate);
				item.Time = new Date(item.ObjDate);
			}
		}

	},
	save: "rest->http://localhost:8096/api/v1/activities/"
});
