import {JetView} from "webix-jet";


import actTypesCollection from "../../models/actTypesCollection";
import activitiesCollection from "../../models/activitiesCollection";
import contactsCollection from "../../models/contactsCollection";

export default class ActWindowView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		return {
			view: "window",
			localId: "window",
			width: 600,
			height: 500,
			head: "Label",
			position: "center",
			modal: true,
			body: {
				view: "form",
				localId: "form",
				elements: [
					{view: "textarea", label: _("Details"), name: "Details"},
					{
						view: "richselect",
						label: _("Activity type"),
						name: "TypeID",
						options: {
							body: {
								data: actTypesCollection,
								template: "#Value#"
							}
						},
						invalidMessage: _("Choose activity")
					},
					{
						view: "richselect",
						label: _("Contact"),
						name: "ContactID",
						localId: "contact",
						options: {
							body: {
								data: contactsCollection,
								template({FirstName, LastName}) {
									return `${FirstName || _("No firts name")} ${LastName || _("No last name")}`;
								}
							}
						},
						invalidMessage: _("Choose contact")
					},
					{
						cols: [
							{view: "datepicker", label: _("Date"), name: "Date"},
							{view: "datepicker", label: _("Time"), type: "time", name: "Time"}
						],
						borderless: true
					},
					{view: "checkbox", labelRight: _("Completed"), labelWidth: 0, name: "State", checkValue: "Close", uncheckValue: "Open"},
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
									this.formSave();
								}
							},
							{
								view: "button",
								value: _("Cancel"),
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

	showWindow(text, id, contactID) {
		const _ = this.app.getService("locale")._;
		this.getRoot().show();
		const form = this.$$("form");
		if (id)	form.setValues(activitiesCollection.getItem(id));
		if (contactID) {
			form.setValues({ContactID: contactID});
			this.$$("contact").disable();
		}

		this.$$("window").getHead().setHTML(`${text} ${_("activity")}`);
		this.$$("save").setValue(text);
	}

	formSave() {
		const form = this.$$("form");
		const formValues = form.getValues();

		if (form.validate()) {
			const dateFormat = webix.Date.dateToStr("%Y-%m-%d");
			const timeFormat = webix.Date.dateToStr("%H:%i");
			const rdyDate = dateFormat(formValues.Date ? formValues.Date : new Date());
			const rdyTime = timeFormat(formValues.Time ? formValues.Time : new Date());
			formValues.DueDate = `${rdyDate} ${rdyTime}`;
			formValues.ObjDate = new Date(formValues.DueDate);
			if (activitiesCollection.exists(formValues.id)) {
				activitiesCollection.updateItem(formValues.id, formValues);
			}
			else activitiesCollection.add(formValues);

			form.clear();
			form.clearValidation();
			this.getRoot().hide();
		}
	}
}
