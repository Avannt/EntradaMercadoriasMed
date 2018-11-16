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
	var vectorReceiving = [];

	return BaseController.extend("aplicacao.controller.EntradaMercadoria_1", {

		onInit: function() {
			this.getRouter().getRoute("EntradaMercadoria_1").attachPatternMatched(this._onRouteMatched, this);
		},
		
		onRefresh: function(){
				// var oModel = new sap.ui.model.json.JSONModel();
			var that = this;
			that.byId("idTableRecebimento").setBusy(true);
			this.getOwnerComponent().getModel("modelAux");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks"); 

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel2.setUseBatch(false);

			oModel2.read("/BuscaRecebimentos?$filter=Gv_Nr_Recebimento eq ' ' and Gv_Werks eq '" + werks + "'", {
				success: function(retornoCabecalho) {
					vectorReceiving = [];

					for (var i = 0; i < retornoCabecalho.results.length; i++) {

						var entity = {
							Tbnum: retornoCabecalho.results[i].Tbnum,
							Benum: retornoCabecalho.results[i].Benum,
							Name1: retornoCabecalho.results[i].Name1,
							Lifnr: retornoCabecalho.results[i].Lifnr
						};

						vectorReceiving.push(entity);
					}

					var oModel3 = new sap.ui.model.json.JSONModel(vectorReceiving);
					that.getView().setModel(oModel3, "Recebimento");
					that.byId("idTableRecebimento").setBusy(false);
				},
				error: function(error) {
					console.log(error);
					that.byId("idTableRecebimento").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});
		},

		_onRouteMatched: function(oEvent) {
			// var oModel = new sap.ui.model.json.JSONModel("model/Movimentacao.json");
			
			var that = this;
			
			// setTimeout(function() {
			// 	that.byId("idInputReceiving").focus();
			// }, 1000);

			// this.onLimpaTela();
			var oModel1 = new sap.ui.model.json.JSONModel({
				qntUN: "",
				qntCaixa: "",
				qntProposta: "",
				un: ""
			});

			this.getOwnerComponent().setModel(oModel1, "modelSeparacaoCaixas");
			
			this.onRefresh();
		},

		onAfterRendering: function() {

		},

		onReceivingSearch: function(oEvent) {
			
			var sValue = oEvent.getSource().getValue();
			var aFilters = [];
			var oFilter = [new sap.ui.model.Filter("Benum", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Tbnum", sap.ui.model.FilterOperator.Contains, sValue)
			];
	
			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			
			this.byId("idTableRecebimento").getBinding("items").filter(aFilters, "Application");
		},

		onLimpaTela: function() {

			vectorReceiving = [];
			this.byId("idInputReceiving").setValue();
			this.byId("idTableRecebimento").setBusy(false);

			var oModel1 = new sap.ui.model.json.JSONModel(vectorReceiving);
			this.getView().setModel(oModel1, "Recebimento");
		},

		onPress: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("listItem");
			var Receiving = oSelectedItem.getBindingContext("Recebimento").getProperty("Benum");
			this.getOwnerComponent().getModel("modelAux").setProperty("/Receiving", Receiving);

			var NT = oSelectedItem.getBindingContext("Recebimento").getProperty("Tbnum");
			this.getOwnerComponent().getModel("modelAux").setProperty("/NT", NT);
			
			var Lifnr = oSelectedItem.getBindingContext("Recebimento").getProperty("Lifnr");
			this.getOwnerComponent().getModel("modelAux").setProperty("/codFornecedor", Lifnr);
			
			var Name = oSelectedItem.getBindingContext("Recebimento").getProperty("Name1");
			this.getOwnerComponent().getModel("modelAux").setProperty("/nomeFornecedor", Name);
			


			var teste = this.getOwnerComponent().getModel("modelAux").getProperty("/NT");

			sap.ui.core.UIComponent.getRouterFor(this).navTo("EntradaMercadoria_2");
		},
		
		onNavBack: function(){
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Menu");
		},

		onMensagemErroODATA: function(codigoErro) {

			if (codigoErro == 0) {
				sap.m.MessageBox.show(
					"Verifique a conexão com a internet!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Falha na Conexão!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {

						}
					}
				);
			} else if (codigoErro == 400) {
				sap.m.MessageBox.show(
					"Url mal formada! Contate a consultoria!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Erro no programa Fiori!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {

						}
					}
				);
			} else if (codigoErro == 403) {
				sap.m.MessageBox.show(
					"Usuário sem autorização para executar a função (403)! Contate a consultoria!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Erro no programa Abap!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {

						}
					}
				);
			} else if (codigoErro == 404) {
				sap.m.MessageBox.show(
					"Função não encontrada e/ou Parâmentros inválidos  (404)! Contate a consultoria!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Erro no programa Abap!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {

						}
					}
				);
			} else if (codigoErro == 500) {
				sap.m.MessageBox.show(
					"Ocorreu um Erro (500)! Contate a consultoria!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Erro no programa Abap!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {

						}
					}
				);
			} else if (codigoErro == 501) {
				sap.m.MessageBox.show(
					"Função não implementada (501)! Contate a consultoria!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Erro no programa Abap!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {

						}
					}
				);
			}
		}
	});
});