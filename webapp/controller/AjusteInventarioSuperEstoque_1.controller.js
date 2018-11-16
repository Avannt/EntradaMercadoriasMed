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
	var vectorAreasArmazenamento = [];

	return BaseController.extend("aplicacao.controller.AjusteInventarioSuperEstoque_1", {

		onInit: function() {
			this.getRouter().getRoute("AjusteInventarioSuperEstoque_1").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var that = this;

			this.onLimpaTela();

		},

		onBarcodeOpen: function() {
			var that = this;
			var code = "";

			if (window.parent.cordova.plugins.barcodeScanner) {

				window.parent.cordova.plugins.barcodeScanner.scan(

					function(result) {

						code = result.text;
						that.byId("idInputPosicao").setValue(code);
						that.onLoadaAreasArmazenamentoSuperEstoque();

					},

					function(error) {
						sap.m.MessageToast.show("Erro ao tentar ler código de barras.");
					}
				);
			} else {
				alert("Não encontrou o plugin");
			}
		},

		onLoadaAreasArmazenamentoSuperEstoque: function() {
			var that = this;
			that.byId("idTableItensMateriais").setBusy(true);
			
			this.getOwnerComponent().getModel("modelAux");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");
			var posicao = this.byId("idInputPosicao").getValue();
			that.getOwnerComponent().getModel("modelAux").setProperty("/Lgpla", posicao);

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			oModel2.read("/AISE_AreasArmazenamentos?$filter=IvWerks eq '" + werks + "' and IvLgtyp eq '001'" + " and IvLgpla eq '" +
				posicao + "'", {
					success: function(retorno) {
						vectorAreasArmazenamento = [];

						for (var i = 0; i < retorno.results.length; i++) {

							var statusInventario = retorno.results[i].Skzsi;

							if (statusInventario == "true") {

								var StatusText = "Ativo";
								var Icone = "sap-icon://accept";
								var Status = "Success";

							} else {

								StatusText = "Inativo";
								Icone = "sap-icon://decline";
								Status = "Error";
							}

							var entity = {
								id: retorno.results[i].Iditem,
								Lgber: retorno.results[i].Lgber,
								Lbert: retorno.results[i].Lbert,
								Maktx: retorno.results[i].Maktx,
								Lgnum: retorno.results[i].Lgnum,
								Lqnum: retorno.results[i].Lqnum,
								Matnr: retorno.results[i].Matnr,
								Werks: retorno.results[i].Werks,
								Charg: retorno.results[i].Charg,
								Lgtyp: retorno.results[i].Lgtyp,
								Lgpla: retorno.results[i].Lgpla,
								Plpos: retorno.results[i].Plpos,
								Skzsi: retorno.results[i].Skzsi,
								Ivnum: retorno.results[i].Ivnum,
								Icone: Icone,
								StatusText: StatusText,
								Status: Status
							};

							vectorAreasArmazenamento.push(entity);
						}

						var oModel3 = new sap.ui.model.json.JSONModel(vectorAreasArmazenamento);
						that.getView().setModel(oModel3, "AreasArmazenamentoSuperEstoque");
						that.byId("idTableItensMateriais").setBusy(false);
					},
					error: function(error) {
						console.log(error);
						that.byId("idTableItensMateriais").setBusy(false);
						that.onMensagemErroODATA(error.response.statusCode);
					}
				});
		},

		onLimpaTela: function() {

			vectorAreasArmazenamento = [];
			this.byId("idInputPosicao").setValue();
			this.byId("idTableItensMateriais").setBusy(false);

			var oModel3 = new sap.ui.model.json.JSONModel(vectorAreasArmazenamento);
			this.getView().setModel(oModel3, "AreasArmazenamentoSuperEstoque");
		},

		onPress: function(oEvent) {
			var that = this;
			var oSelectedItem = oEvent.getParameter("listItem");
			var nrInventario = oSelectedItem.getBindingContext("AreasArmazenamentoSuperEstoque").getProperty("Ivnum");
			var Matnr = oSelectedItem.getBindingContext("AreasArmazenamentoSuperEstoque").getProperty("Matnr");
			var ativo = oSelectedItem.getBindingContext("AreasArmazenamentoSuperEstoque").getProperty("Skzsi");
			var Lqnum = oSelectedItem.getBindingContext("AreasArmazenamentoSuperEstoque").getProperty("Lqnum");
			
			if(ativo == "true"){
				
				this.getOwnerComponent().getModel("modelAux").setProperty("/IvMatnr", Matnr);
				this.getOwnerComponent().getModel("modelAux").setProperty("/Ivnum", nrInventario);
				this.getOwnerComponent().getModel("modelAux").setProperty("/Lqnum", Lqnum);
				sap.ui.core.UIComponent.getRouterFor(this).navTo("AjusteInventarioSuperEstoque_2");
				
			}else if(ativo == "false"){
				
				sap.m.MessageBox.show(
					"Ative o inventário!" , {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Não permitido!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.onLoadaAreasArmazenamentoSuperEstoque();
						}
					}
				);
			}
			
			
		},

		onAtivarInventario: function(oEvent) {

			var that = this;
			var oSelectedItem = this.byId("idTableItensMateriais").getSelectedItems();
			for (var i = 0; i < oSelectedItem.length; i++) {
				var item1 = oSelectedItem[i].getCells();
				var Ivnum = item1[0].getText();
				var Charg = item1[1].getText();
				var campo2 = item1[2].getText();
				var campo3 = item1[3].getText();
				var Lqnum = item1[4].getText();
				var Lgpla = item1[5].getText();

			}

			that.byId("idTableItensMateriais").setBusy(true);
			this.getOwnerComponent().getModel("modelAux");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			oModel2.read("/AISE_ModificarInventarios(IvWerks='" + werks + "',IvLqnum='" + Lqnum + "',IvLgpla='" + Lgpla + "',IvLgtyp='001')", {
				success: function(retorno) {

					that.byId("idTableItensMateriais").setBusy(false);

					if (retorno.EvRettyp == "E") {

						sap.m.MessageBox.show(
							retorno.EvReturn, {
								icon: sap.m.MessageBox.Icon.WARNING,
								title: "Falha na Ativação do Inventário!",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {
									that.onLoadaAreasArmazenamentoSuperEstoque();
								}
							}
						);
					} else {

						sap.m.MessageBox.show(
							retorno.EvReturn + ". Nº criado: " + retorno.EvIvnum, {
								icon: sap.m.MessageBox.Icon.SUCCESS,
								title: "Ativação do Inventário!",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {
									that.onLoadaAreasArmazenamentoSuperEstoque();
								}
							}
						);

					}
				},
				error: function(error) {
					console.log(error);
					that.byId("idTableItensMateriais").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});

		},

		onDesativarInventario: function(oEvent) {

			var that = this;
			var oSelectedItem = this.byId("idTableItensMateriais").getSelectedItems();
			
			for (var i = 0; i < oSelectedItem.length; i++) {
				var item1 = oSelectedItem[i].getCells();
				var Ivnum = item1[0].getText();
				var Charg = item1[1].getText();
				var campo2 = item1[2].getText();
				var campo3 = item1[3].getText();
				var Lqnum = item1[4].getText();
				var Lgpla = item1[5].getText();

			}

			that.byId("idTableItensMateriais").setBusy(true);
			this.getOwnerComponent().getModel("modelAux");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			oModel2.read("/AISE_DesativarInventarios(IvWerks='" + werks + "',IvIvnum='" + Ivnum + "')", {
				success: function(retorno) {
					
					if (retorno.EvRettyp == "E") {

						sap.m.MessageBox.show(
							retorno.EvReturn, {
								icon: sap.m.MessageBox.Icon.WARNING,
								title: "Falha na Ativação do Inventário!",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {
									that.onLoadaAreasArmazenamentoSuperEstoque();
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
									that.onLoadaAreasArmazenamentoSuperEstoque();
								}
							}
						);
					}
				},
				error: function(error) {
					console.log(error);
					that.byId("idTableItensMateriais").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});

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