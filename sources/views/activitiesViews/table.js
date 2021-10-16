import {JetView} from "webix-jet";

import actTypesCollection from "../../models/actTypesCollection";
import activitiesCollection from "../../models/activitiesCollection";
import contactsCollection from "../../models/contactsCollection";
import ActWindowView from "./window";

export default class ActivitiesTable extends JetView {
	constructor(app, hideColumn) {
		super(app);
		this.hideColumn = hideColumn;
	}

	config() {
		const activitiesTable = {
			view: "datatable",
			localId: "activitiesTable",
			css: "webix_header_border webix_data_border",
			scrollX: false,
			columns: [
				{id: "State", width: 40, header: "", template: "{common.checkbox()}", checkValue: "Close", uncheckValue: "Open"},
				{
					id: "TypeID",
					header: ["Activity type", {
						content: "richSelectFilter",
						suggest: {

							body: {
								template: obj => this.selectTemplate(actTypesCollection, obj, "Value")
							}
						}
					}],
					template({TypeID}) {
						const type = actTypesCollection.getItem(TypeID);
						return type ? type.Value : "No Value";
					},
					width: 170,
					sort: "text"
				},
				{
					id: "ObjDate",
					header: ["Due date", {content: "dateRangeFilter"}],
					width: 150,
					sort: "date",
					format: webix.Date.dateToStr("%d %M %Y")
				},
				{id: "Details", header: ["Details", {content: "textFilter"}], fillspace: true, sort: "text"},
				{
					id: "ContactID",
					hidden: this.hideColumn,
					header: [
						"Contact",
						{
							content: "richSelectFilter",
							contentId: "contact",

							suggest: {

								body: {

									template: (obj) => {
										const FirstName = this.selectTemplate(contactsCollection, obj, "FirstName");
										const LastName = this.selectTemplate(contactsCollection, obj, "LastName");
										return `${FirstName} ${LastName}`;
									}

								}
							}
						}],

					template({ContactID}) {
						const contact = contactsCollection.getItem(ContactID);
						return contact ? `${contact.FirstName} ${contact.LastName}` : "No Value";
					},
					width: 140,
					sort: "text"
				},
				{id: "edit", header: "", template: '<img src="./sources/images/svg/edit.svg" class="table_button edit">', width: 40},
				{id: "delete", header: "", template: '<img src="./sources/images/svg/trash.svg" class="table_button remove">', width: 40}
			],
			onClick: {
				edit: (e, item) => {
					this.win.showWindow("Edit", item.row);
					return false;
				},
				remove: (e, item) => {
					webix.confirm("Delete?").then(() => {
						activitiesCollection.remove(item.row);
					});
					return false;
				}
			},
			on: {
				onAfterFilter: () => {
					if (this.contactId) this.getRoot().filter("#ContactID#", this.contactId, true);
				}
			}

		};
		return activitiesTable;
	}

	init() {
		this.win = this.ui(ActWindowView);
	}

	urlChange(view) {
		view.showOverlay("Loading...");
		webix.promise.all([
			activitiesCollection.waitData,
			actTypesCollection.waitData,
			contactsCollection.waitData
		])
			.then(() => {
				this.contactId = this.getParam("id");
				view.sync(activitiesCollection, () => {
					view.filterByAll();

					if (this.contactId)view.filter("#ContactID#", this.contactId, true);
				});
				view.hideOverlay();
			});
	}

	selectTemplate(collection, obj, prop) {
		if (collection.exists(obj.id)) {
			return collection.getItem(obj.id)[prop];
		}
		return "";
	}
}
