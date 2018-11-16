sap.ui.define([
	"aplicacao/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/Device"
], function(BaseController, jQuery, Controller, MessageBox, DateFormat, MessageToast, UploadCollectionParameter, JSONModel, Device) {

	"use strict";
	var tiles = [{
		"id": "idEntradaMerc",
		"icon": "add-product",
		"title": "Entrada Mercadoria",
		"infoState": "Success",
		"info": "",
		"type": "None",
		"numberUnit": "",
		"number": ""
	}, {
		"id": "idTranfEstoque",
		"icon": "supplier",
		"title": "Transferência Estoque",
		"infoState": "Success",
		"info": "",
		"type": "None",
		"numberUnit": "",
		"number": ""
	}, {
		"id": "idMovFlowRack",
		"icon": "customer-and-supplier",
		"title": "Movimentação Flow Rack",
		"info": "",
		"infoState": "None",
		"numberUnit": "",
		"number": ""
	}, {
		"id": "idInventarioSuperEstoque",
		"icon": "user-edit",
		"title": "Ajuste de Inventário no Super Estoque",
		"info": "",
		"infoState": "None",
		"numberUnit": "",
		"number": ""
	}, {
		"id": "idAjusteInventario",
		"icon": "user-edit",
		"title": "Ajuste de Inventário no Flow Rack",
		"info": "",
		"infoState": "None",
		"numberUnit": "",
		"number": ""
	}];

	return BaseController.extend("aplicacao.controller.Menu", {

		onInit: function() {
			this.getRouter().getRoute("Menu").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			
			this.getView().getModel("modelAux");
			
			var oModel = new sap.ui.model.json.JSONModel(tiles);
			this.getOwnerComponent().setModel(oModel, "tileModel");
		},

		onTile: function(oEvent) {
			switch (oEvent.getSource().data("opcao")) {
				case "idEntradaMerc":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("EntradaMercadoria_1");
					break;
				case "idTranfEstoque":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("TransferenciaEstoque_1");
					break;
				case "idMovFlowRack":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("MovFlowRack_1");
					break;
				case "idInventarioSuperEstoque":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("AjusteInventarioSuperEstoque_1");
					break;
				case "idAjusteInventario":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("AjusteInventarioFlowRack_1");
					break;
			}
		},

		onNavBack: function() {
			var that = this;
			sap.ui.core.UIComponent.getRouterFor(that).navTo("login");
		},

		onAfterRendering: function() {

		}
	});
});