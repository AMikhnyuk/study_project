import {JetView} from "webix-jet";

import actTypesCollection from "../models/actTypesCollection";
import statusesCollection from "../models/statusesCollection";
import SettingsTableView from "./settingsViews/tableConstructor";

export default class SettingsView extends JetView {
	config() {
		const lang = this.app.getService("locale").getLang();
		const _ = this.app.getService("locale")._;

		const title = value => ({
			template:_(value),
			type: "header",
			paddingY: 20
		});
		const langSegment = {
			view: "segmented",
			localId: "langSegment",
			options: [{id: "en", value: "EN"}, {id: "ru", value: "RU"}],
			click: () => this.toggleLanguage(),
			value: lang
		};
		const typesTable = new SettingsTableView(this.app, actTypesCollection);
		const statusesTable = new SettingsTableView(this.app, statusesCollection);
		const settingsTabbar = {
			view: "tabbar",
			localId: "settingsTabbar",
			options: [
				{value: _("Activity Types"), id: "activities"},
				{value: _("Statuses"), id: "statuses"}
			],
			multiview: true
		};

		const ui = {
			rows: [
				{
					rows: [
						title("Language"),
						langSegment
					]
				},
				{
					rows: [
						title("Custom Settings"),
						settingsTabbar,
						{
							
								
									
							cells: [
								{$subview: typesTable, id: "activities"},
								{$subview: statusesTable, id: "statuses"}
								],
								
									
									
							
						
						}
					]
				}

			],
			type: "space",
			gravity: 6
		};
		return ui;
	}


	toggleLanguage() {
		const langs = this.app.getService("locale");
		const value = this.$$("langSegment").getValue();
		langs.setLang(value);
	}
}
