sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent"
], function(Controller, History, UIComponent) {
	"use strict";

	return Controller.extend("aplicacao.controller.BaseController", {
		init: function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();

			var oModel = new sap.ui.model.json.JSONModel({
				receiving: "",
				nt: "",
				werks: "", 
				Ivnum: "",
				lgnum: "",
				nomeCentro: ""
			});
			
			this.getOwnerComponent().setModel(oModel, "modelAux");
			

			var oModel1 = new sap.ui.model.json.JSONModel({
				Matnr: "",
				Tbnum: "",
				Menge: "",
				Charg: "",
				Lgnum: "",
				Mblnr: "",
				Meins: "",
				Mjahr: "",
				Tbpos: "",
				Werks: "",
				NLTYP: "",
				Concluido: ""
			});

			this.getOwnerComponent().setModel(oModel1, "modelItemPendente");


			var oModel2 = new sap.ui.model.json.JSONModel({
				qntUN: "",
				qntCaixa: "",
				qntProposta: "",
				un: ""
			});

			this.getOwnerComponent().setModel(oModel2, "modelSeparacaoCaixas");

			oModel = new sap.ui.model.json.JSONModel({
				DocSD: ""
			});

			this.getOwnerComponent().setModel(oModel, "listaOrdemVenda");
		},

		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onNavBack: function(oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				window.history.go(-1);
			}
		}
	});
});