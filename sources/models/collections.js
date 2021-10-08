export const contactsCollection = new webix.DataCollection({
	url: "http://localhost:8096/api/v1/contacts/",
	save: "rest->http://localhost:8096/api/v1/contacts/"
});
export const statusesCollection = new webix.DataCollection({
	url: "http://localhost:8096/api/v1/statuses/",
	save: "rest->http://localhost:8096/api/v1/statuses/"
});
export const activitiesCollection = new webix.DataCollection({
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
export const actTypesCollection = new webix.DataCollection({
	url: "http://localhost:8096/api/v1/activitytypes/",
	save: "rest->http://localhost:8096/api/v1/activitytypes/"
});
