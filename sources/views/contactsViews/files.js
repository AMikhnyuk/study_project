import {JetView} from "webix-jet";

import filesCollection from "../../models/filesCollection";

export default class ContactsFiles extends JetView {
	config() {
		const filesTable = {
			view: "datatable",
			localId: "filesDatatable",
			css: "webix_header_border webix_data_border",
			scrollX: false,
			columns: [
				{id: "name", header: "Name", fillspace: true, sort: "text"},
				{id: "date",
					header: "Change date",
					width: 220,
					template({date}) {
						return webix.Date.dateToStr("%d %M %Y")(date);
					},
					sort: "date"
				},
				{id: "size",
					header: "Size",
					width: 200,
					sort: "text",
					template: "#size#Kb"
				},
				{id: "Remove", header: "", template: '<i class="webix_icon wxi-trash remove"></i>', width: 40}

			],
			onClick: {
				remove: (e, item) => {
					webix.confirm("Deleting cannot be undone. Delete?").then(() => {
						const id = this.getParam("id");
						filesCollection.remove(item.row);
						this.$$("filesDatatable").filter("#ContactID#", id);
					});
				}
			},
			autoHeight: true,
			data: filesCollection
		};
		const uploadFilesBtn = {
			view: "uploader",
			localId: "uploader",
			upload: "",
			autosend: false,
			label: '<i class="webix_icon wxi-file"></i>Upload File',
			on: {
				onBeforeFileAdd: (file) => {
					file.date = new Date();
				},
				onAfterFileAdd: (file) => {
					file.ContactID = this.getParam("id");
					filesCollection.add({...file});
					this.$$("filesDatatable").filter("#ContactID#", file.ContactID);
				}
			}
		};
		const ui = {rows: [filesTable, uploadFilesBtn]};
		return ui;
	}

	urlChange() {
		const id = this.getParam("id");
		this.$$("filesDatatable").filter("#ContactID#", id);
	}
}
