import {JetView} from "webix-jet";

import contactsCollection from "../models/contactsCollection";
import statusesCollection from "../models/statusesCollection";

export default class ContactsView extends JetView {
	config() {
		const contactsList = {
			view: "list",
			select: "true",
			css: "contacts_list",
			localId: "contacts_list",
			template({Photo, FirstName, LastName, Company}) {
				return `<div class="list_item">
					<div class="item_img">
						<img src=${Photo || "./sources/images/svg/user.svg"} class="img_img">
					</div>
					<div class="item_info">
						<div class="info_title">${FirstName} ${LastName}</div>
						<div>${Company}</div>
					</div>
				</div>`;
			},
			on: {
				onAfterSelect: (id) => {
					this.$$("contacts_profile").parse(contactsCollection.getItem(id));
				}
			},
			scroll: false,
			type: {
				height: 60
			},
			gravity: 2

		};
		const contactsProfile = {
			localId: "contacts_profile",

			template({
				FirstName, LastName, Photo,
				Email, Skype, Job, Company,
				Address, Birthday, StatusID
			}) {
				const st = statusesCollection.getItem(StatusID);
				return `<div class="contact_header">
						<span class="header_title">
							${FirstName} ${LastName}
						</span>
						<div class="header_toolbar">
							<div class="toolbar_button delete_btn">
								<img class="button_ico" src="./sources/images/svg/trash.svg">
								<span>Delete</span>
							</div>
							<div class="toolbar_button edit_btn">
								<img class="button_ico" src="./sources/images/svg/edit.svg">
								<span>Edit</span>
							</div>
						</div>
					</div>
							<div class="contact_body">
								<div class="body_img">
									<img class="img_pic" src=${Photo || "./sources/images/svg/user.svg"}>
									<i class="webix_icon wxi-${st ? st.Icon : ""} img_status">${st ? st.Value : "No status"}</i>
								</div>
								<div class="body_info">
									<div class="info_block">
										<div class="block_item">
											<img class="item_ico" src="./sources/images/svg/email.svg">
											<span class="item_text">${Email}</span>
										</div>
										<div class="block_item">
											<img class="item_ico" src="./sources/images/svg/skype.svg">
											<span class="item_text">${Skype}</span>
										</div>
										<div class="block_item">
											<img class="item_ico" src="./sources/images/svg/tag.svg">
											<span class="item_text">${Job}</span>
										</div>
										<div class="block_item">
											<img class="item_ico" src="./sources/images/svg/briefcase.svg">
											<span class="item_text">${Company}</span>
										</div>
									</div>
									<div class="info_block">
										<div class="block_item">
											<img class="item_ico" src="./sources/images/svg/date.svg">
											<span class="item_text">${Birthday}</span>
										</div>
										<div class="block_item">
											<img class="item_ico" src="./sources/images/svg/location.svg">
											<span class="item_text">${Address}</span>
										</div>
									</div>
								</div>
					</div >`;
			},
			gravity: 5,
			padding: 20,
			data: [{id: 1, Name: "Sasha"}]

		};
		const ui = {
			cols: [contactsList, contactsProfile],
			gravity: 6
		};
		return ui;
	}

	init() {
		const list = this.$$("contacts_list");

		webix.promise.all([contactsCollection.waitData, statusesCollection.waitData])
			.then(() => {
				list.sync(contactsCollection);
				list.select(contactsCollection.getFirstId());
			});
	}
}
