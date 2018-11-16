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
	var vectorZonasArmazenamento = [];
	var vectorAreasArmazenamento  = [];

	return BaseController.extend("aplicacao.controller.AjusteInventarioFlowRack_1", {

		onInit: function() {
			this.getRouter().getRoute("AjusteInventarioFlowRack_1").attachPatternMatched(this._onRouteMatched, this);
		},

		onLoadZonasArmazenamento: function() {
			// var oModel = new sap.ui.model.json.JSONModel();
			var that = this;
			that.byId("idAreaArmazenamento").setBusy(true);
			this.getOwnerComponent().getModel("modelAux");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			oModel2.read("/AI_BuscaZonasArmazenamento?$filter=GvWerks eq '" + werks + "' and GvLgtyp eq '002'", {
				success: function(retornoT302) {
					vectorZonasArmazenamento = [];

					for (var i = 0; i < retornoT302.results.length; i++) {

						var entity = {
							Lgber: retornoT302.results[i].Lgber,
							Lbert: retornoT302.results[i].Lbert
						};

						vectorZonasArmazenamento.push(entity);
					}

					var oModel3 = new sap.ui.model.json.JSONModel(vectorZonasArmazenamento);
					that.getView().setModel(oModel3, "ZonasArmazenamento");
					that.byId("idAreaArmazenamento").setBusy(false);
				},
				error: function(error) {
					console.log(error);
					that.byId("idAreaArmazenamento").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});

		},

		onBuscaAreaArmazenagem: function(oEvent) {

			var that = this;
			
			that.byId("idTableAreasArmazenagem").setBusy(true);
			this.getOwnerComponent().getModel("modelAux");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");
			var zona = this.byId("idAreaArmazenamento").getSelectedKey();

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			oModel2.read("/AI_BuscaAreasArmazenamento?$filter=GvWerks eq '" + werks + "' and GvLgber eq '" + zona + "' and GvLgtyp eq '002'", {
				success: function(retornoAreasArmazenadas) {
					vectorAreasArmazenamento = [];

					for (var i = 0; i < retornoAreasArmazenadas.results.length; i++) {

						var icone = "";
						var status = "";
						var statusText = "";
						
						var statusInventario = retornoAreasArmazenadas.results[i].Skzsi;
						
						if(statusInventario == "true"){
							
							statusText = "Ativo";
							icone = "sap-icon://accept";
							status = "Success";
							
						}else{
							
							statusText = "Inativo";
							icone = "sap-icon://decline";
							status = "Error";
						}
						
						
						var entity = {
							Ivnum: retornoAreasArmazenadas.results[i].Ivnum,
							Skzsi: retornoAreasArmazenadas.results[i].Skzsi, //Inventário ativo ou Não!
							Lgpla: retornoAreasArmazenadas.results[i].Lgpla, //Posição do inventário
							GvLgber: retornoAreasArmazenadas.results[i].GvLgber,
							GvLgtyp: retornoAreasArmazenadas.results[i].GvLgtyp,
							GvWerks: retornoAreasArmazenadas.results[i].GvWerks,
							Lgber: retornoAreasArmazenadas.results[i].Lgber,
							Icone: icone,
							Status: status,
							StatusText: statusText
						};

						vectorAreasArmazenamento.push(entity);
					}

					var oModel3 = new sap.ui.model.json.JSONModel(vectorAreasArmazenamento);
					that.getView().setModel(oModel3, "AreasArmazenamento");
					that.byId("idTableAreasArmazenagem").setBusy(false);
				},
				error: function(error) {
					console.log(error);
					that.byId("idTableAreasArmazenagem").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});

		},
		
		onAtivarInventario: function(oEvent){
			
			var that = this;
			var oSelectedItem = this.byId("idTableAreasArmazenagem").getSelectedItems();
			for (var i = 0; i < oSelectedItem.length; i++) {
				var item1 = oSelectedItem[i].getCells();
				var NrInventario = item1[0].getText();
				var Lgpla = item1[1].getText();
				var Skzsi = item1[2].getText();
			}
			
			that.byId("idTableAreasArmazenagem").setBusy(true);
			this.getOwnerComponent().getModel("modelAux");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			oModel2.read("/AI_ModificarInventarios(GvWerks='" + werks + "',GvLgpla='" + Lgpla + "',GvLgtyp='002')", {
				success: function(retornoZonasArmazenadas) {
					
					that.byId("idTableAreasArmazenagem").setBusy(false);
					
					if(retornoZonasArmazenadas.EvRettyp == "E") {
						
						sap.m.MessageBox.show(
							retornoZonasArmazenadas.EvReturn, {
								icon: sap.m.MessageBox.Icon.WARNING,
								title: "Falha na Ativação do Inventário!",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {
									that.onBuscaAreaArmazenagem();
								}
							}
						);
				
					}else{
						
						sap.m.MessageBox.show(
							retornoZonasArmazenadas.EvReturn + ". Nº criado: " + retornoZonasArmazenadas.EvIvnum , {
								icon: sap.m.MessageBox.Icon.SUCCESS,
								title: "Ativação do Inventário!",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {
									that.onBuscaAreaArmazenagem();
								}
							}
						);
						
					}
				},
				error: function(error) {
					console.log(error);
					that.byId("idTableAreasArmazenagem").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});

		},
		
		onDesativarInventario: function(oEvent){
			
			var that = this;
			var oSelectedItem = this.byId("idTableAreasArmazenagem").getSelectedItems();
			for (var i = 0; i < oSelectedItem.length; i++) {
				var item1 = oSelectedItem[i].getCells();
				var NrInventario = item1[0].getText();
				var Lgpla = item1[1].getText();
				var Skzsi = item1[2].getText();
			}
			
			that.byId("idTableAreasArmazenagem").setBusy(true);
			this.getOwnerComponent().getModel("modelAux");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

				oModel2.read("/AI_DesativarInventarios(GvWerks='" + werks + "',GvIvnum='" + NrInventario + "')", {
				success: function(retorno) {
					
					if (retorno.EvRettyp == "E") {

						sap.m.MessageBox.show(
							retorno.EvReturn, {
								icon: sap.m.MessageBox.Icon.WARNING,
								title: "Falha na Desativação do Inventário!",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {
									that.onBuscaAreaArmazenagem();
								}
							}
						);
					} else {

						sap.m.MessageBox.show(
							retorno.EvReturn, {
								icon: sap.m.MessageBox.Icon.SUCCESS,
								title: "Desativação do Inventário!",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {
									that.onBuscaAreaArmazenagem();
								}
							}
						);
					}
					// that.onBuscaAreaArmazenagem();
					// that.byId("idTableAreasArmazenagem").setBusy(false);
					
				},
				error: function(error) {
					console.log(error);
					that.byId("idTableAreasArmazenagem").setBusy(false);
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
			
			this.onLimpaTela();

			this.onLoadZonasArmazenamento();

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

			vectorZonasArmazenamento = [];
			vectorAreasArmazenamento = [];
			this.byId("idAreaArmazenamento").setSelectedKey();
			this.byId("idTableAreasArmazenagem").setBusy(false);
			
			var oModel3 = new sap.ui.model.json.JSONModel(vectorZonasArmazenamento);
			this.getView().setModel(oModel3, "AreasArmazenamento");
		},

		onPress: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("listItem");
			var Receiving = oSelectedItem.getBindingContext("Recebimento").getProperty("Benum");
			this.getOwnerComponent().getModel("modelAux").setProperty("/Receiving", Receiving);

			var NT = oSelectedItem.getBindingContext("Recebimento").getProperty("Tbnum");
			this.getOwnerComponent().getModel("modelAux").setProperty("/NT", NT);

			var teste = this.getOwnerComponent().getModel("modelAux").getProperty("/NT");

			sap.ui.core.UIComponent.getRouterFor(this).navTo("EntradaMercadoria_2");
		},

		onNavBack: function() {
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