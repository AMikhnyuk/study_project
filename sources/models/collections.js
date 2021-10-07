export const contactsCollection = new webix.DataCollection({
    url: "http://localhost:8096/api/v1/contacts/",
    save: "rest->http://localhost:8096/api/v1/contacts/"
})
export const statusesCollection = new webix.DataCollection({
    url: "http://localhost:8096/api/v1/statuses/",
    save: "rest->http://localhost:8096/api/v1/statuses/"
})