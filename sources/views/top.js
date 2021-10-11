import {JetView} from "webix-jet";

export default class TopView extends JetView {
	config() {
		const header = {
			type: "header",
			template: "Hello"
		};
		const menu = {
			view: "list",
			localId: "top_list",
			select: true,
			scroll: false,
			data: [{id: "contacts", value: "Contacts"}, {id: "activities", value: "Activities"}, {id: "setting", value: "Settings"}],
			click: (id) => {
				this.show(`${id}`);
			}
		};
		const ui = {
			rows: [header, {cols: [menu, {$subview: true}]}]
		};
		return ui;
	}

	init() {
		const topList = this.$$("top_list");
		topList.select("contacts");
		this.app.show("/top/contacts");
	}
}
