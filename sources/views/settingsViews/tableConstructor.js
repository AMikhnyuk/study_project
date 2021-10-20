import {JetView} from "webix-jet";

export default class SettingsTableView extends JetView {
	constructor(app, data) {
		super(app);
		this.data = data;
	}

	config() {
		const _ = this.app.getService("locale")._;
		const settingsTable = {
			view: "datatable",
			localId: "settingsTable",
			columns: [
				{id: "Value", header: _("Value"), fillspace: true, editor: "text"},
				{id: "Icon", header: _("Icon"), fillspace: true, editor: "text"},
				{id: "Remove", header: "", template: '<i class="webix_icon wxi-trash remove"></i>', width: 40}
			],
			editable: true,
			onClick: {
				remove: (e, item) => {
					this.removeItem(item.row)
					return false
				}
			},
			scrollX: false,
			select:true,
			editaction:"dblclick",
			on:{
				onAfterSelect:(obj)=>{
					const form = this.$$("settingsForm")
					form.setValues(this.data.getItem(obj.id))
					this.$$("formSaveBtn").setValue(_("Edit"))
					form.clearValidation()
				}
			},
			gravity:3
		};
		const settingsForm = {
			view:"form",
			localId:"settingsForm",
			elements:[
				{
					view:"text",
					label:_("Value"),
					name:"Value",
					invalidMessage:_("Must not be empty")
				},
				{
					view:"text",
					label:_("Icon"),
					name:"Icon",
					invalidMessage:_("Must not be empty")
				},
				{},
				{
					cols:[
					{
						view: "button",
						localId:"formSaveBtn",
						css:"webix_primary",
						value: _("Add"),
						click: () => {
							this.formSave()
						}
					},
					{
						view: "button",
						localId:"formClearBtn",
						value: _("Clear"),
						click: () => {
							this.formClear()
						}
					}
					]
				}
			],
			gravity:2,
			rules:{
				Value:webix.rules.isNotEmpty,
				Icon:webix.rules.isNotEmpty
			}
		}

		const ui = {
			cols: [
				settingsTable,
				settingsForm
			]
		};
		return ui;
	}

	init() {
		const table = this.$$("settingsTable");
		this.data.waitData.then(() => {
			table.sync(this.data);
		});
	}
	removeItem(row){
		const _ = this.app.getService("locale")._;
		webix.confirm(_("Deleting cannot be undone. Delete?")).then(() => {
			this.data.remove(row);
			if(row === this.$$("settingsForm").getValues().id){
				this.formClear()
			}
		});
	}	
	formClear(){
		const _ = this.app.getService("locale")._;
		const form = this.$$("settingsForm")
		form.clear()
		form.clearValidation()
		this.$$("settingsTable").unselectAll()
		this.$$("formSaveBtn").setValue(_("Add"))
	}
	formSave(){
		const form = this.$$("settingsForm")
		const formValues = form.getValues()
		if(form.validate()){
			if(this.data.exists(formValues.id)){
				this.data.updateItem(formValues.id, formValues)
			}
			else{
				this.data.add(formValues)
			}
			this.formClear()
		}
		
	}
}
