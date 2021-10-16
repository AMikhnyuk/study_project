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
			rules: {
				FirstName: webix.rules.isNotEmpty,
				LastName: webix.rules.isNotEmpty
			},
			elements: [
				{
					cols: [
						{view: "text", label: "First name", name: "FirstName", invalidMessage: "Must not be empty"},
						{view: "text", label: "Email", name: "Email", labelWidth: "auto"}
					],
					padding: 5,
					margin: 40,
					borderless: true
				},
				{
					cols: [
						{view: "text", label: "Last name", name: "LastName", invalidMessage: "Must not be empty"},
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
									template({src}) {
										return `<img src="${src || "./sources/images/svg/user.svg"}" class="form_image">`;
									},

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
													this.uploadFile(upload);
												}
											}
										},
										{view: "button",
											value: "Delete photo",
											click: () => {
												webix.confirm("Delete photo?").then(() => {
													this.$$("image").setValues({src: ""});
												});
											}}
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
								this.formSave();
							}
						},
						{view: "button",
							value: "Cancel",
							width: 150,
							click: () => {
								this.app.callEvent("select", [this.paramId]);
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
		this.paramId = this.getParam("id", true);
		const form = this.$$("contactsForm");
		const header = this.$$("contactsFormHeader");
		const button = this.$$("actionBtn");
		if (this.paramId) {
			contactsCollection.waitData.then(() => {
				const item = contactsCollection.getItem(this.paramId);
				if (item) {
					form.setValues(item);
					this.$$("image").setValues({src: item.Photo});
				}
			});
			header.setHTML("Edit");
			button.setValue("Edit");
		}
		else {
			form.clear();
			this.$$("image").setValues({src: ""});
			header.setHTML("Add");
			button.setValue("Add");
		}
	}

	formSave() {
		const form = this.$$("contactsForm");
		const formValues = form.getValues();
		if (form.validate()) {
			const dateFormat = webix.Date.dateToStr("%Y-%m-%d %H:%i");
			formValues.Photo = this.$$("image").getValues().src;
			formValues.Birthday = dateFormat(formValues.Birthday);
			formValues.StartDate = dateFormat(formValues.StartDate);
			if (contactsCollection.exists(formValues.id)) {
				contactsCollection.updateItem(formValues.id, formValues);
			}
			else {
				contactsCollection.add(formValues);
			}
			form.clear();
			this.app.callEvent("select", [formValues.id]);
		}
	}

	uploadFile(upload) {
		const file = upload.file;
		const reader = new FileReader();
		reader.onload = (event) => {
			this.$$("image").setValues({src: event.target.result});
		};
		reader.readAsDataURL(file);

		return false;
	}
}
