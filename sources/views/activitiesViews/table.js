import {JetView} from "webix-jet";

import actTypesCollection from "../../models/actTypesCollection";
import activitiesCollection from "../../models/activitiesCollection";
import contactsCollection from "../../models/contactsCollection";
import ActWindowView from "./window";

export default class ActivitiesTable extends JetView {
	constructor(app, hideColumn, hideTabbar) {
		super(app);
		this.hideColumn = hideColumn;
		this.hideTabbar = hideTabbar;
	}

	config() {
		const _ = this.app.getService("locale")._;
		const tableTabbar = {
			view: "tabbar",
			localId: "tableTabbar",
			hidden: this.hideTabbar,
			options: [
				_("All"),
				_("Overdue"),
				_("Completed"),
				_("Today"),
				_("Tomorrow"),
				_("This week"),
				_("This month")
			],
			on: {
				onChange: (value) => {
					this.$$("activitiesTable").filterByAll();
					this.filterByTab(value);
				}
			}
		};
		const activitiesTable = {
			view: "datatable",
			localId: "activitiesTable",
			css: "webix_header_border webix_data_border",
			scrollX: false,
			columns: [
				{id: "State", width: 40, header: "", template: "{common.checkbox()}", checkValue: "Close", uncheckValue: "Open"},
				{
					id: "TypeID",
					header: [{text: _("Activity type")}, {
						content: "richSelectFilter",
						suggest: {

							body: {
								template: obj => this.selectTemplate(actTypesCollection, obj, "Value")
							}
						}
					}],
					template({TypeID}) {
						const type = actTypesCollection.getItem(TypeID);
						return type ? type.Value : _("No Value");
					},
					width: 170,
					sort: "text"
				},
				{
					id: "ObjDate",
					header: [{text: _("Due date")}, {content: "dateRangeFilter"}],
					width: 150,
					sort: "date",
					format: webix.Date.dateToStr("%d %M %Y")
				},
				{id: "Details", header: [{text: _("Details")}, {content: "textFilter"}], fillspace: true, sort: "text"},
				{
					id: "ContactID",
					hidden: this.hideColumn,
					header: [
						{text: _("Contact")},
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
					this.win.showWindow(_("Edit"), item.row);
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
					if (this.contactId) this.$$("activitiesTable").filter("#ContactID#", this.contactId, true);
					this.filterByTab(this.$$("tableTabbar").getValue());
				}
			}

		};
		const ui = {
			rows: [tableTabbar, activitiesTable]
		};
		return ui;
	}

	init() {
		this.win = this.ui(ActWindowView);
	}

	urlChange() {
		const table = this.$$("activitiesTable");
		table.showOverlay("Loading...");
		webix.promise.all([
			activitiesCollection.waitData,
			actTypesCollection.waitData,
			contactsCollection.waitData
		])
			.then(() => {
				this.contactId = this.getParam("id");
				table.sync(activitiesCollection, () => {
					table.filterByAll();

					if (this.contactId)table.filter("#ContactID#", this.contactId, true);
				});
				table.hideOverlay();
			});
	}

	selectTemplate(collection, obj, prop) {
		if (collection.exists(obj.id)) {
			return collection.getItem(obj.id)[prop];
		}
		return "";
	}

	filterByTab(value) {
		const table = this.$$("activitiesTable");
		const _ = this.app.getService("locale")._;
		function criteries(obj) {
			const d = new Date();
			if (value === _("Overdue")) return new Date(obj.DueDate) < d && obj.State === "Open";
			if (value === _("Completed")) return obj.State === "Close";
			if (value === _("Today")) return d.getDate() === obj.Date.getDate();
			if (value === _("Tomorrow")) return d.getDate() === obj.Date.getDate() - 1;
			if (value === _("This week")) {
				const first = d.getDate() - d.getDay();
				const last = first + 6;
				return first <= obj.Date.getDate() && obj.Date.getDate() <= last;
			}
			if (value === _("This month")) return d.getMonth() === obj.Date.getMonth() && d.getFullYear() === obj.Date.getFullYear();
			return obj;
		}
		table.filter(obj => criteries(obj), "", true);
	}
}
