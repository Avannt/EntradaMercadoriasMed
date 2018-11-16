sap.ui.define([
	"aplicacao/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/Device"
], function(BaseController, Controller, MessageBox, MessageToast, JSONModel, DateFormat, Device) {

	"use strict";
	var vectorReceivingPending = [];
	return BaseController.extend("aplicacao.controller.EntradaMercadoria_2", {

		onInit: function() {
			this.getRouter().getRoute("EntradaMercadoria_2").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			
			// var oModelRemessa = new sap.ui.model.json.JSONModel("model/Movimentacao.json");
			// this.getView().setModel(oModelRemessa, "ItensRemessa");
			var that = this;
			this.byId("tableItensNT").setBusy(true);
			var Receiving = this.getOwnerComponent().getModel("modelAux").getProperty("/Receiving");
			var NT = this.getOwnerComponent().getModel("modelAux").getProperty("/NT");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

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
			this.getOwnerComponent().setModel(oModel1, "modelItemPendente");

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel2.read("/BuscaItensRecebimento?$filter=Gv_Nt eq '" + NT + "' and Gv_Werks eq '" + werks + "'", {
				success: function(retornoReceivingItens) {
					vectorReceivingPending = [];

					for (var i = 0; i < retornoReceivingItens.results.length; i++) {

						var concluido = retornoReceivingItens.results[i].Concluido;
						if (concluido == "X") {
							var icone = "sap-icon://accept";
							var status = "Success";

						} else {
							icone = "sap-icon://pending";
							status = "None";
						}

						var entity = {
							id: retornoReceivingItens.results[i].Gv_Nt,
							Matnr: retornoReceivingItens.results[i].Matnr, // Nr material
							Tbpos: retornoReceivingItens.results[i].Tbpos, //Nr NT
							Tbnum: retornoReceivingItens.results[i].Tbnum, //Nr Item NT
							Menge: retornoReceivingItens.results[i].Menge, //Quantidade Recebida
							Charg: retornoReceivingItens.results[i].Charg, //lote
							Lgnum: retornoReceivingItens.results[i].Lgnum, // Nr deposito
							Mblnr: retornoReceivingItens.results[i].Mblnr, // Nr Documento Material
							Meins: retornoReceivingItens.results[i].Meins, // Unidade Medida básica
							Mjahr: retornoReceivingItens.results[i].Mjahr, //Ano documento material
							Werks: retornoReceivingItens.results[i].Werks, //Centro
							icone: icone,
							status: status,
							Concluido: retornoReceivingItens.results[i].Concluido,
							Maktg: retornoReceivingItens.results[i].Maktg,
							Lifnr: that.getOwnerComponent().getModel("modelAux").getProperty("/codFornecedor"),
							Name1: that.getOwnerComponent().getModel("modelAux").getProperty("/nomeFornecedor")
								//ADICIONAR NLTYP - TIPO DE DEPOSITO DESTINO
								// tipo_dep_destino: retornoReceivingItens.results[i].NLTYP
						};

						vectorReceivingPending.push(entity);
					}

					var oModel3 = new sap.ui.model.json.JSONModel(vectorReceivingPending);
					that.getView().setModel(oModel3, "RecebimentoPendente");

					that.byId("tableItensNT").setBusy(false);

					// that.byId("idTableRecebimento").setBusy(false);
				},
				error: function(error) {
					console.log(error);
					that.byId("tableItensNT").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});

		},

		onAfterRendering: function() {

		},

		onPress: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("listItem");
			var Matnr = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Matnr"); // Nr Material
			var Charg = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Charg"); // lote
			var Tbpos = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Tbpos"); // Nr NT
			var Tbnum = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Tbnum"); // NR item nt
			var Menge = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Menge"); // Quantidade Recebida
			var Lgnum = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Lgnum"); // Nr deposito
			var Mblnr = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Mblnr"); // Nr Documento Material
			var Meins = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Meins"); // Unidade Medida básica
			var Mjahr = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Mjahr"); // Ano documento material
			var Werks = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Werks"); // Centro
			var Concluido = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Concluido"); // Centro
			var Maktg = oSelectedItem.getBindingContext("RecebimentoPendente").getProperty("Maktg");

			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Matnr", Matnr); // Nr Material
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Charg", Charg); // lote
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Maktg", Maktg); // Nr Material
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Tbpos", Tbpos); // Nr NT
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Tbnum", Tbnum); // NR item nt
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Menge", Menge); // Quantidade Recebida
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Lgnum", Lgnum); // Nr deposito
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Mblnr", Mblnr); // Nr Documento Material
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Meins", Meins); // Unidade Medida básica
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Mjahr", Mjahr); // Ano documento material
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Werks", Werks); // Centro
			this.getOwnerComponent().getModel("modelItemPendente").setProperty("/Concluido", Concluido); // Centro

			sap.ui.core.UIComponent.getRouterFor(this).navTo("EntradaMercadoria_3");
		},

		onNavBack: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("EntradaMercadoria_1");
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

		onGerarOT: function() {
			var that = this;
			var NT = this.getOwnerComponent().getModel("modelAux").getProperty("/NT");
			// var Tbnum = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbnum"); // NR item nt
			that.byId("detail").setBusy(true);

			var oModel3 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			var pendente = false;
			var temItemConcluido = false;
			var tipoDeposito = "";

			for (var i = 0; i < vectorReceivingPending.length; i++) {

				tipoDeposito = vectorReceivingPending[i].Lgnum;

				if (vectorReceivingPending[i].Concluido == "") {
					pendente = true;
				}else{
					temItemConcluido = true;
				}
			}

			if (pendente == false) {

				oModel3.read("/GerarOT(Tbnum='" + NT + "',Lgnum='" + tipoDeposito + "')", {
					success: function(retornoOT) {

						if (retornoOT.Retorno == "OK") {

							sap.m.MessageBox.show(
								"Nº OT: " + retornoOT.Tanum + " criado com sucesso!", {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "O.T. gerada!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("detail").setBusy(false);
										sap.ui.core.UIComponent.getRouterFor(that).navTo("EntradaMercadoria_1");
									}
								}
							);

						} else {

							sap.m.MessageBox.show(
								"Falha ao gerar OT! ", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Falha criação OT!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("detail").setBusy(false);
									}
								}
							);
						}
					},
					error: function(error) {
						console.log(error);
						that.byId("detail").setBusy(false);
						that.onMensagemErroODATA(error.response.statusCode);
					}
				});

			} else {
				
				if(temItemConcluido == true){
					
					sap.m.MessageBox.show(
						"Deseja gerar uma NT parcial ?", {
							icon: sap.m.MessageBox.Icon.QUESTION,
							title: "Itens NT Pendente!",
							actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
							onClose: function(oAction) {
								if (oAction === sap.m.MessageBox.Action.YES) {
									
									oModel3.read("/GerarOT(Tbnum='" + NT + "',Lgnum='" + tipoDeposito + "')", {
										success: function(retornoOT) {
	
											if (retornoOT.Retorno === "OK") {
	
												sap.m.MessageBox.show(
													"Nº OT: " + retornoOT.Tanum + " criado com sucesso!", {
														icon: sap.m.MessageBox.Icon.SUCCESS,
														title: "O.T. gerada!",
														actions: [sap.m.MessageBox.Action.OK],
														onClose: function() {
															that.byId("detail").setBusy(false);
															sap.ui.core.UIComponent.getRouterFor(that).navTo("EntradaMercadoria_1");
														}
													}
												);
	
											} else {
	
												sap.m.MessageBox.show(
													"Falha ao gerar OT! ", {
														icon: sap.m.MessageBox.Icon.WARNING,
														title: "Falha criação OT!",
														actions: [sap.m.MessageBox.Action.OK],
														onClose: function() {
															that.byId("detail").setBusy(false);
														}
													}
												);
											}
										},
										error: function(error) {
											console.log(error);
											that.byId("detail").setBusy(false);
											that.onMensagemErroODATA(error.response.statusCode);
										}
									});
								} else {
									that.byId("detail").setBusy(false);
								}
							}
						}
					);
				}else{
					sap.m.MessageBox.show(
						"Precisa ser concluído pelo menos um item.", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Itens incompletos!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								that.byId("detail").setBusy(false);
							}
						}
					);
				}
			}
		}
	});
});