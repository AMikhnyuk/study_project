import {JetView} from "webix-jet";

import contactsCollection from "../../models/contactsCollection";
import statusesCollection from "../../models/statusesCollection";

export default class ContactsFormView extends JetView {
	config() {
		const contactsFormHeader = {
			template: "Header",
			localId: "contactsFormHeader",
			type: "header"
		};
		const contactsForm = {
			view: "form",
			localId: "contactsForm",
			elements: [
				{
					cols: [
						{view: "text", label: "First name", name: "FirstName"},
						{view: "text", label: "Email", name: "Email", labelWidth: "auto"}
					],
					padding: 5,
					margin: 40,
					borderless: true
				},
				{
					cols: [
						{view: "text", label: "Last name", name: "LastName"},
						{view: "text", label: "Skype", name: "Skype", labelWidth: "auto"}
					],
					padding: 5,
					margin: 40,
					borderless: true
				},
				{
					cols: [
						{view: "datepicker",
							label: "Joing date",
							name: "StartDate",
							format: "%d %M %Y"
						},

						{view: "text", label: "Phone", name: "Phone", labelWidth: "auto"}
					],
					padding: 5,
					margin: 40,
					borderless: true
				},
				{
					cols: [
						{view: "richselect",
							label: "Status",
							name: "StatusID",
							options: {
								body: {
									data: statusesCollection,
									template: "#Value#"
								}
							}},
						{view: "datepicker", label: "Birthday", name: "Birthday", labelWidth: "auto", format: "%d %M %Y"}
					],
					padding: 5,
					margin: 40,
					borderless: true
				},
				{
					cols: [
						{
							rows: [
								{view: "text", label: "Job", name: "Job"},
								{view: "text", label: "Company", name: "Company"},
								{view: "text", label: "Website", name: "Website"},
								{view: "text", label: "Address", name: "Address"},
								{}
							],
							padding: 5,
							margin: 20,
							borderless: true
						},

						{
							cols: [
								{
									template: '<img src="#src#" class="form_image">',

									localId: "image",
									width: 205,
									borderless: true,
									type: "clean"

								},
								{
									rows: [
										{},
										{view: "uploader",
											value: "Change photo",
											autosend: false,
											accept: "image/jpeg, image/png",
											multiple: false,
											on: {
												onBeforeFileAdd: (upload) => {
													let file = upload.file;
													let reader = new FileReader();
													reader.onload = (event) => {
														this.$$("image").setValues({src: event.target.result});
													};
													reader.readAsDataURL(file);

													return false;
												}
											}
										},
										{view: "button", value: "Delete photo"}
									],
									paddingY: 16


								}

							],
							paddingY: 8,
							margin: 20,
							borderless: true


						}
					],
					margin: 30


				},
				{},
				{
					cols: [
						{},
						{view: "button",
							value: "value",
							width: 150,
							localId: "actionBtn",
							click: () => {
								const form = this.$$("contactsForm");
								const formValues = form.getValues();
								const dateFormat = webix.Date.dateToStr("%Y-%m-%d %H:%i:%s");
								formValues.Photo = this.$$("image").getValues().src;
								formValues.Birthday = dateFormat(formValues.Birthday);
								formValues.StartDate = dateFormat(formValues.StartDate);
								if (contactsCollection.getItem(formValues.id)) {
									contactsCollection.updateItem(formValues.id, formValues);
								}
								else {
									contactsCollection.add(formValues);
								}
								form.clear();
								this.app.callEvent("cancel", [formValues.id]);
							}},
						{view: "button",
							value: "Cancel",
							width: 150,
							click: () => {
								this.app.callEvent("cancel", [this.$$("contactsForm").getValues().id]);
							}
						}
					]
				}


			]

		};
		const ui = {
			rows: [contactsFormHeader, contactsForm],
			gravity: 5

		};
		return ui;
	}

	urlChange() {
		const id = this.getParam("id", true);
		const form = this.$$("contactsForm");
		const header = this.$$("contactsFormHeader");
		const button = this.$$("actionBtn");
		if (id) {
			contactsCollection.waitData.then(() => {
				if (contactsCollection.getItem(id)) {
					const item = contactsCollection.getItem(id);
					form.setValues(item);
					this.$$("image").setValues({src: item.Photo});
				}
			});
			header.setHTML("Edit");
			button.setValue("Edit");
		}
		else {
			form.clear();
			header.setHTML("Add");
			button.setValue("Add");
		}
	}
}
