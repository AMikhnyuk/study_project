import {JetView} from "webix-jet";

import ActivitiesTable from "./activitiesViews/table";
import ActWindowView from "./activitiesViews/window";


export default class ActivitiesView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const activitiesAdd = {
			view: "toolbar",
			elements: [
				{},
				{
					view: "button",
					label: `<i class="webix_icon wxi-plus"></i><span>${_("Add activity")}</span>`,
					click: () => {
						this.win.showWindow("Add");
					},
					width: 150
				}
			]

		};
		const activitiesTable = new ActivitiesTable(this.app, false, false);
		const ui = {
			rows: [
				activitiesAdd,
				activitiesTable
			],
			gravity: 6
		};
		return ui;
	}

	init() {
		this.win = this.ui(ActWindowView);
	}
}
