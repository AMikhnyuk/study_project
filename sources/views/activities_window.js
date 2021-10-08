import {JetView} from "webix-jet";

import {activitiesCollection, actTypesCollection, contactsCollection} from "../models/collections";

export default class ActWindowView extends JetView {
	config() {
		return {
			view: "window",
			width: 600,
			height: 500,
			head: "Label",
			position: "center",
			modal: true,
			body: {
				view: "form",
				localId: "form",
				elements: [
					{view: "textarea", label: "Details", name: "Details"},
					{
						view: "richselect",
						label: "Type",
						name: "TypeID",
						options: {
							body: {
								data: actTypesCollection,
								template({Value}) {
									return `${Value}`;
								}
							}
						},
						invalidMessage: "Choose activity"
					},
					{
						view: "richselect",
						label: "Contact",
						name: "ContactID",
						options: {
							body: {
								data: contactsCollection,
								template({FirstName, LastName}) {
									return FirstName && LastName ? `${FirstName} ${LastName}` : "";
								}
							}
						},
						invalidMessage: "Choose contact"
					},
					{
						cols: [
							{view: "datepicker", label: "Date", name: "Date"},
							{view: "datepicker", label: "Time", type: "time", name: "Time"}
						],
						borderless: true
					},
					{view: "checkbox", labelRight: "Completed", labelWidth: 0, name: "checkbox"},
					{
						view: "toolbar",
						localId: "buttons",
						elements: [
							{},
							{
								view: "button",
								value: "Save",
								width: 100,
								localId: "save",
								click: () => {
									const form = this.$$("form");
									const formValues = form.getValues();

									if (form.validate()) {
										const dateFormat = webix.Date.dateToStr("%Y-%m-%d");
										const timeFormat = webix.Date.dateToStr("%H:%i");
										const rdyDate = dateFormat(formValues.Date);
										const rdyTime = timeFormat(formValues.Time);
										formValues.DueDate = `${rdyDate} ${rdyTime}`;
										formValues.ObjDate = new Date(formValues.DueDate);
										if (activitiesCollection.getItem(formValues.id)) {
											activitiesCollection.updateItem(formValues.id, formValues);
										}
										else activitiesCollection.add(formValues);

										form.clear();
										form.clearValidation();
										this.getRoot().hide();
									}
								}
							},
							{
								view: "button",
								value: "Cancel",
								width: 100,
								click: () => {
									const form = this.$$("form");
									form.clear();
									form.clearValidation();
									this.getRoot().hide();
								}
							}
						],
						borderless: true


					}
				],
				rules: {
					TypeID: webix.rules.isNotEmpty,
					ContactID: webix.rules.isNotEmpty
				}
			}
		};
	}

	showWindow() {
		this.getRoot().show();
	}

	init(view) {
		const form = this.$$("form");
		this.on(this.app, "editWindow", (id) => {
			if (activitiesCollection.getItem(id)) {
				form.setValues(activitiesCollection.getItem(id));
			}
			view.getHead().setHTML("Edit activity");
			this.$$("save").setValue("Edit");
		});
		this.on(this.app, "addWindow", () => {
			view.getHead().setHTML("Add activity");
			this.$$("save").setValue("Add");
		});
	}
}
