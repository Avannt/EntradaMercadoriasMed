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
	var vetorNT = [];

	return BaseController.extend("aplicacao.controller.MovFlowRack_1", {

		onInit: function() {
			this.getRouter().getRoute("MovFlowRack_1").attachPatternMatched(this._onRouteMatched, this);
		},
		
		onRefresh: function(){
			
			var that = this;
			this.byId("idTableNT").setBusy(true);
			this.getOwnerComponent().getModel("modelAux");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks"); 

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel2.setUseBatch(false);
			
			oModel2.read("/FR_BuscaNTPendente?$filter=IvWerks eq '" + werks + "'", {
				success: function(retornoNTPendentes) {
					vetorNT = [];
					console.log(retornoNTPendentes);

					for (var i = 0; i < retornoNTPendentes.results.length; i++) {
						
						var auxConcluido = retornoNTPendentes.results[i].Concluido;
						
						// if(auxConcluido == ""){
						// 	auxConcluido = "false";
						// }else{
						// 	auxConcluido = "true";
						// }
						
						var item = {
							Lgnum: retornoNTPendentes.results[i].Lgnum,
							Maktg: retornoNTPendentes.results[i].Maktg,
							Matnr: retornoNTPendentes.results[i].Matnr,
							Meins: retornoNTPendentes.results[i].Meins,
							Menge: retornoNTPendentes.results[i].Menge,
							Tbnum: retornoNTPendentes.results[i].Tbnum,
							Tbpos: retornoNTPendentes.results[i].Tbpos,
							Werks: retornoNTPendentes.results[i].Werks,
							Charg: retornoNTPendentes.results[i].Charg,
							Concluido: auxConcluido
						};

						vetorNT.push(item);
					}

					var oModel3 = new sap.ui.model.json.JSONModel(vetorNT);
					that.getView().setModel(oModel3, "RecebimentoNT_FR");
					that.byId("idTableNT").setBusy(false);
				},
				error: function(error) {
					console.log(error);
					that.byId("idTableNT").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});
		
		},

		_onRouteMatched: function(oEvent) {
			// var oModel = new sap.ui.model.json.JSONModel("model/Movimentacao.json");
			
			var that = this;
			
			var oModel1 = new sap.ui.model.json.JSONModel({
				Matnr: "",
				Maktg: "",
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
			this.getOwnerComponent().setModel(oModel1, "modelNT_FR");

			
			// setTimeout(function() {
			 	// that.byId("idInputReceiving").focus();
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
			
			this.byId("idTableNT").getBinding("items").filter(aFilters, "Application");
		},

		onLimpaTela: function() {

			vetorNT = [];
			this.byId("idInputReceiving").setValue();
			this.byId("idTableRecebimento").setBusy(false);

			var oModel1 = new sap.ui.model.json.JSONModel(vetorNT);
			this.getView().setModel(oModel1, "Recebimento");
		},

		onPress: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("listItem");
			var Matnr = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Matnr"); // Nr Material
			var Maktg = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Maktg");
			var Tbnum = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Tbnum"); // NR item nt
			var Tbpos = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Tbpos");
			var Menge = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Menge"); // Quantidade Recebida
			var Charg = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Charg"); // lote
			var Lgnum = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Lgnum"); // Nr deposito
			var Meins = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Meins"); // Unidade Medida básica
			var Werks = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Werks"); // Centro
			var Concluido = oSelectedItem.getBindingContext("RecebimentoNT_FR").getProperty("Concluido"); // Centro

			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Matnr", Matnr); // Nr Material
			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Maktg", Maktg); // Desc Material
			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Tbnum", Tbnum); // NR item nt
			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Tbpos", Tbpos); //NT
			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Menge", Menge); // Quantidade Recebida
			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Charg", Charg); // lote
			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Lgnum", Lgnum); // Nr deposito
			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Meins", Meins); // Unidade Medida básica
			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Werks", Werks); // Centro
			this.getOwnerComponent().getModel("modelNT_FR").setProperty("/Concluido", Concluido); // Centro
			
			this.getOwnerComponent().getModel("modelAux").setProperty("/Matnr", Matnr); // Nr Material
			this.getOwnerComponent().getModel("modelAux").setProperty("/Charg", Charg); // lote

			sap.ui.core.UIComponent.getRouterFor(this).navTo("MovFlowRack_2");
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