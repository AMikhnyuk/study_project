import {JetView} from "webix-jet";

import activitiesCollection from "../models/activitiesCollection";
import contactsCollection from "../models/contactsCollection";
import statusesCollection from "../models/statusesCollection";

export default class ContactsView extends JetView {
	config() {
		const contactsList = {
			view: "list",
			select: "true",
			css: "contacts_list",
			localId: "contactsList",
			template({Photo, FirstName, LastName, Company}) {
				return `<div class="list_item">
					<div class="item_img">
						<img src=${Photo || "./sources/images/svg/user.svg"} class="img_img">
					</div>
					<div class="item_info">
						<div class="info_title">${FirstName} ${LastName}</div>
						<div class="info_text">${Company}</div>
					</div>
				</div>`;
			},
			on: {
				onAfterSelect: (id) => {
					this.show(`contactsViews.details?id=${id}`);
				}
			},
			scroll: false,
			type: {
				height: 60
			}


		};
		const addContactsButton = {
			view: "button",
			label: '<i class="webix_icon wxi-plus"></i>Add Contact',
			click: () => {
				this.show("contactsViews.form");
			}
		};

		const ui = {
			cols: [{rows: [contactsList, addContactsButton], gravity: 2}, {$subview: true}],
			gravity: 6
		};
		return ui;
	}

	init() {
		const list = this.$$("contactsList");

		webix.promise.all([
			contactsCollection.waitData,
			statusesCollection.waitData,
			activitiesCollection.waitData
		])
			.then(() => {
				list.sync(contactsCollection);
				list.select(contactsCollection.getFirstId());
				this.on(this.app, "select", (id) => {
					list.unselectAll();
					if (id)list.select(id);
					else list.select(contactsCollection.getFirstId());
				});
			});
	}
}
