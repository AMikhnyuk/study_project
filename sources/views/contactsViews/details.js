import {JetView} from "webix-jet";

import activitiesCollection from "../../models/activitiesCollection";
import contactsCollection from "../../models/contactsCollection";
import statusesCollection from "../../models/statusesCollection";
import ActivitiesTable from "../activitiesViews/table";
import ActWindowView from "../activitiesViews/window";
import ContactsFiles from "./files";

export default class DetailsView extends JetView {
	config() {
		const contactsDetails = {
			localId: "contactsDetails",

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
                                            <span class="item_text">${webix.Date.dateToStr("%d %M %Y")(Birthday)}</span>
                                        </div>
                                        <div class="block_item">
                                            <img class="item_ico" src="./sources/images/svg/location.svg">
                                            <span class="item_text">${Address}</span>
                                        </div>
                                    </div>
                                </div>
                    </div >`;
			},
			onClick: {
				delete_btn: () => {
					const id = this.$$("contactsDetails").getValues().id;
					webix.confirm("Deleting cannot be undone. Delete?").then(() => {
						contactsCollection.remove(id);
						activitiesCollection.data.each((obj) => {
							if (+obj.ContactID === id) {
								activitiesCollection.remove(obj.id);
							}
						});
						this.app.callEvent("cancel");
					});
				},
				edit_btn: () => {
					const id = this.$$("contactsDetails").getValues().id;
					this.show(`/top/contacts/contactsViews.form?id=${id}`);
				}
			},
			padding: 20,
			data: [{id: 1, Name: "Sasha"}]


		};
		const detailsTabbar = {
			view: "tabbar",
			options: ["Activities", "Files"],
			multiview: true

		};
		const addActivitiesBtn = {
			view: "button",
			label: '<i class="webix_icon wxi-plus"></i>Add Activity',
			width: 250,
			click: () => {
				const id = this.getParam("id");
				this.win.showWindow("Add", "", id);
			}
		};

		const ui = {rows: [
			contactsDetails,
			detailsTabbar,
			{
				cells: [
					{
						rows: [
							{$subview: ActivitiesTable},
							{cols: [{}, addActivitiesBtn]}
						],
						id: "Activities"
					},
					{
						rows: [
							{$subview: ContactsFiles}

						],
						id: "Files"
					}
				]
			}
		],
		gravity: 5};
		return ui;
	}

	urlChange() {
		const id = this.getParam("id");
		webix.promise.all([
			activitiesCollection.waitData,
			contactsCollection.waitData
		])
			.then(() => {
				if (contactsCollection.getItem(id)) {
					this.$$("contactsDetails").parse(contactsCollection.getItem(id));
				}
			});
	}

	init(view) {
		this.win = this.ui(ActWindowView);
		webix.promise.all([
			activitiesCollection.waitData,
			contactsCollection.waitData
		])
			.then(() => {
				const table = view.queryView({view: "datatable"});
				table.hideColumn("ContactID");
			});
	}
}
