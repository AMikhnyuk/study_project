import {JetView} from "webix-jet";

import activitiesCollection from "../../models/activitiesCollection";
import contactsCollection from "../../models/contactsCollection";
import statusesCollection from "../../models/statusesCollection";
import ActivitiesTable from "../activitiesViews/table";
import ActWindowView from "../activitiesViews/window";
import ContactsFiles from "./files";

export default class DetailsView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
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
                                <span>${_("Delete")}</span>
                            </div>
                            <div class="toolbar_button edit_btn">
                                <img class="button_ico" src="./sources/images/svg/edit.svg">
                                <span>${_("Edit")}</span>
                            </div>
                        </div>
                    </div>
                            <div class="contact_body">
                                <div class="body_img">
                                    <img class="img_pic" src=${Photo || "./sources/images/svg/user.svg"}>
                                   	<div class="status"> 
								   		${st ? `<i class="webix_icon wxi-${st.Icon} img_status"></i>` : ""}<span>${st ? st.Value : _("No Status")}</span>
									</div>
                                </div>
                                <div class="body_info">
                                    <div class="info_block">
                                        <div class="block_item">
                                            <img class="item_ico" src="./sources/images/svg/email.svg">
                                            <span class="item_text">${Email || _("No Email")}</span>
                                        </div>
                                        <div class="block_item">
                                            <img class="item_ico" src="./sources/images/svg/skype.svg">
                                            <span class="item_text">${Skype || _("No Skype")}</span>
                                        </div>
                                        <div class="block_item">
                                            <img class="item_ico" src="./sources/images/svg/tag.svg">
                                            <span class="item_text">${Job || _("No Job")}</span>
                                        </div>
                                        <div class="block_item">
                                            <img class="item_ico" src="./sources/images/svg/briefcase.svg">
                                            <span class="item_text">${Company || _("No Company")}</span>
                                        </div>
                                    </div>
                                    <div class="info_block">
                                        <div class="block_item">
                                            <img class="item_ico" src="./sources/images/svg/date.svg">
                                            <span class="item_text">${webix.Date.dateToStr("%d %M %Y")(Birthday) || _("No Date")}</span>
                                        </div>
                                        <div class="block_item">
                                            <img class="item_ico" src="./sources/images/svg/location.svg">
                                            <span class="item_text">${Address || _("No Address")}</span>
                                        </div>
                                    </div>
                                </div>
                    </div >`;
			},
			onClick: {
				delete_btn: () => {
					this.deleteContact();
				},
				edit_btn: () => {
					this.show(`contactsViews.form?id=${this.paramId}`);
				}
			},
			padding: 20
		};
		const detailsTabbar = {
			view: "tabbar",
			options: [_("Activities"), _("Files")],
			multiview: true

		};
		const activitiesTable = new ActivitiesTable(this.app, true, true);
		const addActivitiesBtn = {
			view: "button",
			label: `<i class="webix_icon wxi-plus"></i>${_("Add Activity")}`,
			width: 250,
			click: () => {
				this.win.showWindow(_("Add"), "", this.paramId);
			}
		};

		const ui = {rows: [
			contactsDetails,
			detailsTabbar,
			{
				cells: [
					{
						rows: [
							{$subview: activitiesTable},
							{cols: [{}, addActivitiesBtn]}
						],
						id: _("Activities")
					},
					{
						rows: [
							{$subview: ContactsFiles}

						],
						id: _("Files")
					}
				]
			}
		],
		gravity: 5};
		return ui;
	}

	urlChange() {
		this.paramId = this.getParam("id");
		webix.promise.all([
			activitiesCollection.waitData,
			contactsCollection.waitData
		])
			.then(() => {
				const item = contactsCollection.getItem(this.paramId);
				if (item) {
					this.$$("contactsDetails").parse(item);
				}
			});
	}

	init() {
		this.win = this.ui(ActWindowView);
	}

	deleteContact() {
		const _ = this.app.getService("locale")._;
		webix.confirm(_("Deleting cannot be undone. Delete?")).then(() => {
			contactsCollection.remove(this.paramId);
			activitiesCollection.data.each((obj) => {
				if (+obj.ContactID === this.paramId) {
					activitiesCollection.remove(obj.id);
				}
			});
			this.app.callEvent("select");
		});
	}
}
