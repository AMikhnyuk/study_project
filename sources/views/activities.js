import {JetView} from "webix-jet";

import {activitiesCollection, actTypesCollection, contactsCollection} from "../models/collections";
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
						this.ui(ActWindowView).showWindow();
						this.app.callEvent("addWindow");
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
				{
					id: "checkbox", width: 40, header: "", template: "{common.checkbox()}"

				},
				{
					id: "TypeID",
					header: ["Activity type", {
						content: "richSelectFilter",
						suggest: {

							body: {
								data: actTypesCollection,
								template: "#Value#"
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
					template({ObjDate}) {
						const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

						return `${ObjDate.getDate()} ${month[ObjDate.getMonth()]} ${ObjDate.getFullYear()}`;
					},
					format: webix.i18n.dateFormatStr,

					sort: "date"
				},
				{id: "Details", header: ["Details", {content: "textFilter"}], fillspace: true, sort: "text"},
				{
					id: "ContactID",
					header: [
						"Contact",
						{
							content: "richSelectFilter",
							contentId: "contact",
							suggest: {

								body: {
									data: contactsCollection,
									template: "#FirstName# #LastName#"
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
					this.ui(ActWindowView).showWindow();
					this.app.callEvent("editWindow", [item.row]);
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
		table.sync(activitiesCollection);
		table.showOverlay("Loading...");
		webix.promise.all([
			activitiesCollection.waitData,
			actTypesCollection.waitData,
			contactsCollection.waitData
		])
			.then(() => {
				table.refresh();
				table.hideOverlay();
			});
	}
}
