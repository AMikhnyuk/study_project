import {JetView} from "webix-jet";

import filesCollection from "../../models/filesCollection";

export default class ContactsFiles extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const filesTable = {
			view: "datatable",
			localId: "filesDatatable",
			css: "webix_header_border webix_data_border",
			scrollX: false,
			columns: [
				{id: "name", header: _("Name"), fillspace: true, sort: "text"},
				{id: "date",
					header: _("Change date"),
					width: 220,
					template({date}) {
						return webix.Date.dateToStr("%d %M %Y")(date);
					},
					sort: "date"
				},
				{id: "size",
					header: _("Size"),
					width: 200,
					sort: "int",
					template: "#size#Kb"
				},
				{id: "Remove", header: "", template: '<i class="webix_icon wxi-trash remove"></i>', width: 40}

			],
			onClick: {
				remove: (e, item) => {
					webix.confirm(_("Deleting cannot be undone. Delete?")).then(() => {
						filesCollection.remove(item.row);
						this.$$("filesDatatable").filter("#ContactID#", this.paramId);
					});
				}
			},
			data: filesCollection
		};
		const uploadFilesBtn = {
			view: "uploader",
			localId: "uploader",
			upload: "",
			autosend: false,
			label: `<i class="webix_icon wxi-file"></i>${_("Upload File")}`,
			on: {
				onBeforeFileAdd: (file) => {
					file.date = new Date();
				},
				onAfterFileAdd: (file) => {
					file.ContactID = this.paramId;
					filesCollection.add({...file});
					this.$$("filesDatatable").filter("#ContactID#", file.ContactID);
				}
			}
		};
		const ui = {rows: [filesTable, uploadFilesBtn]};
		return ui;
	}

	urlChange() {
		this.paramId = this.getParam("id");
		this.$$("filesDatatable").filter("#ContactID#", this.paramId);
	}
}
