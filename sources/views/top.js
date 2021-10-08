import {JetView} from "webix-jet";

export default class TopView extends JetView {
	config() {
		const header = {
			type: "header",
			template: "Hello"
		};
		const menu = {
			view: "list",
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
}
