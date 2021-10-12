import {JetView} from "webix-jet";

import actTypesCollection from "../models/actTypesCollection";
import activitiesCollection from "../models/activitiesCollection";
import contactsCollection from "../models/contactsCollection";
import ActWindowView from "./activities_window";

export default class ActivitiesView extends JetView {
	config() {
		const activitiesAdd = {
			view: "toolbar",
			elements: [
				{},
				{
					view: "button",
					label: '<i class="webix_icon wxi-plus"></i><span>Add activity</span>',
					click: () => {
						this.win.showWindow("Add");
					},
					width: 150
				}
			]

		};
		const activitiesDatatable = {
			view: "datatable",
			localId: "act_table",
			css: "webix_header_border webix_data_border",
			columns: [
				{id: "State", width: 40, header: "", template: "{common.checkbox()}", checkValue: "Close", uncheckValue: "Open"},
				{
					id: "TypeID",
					header: ["Activity type", {
						content: "richSelectFilter",
						suggest: {

							body: {
								template: (obj) => {
									if (actTypesCollection.exists(obj.id)) {
										return actTypesCollection.getItem(obj.id).Value;
									}
									return "";
								}
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
					header: [
						"Contact",
						{
							content: "richSelectFilter",
							suggest: {

								body: {
									template: (obj) => {
										if (contactsCollection.exists(obj.id)) {
											const {FirstName, LastName} = contactsCollection.getItem(obj.id);
											return `${FirstName} ${LastName}`;
										}
										return "";
									}
								}
							}
						}],

					template({ContactID}) {
						const contact = contactsCollection.getItem(ContactID);
						return contact ? `${contact.FirstName} ${contact.LastName}` : "No Value";
					},
					width: 170,
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
			}
		};
		const ui = {
			rows: [activitiesAdd, activitiesDatatable],
			gravity: 6
		};
		return ui;
	}

	init() {
		const table = this.$$("act_table");
		table.showOverlay("Loading...");
		this.win = this.ui(ActWindowView);
		webix.promise.all([
			activitiesCollection.waitData,
			actTypesCollection.waitData,
			contactsCollection.waitData
		])
			.then(() => {
				table.sync(activitiesCollection, () => {
					table.filterByAll();
				});
				table.hideOverlay();
			});
	}
}
