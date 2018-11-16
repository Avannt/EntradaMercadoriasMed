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

	return BaseController.extend("aplicacao.controller.EntradaMercadoria_3", {

		onInit: function() {
			this.getRouter().getRoute("EntradaMercadoria_3").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {

			var that = this;

			var Matnr = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Matnr"); // Nr Material
			var DescMatnr = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Maktg");

			this.byId("idMaterial").setValue(Matnr + "-" + DescMatnr);

			var Menge = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Menge"); // Quantidade Recebida

			if (Menge != "") {
				Menge = parseInt(Menge);
			}

			var Lgnum = that.getOwnerComponent().getModel("modelAux").getProperty("/lgnum");
			// var Lgnum = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Lgnum"); // Nr deposito
			var Tbpos = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbpos"); // Nr NT
			var Tbnum = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbnum"); // NR item nt
			this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Charg"); // lote
			this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Mblnr"); // Nr Documento Material
			this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Meins"); // Unidade Medida básica
			this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Mjahr"); // Ano documento material
			this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Werks"); // Centro

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel2.setUseBatch(false);

			oModel2.read("/SeparacaoCaixas(GvNrDeposito='" + Lgnum + "',GvNrMaterial='" + Matnr + "',GvQtdFornecida=" + Menge + ")", {
				success: function(retornoSeparacao) {

					console.log(retornoSeparacao);

					var qntCaixa = parseFloat(retornoSeparacao.GvQtdCx);
					var qntUN = parseFloat(retornoSeparacao.GvQtdUnid);
					var qntProposta = parseFloat(retornoSeparacao.GvQtdCx);
					var qntFornecida = parseFloat(retornoSeparacao.GvQtdFornecida);
					var un = parseFloat(retornoSeparacao.GvQtdUnid);

					that.byId("idQtdCaixa").setValue(qntCaixa);
					that.byId("idQtdUN").setValue(qntUN);
					that.byId("idQtdProposta").setValue(qntProposta);
					that.byId("idUN").setValue(un);

					that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/qntCaixa", qntCaixa);
					that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/qntUN", qntUN);
					that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/qntProposta", qntProposta);
					that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/un", un);

					//checa se já foi setado uma quantidade para o item da NT
					oModel2.read("/GetCabecQntsTransf(IsTbnum='" + Tbnum + "',IsTbpos='" + Tbpos + "',IsLgnum='" + Lgnum + "')", {
						success: function(retornoCheckQUnt) {

							var valorBuscadoQntCaixa = retornoCheckQUnt.QtdeCx;
							var valorBuscadoQntUnid = retornoCheckQUnt.QtdeUnid;

							setTimeout(function() {
								that.byId("idQtdProposta").focus();
							}, 1000);

							if (retornoCheckQUnt.Retorno == 'OK') {

								valorBuscadoQntCaixa = parseInt(valorBuscadoQntCaixa);
								valorBuscadoQntUnid = parseInt(valorBuscadoQntUnid);

								that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/qntProposta", valorBuscadoQntCaixa);
								that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/un", valorBuscadoQntUnid);
								that.byId("idQtdProposta").setValue(valorBuscadoQntCaixa);
								that.byId("idUN").setValue(valorBuscadoQntUnid);

								oModel2.read("/GetQntsTransf/?$filter=IsTbnum eq '" + Tbnum + "' and IsTbpos eq '" + Tbpos + "' and IsLgnum eq '" +
									Lgnum + "'", {
										success: function(retornoItensInseridos) {

											if (retornoItensInseridos.results.length > 0) {
												that.byId("idQtdProposta").setEnabled(false);
												that.byId("idUN").setEnabled(false);

											} else {
												that.byId("idQtdProposta").setEnabled(true);
												that.byId("idUN").setEnabled(true);
											}
										},
										error: function(error) {
											console.log(error);
											that.onMensagemErroODATA(error.response.statusCode);
										}
									});

							} else if (retornoCheckQUnt.Retorno == 'VAZIO') {

								that.byId("idQtdProposta").setEnabled(true);
								that.byId("idUN").setEnabled(true);
							}
						},
						error: function(error) {
							console.log(error);
							that.onMensagemErroODATA(error.response.statusCode);
						}
					});
				},
				error: function(error) {
					console.log(error);
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
		},

		onAfterRendering: function() {

		},

		onQtdCaixas: function() {
			var that = this;

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "rcardilo",
				password: "sap123"
			});

			oModel2.setUseBatch(false);

			var GvLgnum = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Lgnum"); // Nr deposito
			var GvMatnr = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Matnr");
			var GvQtdeCx = parseFloat(this.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntCaixa"));
			var GvQtdeUnid = parseFloat(this.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntUN"));
			var GvQtdeFornecida = parseFloat(that.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntProposta"));
			var GvQtdeCxNovo = this.byId("idQtdProposta").getValue();

			if (GvQtdeCxNovo == "") {

				this.byId("idQtdProposta").setValue(GvQtdeCx);
				GvQtdeCxNovo = this.byId("idQtdProposta").getValue();
				GvQtdeCxNovo = parseInt(GvQtdeCxNovo);

			}
			if (GvQtdeCxNovo > GvQtdeCx) {

				this.byId("idQtdProposta").setValue(GvQtdeCx);

			} else {

				oModel2.read("/AjustaQtdCaixas(GvLgnum='" + GvLgnum + "',GvMatnr='" + GvMatnr + "',GvQtdeCx=" + GvQtdeCx +
					",GvQtdeUnid=" + GvQtdeUnid + ",GvQtdeFornecida=" + GvQtdeFornecida + ",GvQtdeCxNovo=" + GvQtdeCxNovo + ")", {
						success: function(retornoAjustaCaixas) {

							console.log(retornoAjustaCaixas);

							var qntProposta = parseFloat(retornoAjustaCaixas.GvQtdeCxNovo);
							that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/qntProposta", qntProposta);

							var un = parseFloat(retornoAjustaCaixas.GvQtdeUnidNovo);
							that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/un", un);

							that.byId("idQtdProposta").setValue(qntProposta);
							that.byId("idUN").setValue(un);

							console.log(qntProposta);
							console.log(un);
							// that.byId("idQtdCaixa").setValue(qntCaixa);
							// that.byId("idQtdProposta").setValue(qntProposta);
							// that.byId("idQtdUN").setValue(qntUN);
							// that.byId("idUN").setValue(un);

							// that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/qntUN", qntUN);
							// that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/qntCaixa", qntCaixa);
							// that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/qntProposta", qntProposta);
							// that.getOwnerComponent().getModel("modelSeparacaoCaixas").setProperty("/un", un);

						},
						error: function(error) {
							that.onMensagemErroODATA(error.response.statusCode);
						}
					});

			}

		},

		onPress: function() {
			var that = this;
			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});
			this.byId("detail").setBusy(true);
			var Lgnum = that.getOwnerComponent().getModel("modelAux").getProperty("/lgnum");
			var QtdeCx = parseInt(that.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntProposta"));
			var QtdeUnid = parseInt(that.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/un"));
			var Tbpos = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbpos"); // Nr NT
			var Tbnum = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbnum"); // NR item nt
			var Concluido = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Concluido");
			// if(Concluido == "X"){
			// 		Concluido = 1;
			// } else{
			// 		Concluido = 0;
			// }

			oModel2.read("/SetCabecQntsTransf(Tbnum='" + Tbnum + "',QtdeUnid=" + QtdeUnid + ",Lgnum='" + Lgnum + "',QtdeCx=" + QtdeCx +
				",Concluido='" + Concluido + "',Tbpos='" + Tbpos + "')", {
					success: function(retornoCheckQUnt) {

						that.byId("detail").setBusy(false);
						sap.ui.core.UIComponent.getRouterFor(that).navTo("EntradaMercadoria_4");

					},
					error: function(error) {
						console.log(error);
						that.onMensagemErroODATA(error.response.statusCode);
						that.byId("detail").setBusy(false);
					}
				});
		}
	});
});