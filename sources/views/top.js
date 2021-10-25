import {JetView, plugins} from "webix-jet";

export default class TopView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const header = {
			type: "header",
			localId: "top_header",
			template: "Value"
		};
		const menu = {
			view: "list",
			localId: "top_list",
			select: true,
			scroll: false,
			data: [{id: "contacts", value: _("Contacts")}, {id: "activities", value: _("Activities")}, {id: "setting", value: _("Settings")}],
			on: {
				onAfterSelect: () => {
					this.$$("top_header").setHTML(this.$$("top_list").getSelectedItem().value);
				}
			}
		};
		const ui = {
			rows: [header, {cols: [menu, {$subview: true}]}]
		};
		return ui;
	}

	init() {
		this.use(plugins.Menu, "top_list");
	}
}
