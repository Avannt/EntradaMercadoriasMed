sap.ui.define([
	"aplicacao/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/m/UploadCollectionParameter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(BaseController, Controller, MessageBox, MessageToast, DateFormat, UploadCollectionParameter,
	JSONModel, Device) {

	"use strict";
	var vetorItensInseridos = [];

	return BaseController.extend("aplicacao.controller.AjusteInventarioSuperEstoque_2", {

		onInit: function() {
			this.getRouter().getRoute("AjusteInventarioSuperEstoque_2").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var that = this;

			var BotaoIndividual = "false";

			vetorItensInseridos = [];
			var oModel4 = new sap.ui.model.json.JSONModel(vetorItensInseridos);
			that.getView().setModel(oModel4, "ItensGuardados");

			this.byId("idInputEtiqueta").setValue();
			this.byId("idTableItens").setBusy(true);
			this.onLoadItensInseridos();
		},

		onLoadItensInseridos: function() {

			var that = this;
			var Ivnum = this.getOwnerComponent().getModel("modelAux").getProperty("/Ivnum"); //Nr Inventário
			var IvWerks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel3 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			oModel3.read("/AISE_BuscaItensInventario?$filter=IvWerks eq '" + IvWerks + "' and IvIvnum eq '" + Ivnum + "'", {
				success: function(retorno) {
					vetorItensInseridos = [];

					for (var i = 0; i < retorno.results.length; i++) {

						var statusInventario = retorno.results[i].Efetivado;

						if (statusInventario == "true") {

							var StatusText = "Efetivado";
							var Icone = "sap-icon://accept";
							var Status = "Success";

						} else {

							StatusText = "Não Efetivado";
							Icone = "sap-icon://decline";
							Status = "Error";
						}

						var aux = {
							Ident: parseInt(retorno.results[i].Ident),
							Lgnum: retorno.results[i].Lgnum,
							Ivnum: retorno.results[i].Ivnum,
							Matnr: retorno.results[i].Matnr,
							Charg: retorno.results[i].Charg,
							Vemng: retorno.results[i].Vemng,
							Barcode: retorno.results[i].Barcode,
							Efetivado: retorno.results[i].Efetivado,
							Icone: Icone,
							StatusText: StatusText,
							Status: Status
						};

						vetorItensInseridos.push(aux);

					}

					var oModel1 = new sap.ui.model.json.JSONModel(vetorItensInseridos);
					that.getView().setModel(oModel1, "ItensGuardados");

					that.byId("idTableItens").setBusy(false);
					that.byId("idInputEtiqueta").focus();

				},
				error: function(error) {
					console.log(error);
					that.byId("idTableItens").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});
		},

		onAfterRendering: function() {

		},

		onBeepItens: function() {
			var that = this;

			that.byId("idTableItens").setBusy(true);

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			var IvWerks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");
			var IvBarcode = this.byId("idInputEtiqueta").getValue();
			var IvIvnum = this.getOwnerComponent().getModel("modelAux").getProperty("/Ivnum");
			var IvMatnr = this.getOwnerComponent().getModel("modelAux").getProperty("/IvMatnr");

			oModel2.read("/AISE_InserirItensInventario(IvBarcode='" + IvBarcode + "',IvIvnum='" + IvIvnum + "',IvMatnr='" + IvMatnr +
				"',IvWerks='" + IvWerks + "')", {
					success: function(retorno) {

						if (retorno.EvRettyp == "E") {

							sap.m.MessageBox.show(
								retorno.EvReturn, {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Falha na Inserção de Itens no Inventário!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("idTableItens").setBusy(false);
										that.onLoadItensInseridos();

									}
								}
							);
						} else if (retorno.EvRettyp == "S") {

							MessageToast.show(retorno.EvReturn);
							that.byId("idInputEtiqueta").setValue();
							that.byId("idInputEtiqueta").focus();
							that.onLoadItensInseridos();
						}
					},
					error: function(error) {
						console.log(error);
						that.byId("idTableItens").setBusy(false);
						that.onMensagemErroODATA(error.response.statusCode);
					}
				});
		},

		onBarcodeOpen1: function() {
			var that = this;
			var teste = window.parent;
			var code = "";

			if (window.parent.cordova.plugins.barcodeScanner) {

				window.parent.cordova.plugins.barcodeScanner.scan(

					function(result) {

						code = result.text;
						that.byId("idInputEtiqueta").setValue(code);
						that.onBeepItens();

					},

					function(error) {
						MessageToast.show("Erro ao tentar ler código de barras.");
					}
				);
			} else {
				alert("Não encontrou o plugin");
			}
		},

		onDelete: function(oEvent) {
			var that = this;
			var oSelectedItem = oEvent.getParameter("listItem");

			this.byId("idTableItens").setBusy(true);
			var Ivnum = String(oSelectedItem.getBindingContext("ItensGuardados").getProperty("Ivnum"));
			var Barcode = oSelectedItem.getBindingContext("ItensGuardados").getProperty("Barcode");
			var Efetivado = oSelectedItem.getBindingContext("ItensGuardados").getProperty("Efetivado");
			var Ident = oSelectedItem.getBindingContext("ItensGuardados").getProperty("Ident");
			var IvWerks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			if (Efetivado == "X") {

				sap.m.MessageBox.show(
					"Esta operação já foi finalizada! Impossível remover os itens!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Operação Inválida!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idTableItens").setBusy(false);
						}
					}
				);

			} else {

				sap.m.MessageBox.show(
					"Deseja mesmo deletar?", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Deletar!",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.ABORT],
						onClose: function(oAction) {
							if (oAction == sap.m.MessageBox.Action.YES) {

								oModel2.remove("/AISE_DeletarItensInventario(IvIvnum='" + Ivnum + "',IvBarcode='" + Barcode + "',IvIdent='" + Ident +
									"',IvWerks='" + IvWerks + "')", {
										success: function(retorno) {

											that.onLoadItensInseridos();
											MessageToast.show("Código de Barras Removido!");
											that.byId("idTableItens").setBusy(false);

										},
										error: function(error) {
											console.log(error);
											that.byId("idTableItens").setBusy(false);
											that.onMensagemErroODATA(error.response.statusCode);
										}
									});
							}

						}
					}
				);

			}
		},

		onFinalizarInventario: function() {

			var that = this;
			that.byId("idTableItens").setBusy(true);
			var Ivnum = this.getOwnerComponent().getModel("modelAux").getProperty("/Ivnum"); //Nr Inventário
			var Lgpla = that.getOwnerComponent().getModel("modelAux").getProperty("/Lgpla"); 
			var Lgtyp = "001";
			var Lqnum = that.getOwnerComponent().getModel("modelAux").getProperty("/Lqnum");
			var IvWerks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel3 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			oModel3.read("/AISE_FinalizarInventarios(IvWerks='" + IvWerks + "',IvIvnum='" + Ivnum + "',IvLqnum='" + Lqnum
				+ "',IvLgpla='" + Lgpla + "',IvLgtyp='" + Lgtyp + "')", {
				success: function(retorno) {
					
						if (retorno.EvRettyp == "E") {

							sap.m.MessageBox.show(
								retorno.EvReturn, {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Falha Finalização do inventário!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("idTableItens").setBusy(false);
										

									}
								}
							);
						} else if (retorno.EvRettyp == "S") {

							MessageToast.show(retorno.EvReturn);
							that.byId("idTableItens").setBusy(false);
						}
					

				},
				error: function(error) {
					console.log(error);
					that.byId("idTableItens").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});

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