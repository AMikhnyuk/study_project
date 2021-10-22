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
				{id: "all", value: _("All")},
				{id: "overdue", value: _("Overdue")},
				{id: "completed", value: _("Completed")},
				{id: "today", value: _("Today")},
				{id: "tomorrow", value: _("Tomorrow")},
				{id: "thisWeek", value: _("This week")},
				{id: "thisMonth", value: _("This month")}
			],
			on: {
				onChange: (id) => {
					this.$$("activitiesTable").filterByAll();
					this.filterByTab(id);
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
					webix.confirm(_("Delete?")).then(() => {
						activitiesCollection.remove(item.row);
					});
					return false;
				}

			},
			on: {
				onAfterFilter: () => {
					if (this.contactId) this.$$("activitiesTable").filter("#ContactID#", this.contactId, true);
					this.filterByTab(this.$$("tableTabbar").getValue());
				},
				onCheck: () => {
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

	filterByTab(id) {
		const table = this.$$("activitiesTable");
		function criteries(obj) {
			const d = new Date();
			function now() {
				return d.getFullYear() === obj.Date.getFullYear() &&
				d.getMonth() === obj.Date.getMonth();
			}
			if (id === "overdue") return new Date(obj.DueDate) < d && obj.State === "Open";
			if (id === "completed") return obj.State === "Close";
			if (id === "today") return d.getDate() === obj.Date.getDate();
			if (id === "tomorrow") return webix.Date.add(d, 1, "day", true).getDate() === obj.Date.getDate() && now();
			if (id === "thisWeek") {
				const first = d.getDate() - d.getDay();
				const last = first + 6;

				return first <= obj.Date.getDate() &&
				obj.Date.getDate() <= last && now();
			}
			if (id === "thisMonth") return now();
			return obj;
		}
		table.filter(obj => criteries(obj), "", true);
	}
}
