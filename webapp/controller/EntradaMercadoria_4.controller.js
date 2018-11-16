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

	return BaseController.extend("aplicacao.controller.EntradaMercadoria_4", {

		onInit: function() {
			this.getRouter().getRoute("EntradaMercadoria_4").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var that = this;

			var BotaoIndividual = "false";

			vetorItensInseridos = [];

			this.byId("idTableItens").setBusy(true);

			var oModel4 = new sap.ui.model.json.JSONModel(vetorItensInseridos);
			this.getView().setModel(oModel4, "ItensGuardados");

			this.byId("idInputQuantidade").setValue(1);
			this.byId("idInputEtiqueta").setValue();
			this.byId("idInputPosicao").setValue();
			this.byId("idButtonIndividual").setEnabled(true);
			// this.byId("idButtonTotal").setEnabled(true);

			var Lgnum = this.getOwnerComponent().getModel("modelAux").getProperty("/lgnum");
			var Tbpos = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbpos"); // Nr NT
			var Tbnum = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbnum"); // NR item nt

			var concluido = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Concluido");

			if (concluido == "X") {

				// this.byId("idButtonTotal").setEnabled(false);
				this.byId("idButtonIndividual").setEnabled(false);

			} else {

				// this.byId("idButtonTotal").setEnabled(true);
				this.byId("idButtonIndividual").setEnabled(true); // habilita
			}

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			this.getView().setModel(oModel2);

			var oModel3 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel3.read("/GetQntsTransf/?$filter=IsTbnum eq '" + Tbnum + "' and IsTbpos eq '" + Tbpos + "' and IsLgnum eq '" + Lgnum + "'", {
				success: function(retornoItensInseridos) {

					if (retornoItensInseridos.results.length > 0) {

						for (var i = 0; i < retornoItensInseridos.results.length; i++) {

							if (retornoItensInseridos.results[i].Anfme == 1 && retornoItensInseridos.results.length > 0) {
								BotaoIndividual = true;
								// that.byId("idButtonTotal").setEnabled(false);

							} else if (retornoItensInseridos.results[i].Anfme > 1 && retornoItensInseridos.results.length > 0) {
								BotaoIndividual = false;
								that.byId("idButtonIndividual").setEnabled(false);
							} else {
								that.byId("idButtonIndividual").setEnabled(true);
								// that.byId("idButtonTotal").setEnabled(true);
							}

							console.log(retornoItensInseridos);
							//Sempre será o mesmo
							var tipoDeposito = retornoItensInseridos.results[i].Nltyp;

							var aux = {
								Tbnum: retornoItensInseridos.results[i].Tbnum, //Nº NT
								Tbpos: retornoItensInseridos.results[i].Tbpos, //Nr item NT
								Charg: retornoItensInseridos.results[i].Charg, //LOTE
								Posicao: retornoItensInseridos.results[i].Nlpla, //Posicao
								Barcode: retornoItensInseridos.results[i].Barcode, //Etiqueta
								Nltyp: retornoItensInseridos.results[i].Nltyp, //Tipo de Deposito
								QtdeCx: parseInt(retornoItensInseridos.results[i].Anfme), // Quantidade inserida,
								IdItem: parseInt(retornoItensInseridos.results[i].IdItem)
							};

							vetorItensInseridos.push(aux);

						}
						//Já foi selecionado um item com o tipo de depósito
						that.byId("idTiposDepositos").setSelectedKey(tipoDeposito);
						that.byId("idTiposDepositos").setEnabled(false);
						// that.byId("idInputEtiqueta").focus();

						var oModel = new sap.ui.model.json.JSONModel(vetorItensInseridos);
						that.getView().setModel(oModel, "ItensGuardados");

					} else {

						that.byId("idTiposDepositos").setEnabled(true);
					}

					that.byId("idTableItens").setBusy(false);

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

		// onBeepCxTotal: function() {
		// 	var that = this;
		// 	var concluido = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Concluido");
		// 	var Lgnum = that.getOwnerComponent().getModel("modelAux").getProperty("/lgnum");

		// 	if (this.byId("idInputEtiqueta").getValue() == "") {

		// 		sap.m.MessageBox.show(
		// 			"Preencher o campo 'Etiqueta'.", {
		// 				icon: sap.m.MessageBox.Icon.WARNING,
		// 				title: "Campo(s) em branco!",
		// 				actions: [sap.m.MessageBox.Action.OK],
		// 				onClose: function(oAction) {
		// 					that.byId("idInputEtiqueta").focus();

		// 				}
		// 			}
		// 		);
		// 	} else if (this.byId("idInputPosicao").getValue() == "") {

		// 		sap.m.MessageBox.show(
		// 			"Preencher o campo 'Posição'.", {
		// 				icon: sap.m.MessageBox.Icon.WARNING,
		// 				title: "Campo(s) em branco!",
		// 				actions: [sap.m.MessageBox.Action.OK],
		// 				onClose: function(oAction) {
		// 					that.byId("idInputPosicao").focus();

		// 				}
		// 			}
		// 		);
		// 	} else if (concluido == "X") {

		// 		sap.m.MessageBox.show(
		// 			"Itens Já finalizados. Impossivel inserir novos itens.", {
		// 				icon: sap.m.MessageBox.Icon.WARNING,
		// 				title: "Itens completos!",
		// 				actions: [sap.m.MessageBox.Action.OK],
		// 				onClose: function(oAction) {

		// 				}
		// 			}
		// 		);
		// 	} else {

		// 		that.byId("idTableItens").setBusy(true);

		// 		var oModel2 = new sap.ui.model.odata.ODataModel({
		// 			serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
		// 			user: "appadmin",
		// 			password: "sap123"
		// 		});

		// 		//Nova quantidade.
		// 		var GV_QTDE_CX = parseFloat(this.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntProposta"));

		// 		var GV_MEINS = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Meins");
		// 		var GV_MATNR = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Matnr"); // Nr Material
		// 		var GV_QTDE_UN = parseFloat(this.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/un"));
		// 		var GV_TBPOS = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbpos"); // Nr NT
		// 		var GV_TBNUM = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbnum"); // NR item nt
		// 		var GV_CHARG = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Charg"); // lote
		// 		var GV_LGNUM = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Lgnum"); // Nr deposito
		// 		var GV_BARCODE = this.byId("idInputEtiqueta").getValue();
		// 		var GV_POSICAO = this.byId("idInputPosicao").getValue();
		// 		var GV_NLTYP = this.byId("idTiposDepositos").getSelectedKey();
		// 		var GV_TOTAL = ""; //Esse parâmetro não é usado

		// 		GV_BARCODE = GV_BARCODE.replace("/", "|");

		// 		oModel2.read("/ChecaBarcodes(IvBarcode='" + GV_BARCODE + "')", {
		// 			success: function(retorno) {

		// 				var Matnr = that.getOwnerComponent().getModel("modelItemPendente").getProperty("/Matnr"); // Nr Material
		// 				var Charg = that.getOwnerComponent().getModel("modelItemPendente").getProperty("/Charg"); // lote

		// 				if (retorno.EvMatnr == Matnr && retorno.EvCharg == Charg) {

		// 					GV_CHARG = GV_CHARG.replace("/", "|");

		// 					oModel2.read("/BeepsCxTotal(Tbpos='" + GV_TBPOS + "',Tbnum='" + GV_TBNUM + "',Meins='" + GV_MEINS + "',Matnr='" + GV_MATNR +
		// 						"',QtdeCx=" + GV_QTDE_CX + ",Charg='" + GV_CHARG + "',Barcode='" + GV_BARCODE + "',Posicao='" + GV_POSICAO +
		// 						"',Nltyp='" + GV_NLTYP + "',Lgnum='" + GV_LGNUM + "')", {
		// 							success: function(retornoBeepCxTotal) {

		// 								if (retornoBeepCxTotal.Retorno == "OK") {

		// 									var aux = {
		// 										Charg: retornoBeepCxTotal.Charg,
		// 										Lgnum: retornoBeepCxTotal.Lgnum,
		// 										Nltyp: retornoBeepCxTotal.Nltyp,
		// 										Posicao: retornoBeepCxTotal.Posicao,
		// 										Retorno: retornoBeepCxTotal.Retorno,
		// 										Tbnum: retornoBeepCxTotal.Tbnum,
		// 										Tbpos: retornoBeepCxTotal.Tbpos,
		// 										Total: retornoBeepCxTotal.Total, //Não usa
		// 										QtdeCx: parseInt(retornoBeepCxTotal.QtdeCx),
		// 										IdItem: parseInt(retornoBeepCxTotal.IdItem)
		// 									};

		// 									vetorItensInseridos.push(aux);

		// 									var oModel3 = new sap.ui.model.json.JSONModel(vetorItensInseridos);
		// 									that.getView().setModel(oModel3, "ItensGuardados");
		// 									that.byId("idTableItens").setBusy(false);
		// 									that.byId("idButtonIndividual").setEnabled(false);
		// 									// that.byId("idButtonTotal").setEnabled(true);

		// 									oModel2.read("/BeepsUn(Tbpos='" + GV_TBPOS + "',Tbnum='" + GV_TBNUM + "',Meins='" + GV_MEINS + "',Matnr='" + GV_MATNR +
		// 										"',QtdeUnid=" + GV_QTDE_UN + ",Charg='" + GV_CHARG + "',Barcode='" + GV_BARCODE + "',Posicao='" + GV_POSICAO +
		// 										"',Nltyp='" + GV_NLTYP + "',Lgnum='" + GV_LGNUM + "')", {
		// 											success: function(retornoBeepUnidade) {
		// 												if (retornoBeepUnidade.Retorno == "OK") {

		// 													oModel2.read("/ItensConcluido(Tbpos='" + GV_TBPOS + "',Lgnum='" + Lgnum + "',Tbnum='" + GV_TBNUM + "')", {
		// 														success: function(retornoConcluido) {
		// 															if (retornoConcluido.Retorno == "OK") {

		// 																sap.m.MessageBox.show(
		// 																	"Mercadorias posicionadas com sucesso!", {
		// 																		icon: sap.m.MessageBox.Icon.SUCCESS,
		// 																		title: "Operação completa!",
		// 																		actions: [sap.m.MessageBox.Action.OK],
		// 																		onClose: function(oAction) {
		// 																			that.byId("idTableItens").setBusy(false);
		// 																			sap.ui.core.UIComponent.getRouterFor(that).navTo("EntradaMercadoria_2");
		// 																		}
		// 																	}
		// 																);
		// 															} else {
		// 																sap.m.MessageBox.show(
		// 																	"Falha ao setar item completo!", {
		// 																		icon: sap.m.MessageBox.Icon.WARNING,
		// 																		title: "Falha na operação!",
		// 																		actions: [sap.m.MessageBox.Action.OK],
		// 																		onClose: function(oAction) {
		// 																			that.byId("idTableItens").setBusy(false);
		// 																		}
		// 																	}
		// 																);
		// 															}
		// 														},
		// 														error: function(error) {
		// 															console.log(error);
		// 															that.byId("idTableItens").setBusy(false);
		// 															that.onMensagemErroODATA(error.response.statusCode);
		// 														}
		// 													});

		// 												} else {
		// 													sap.m.MessageBox.show(
		// 														"Falha ao adicionar as unidades !!", {
		// 															icon: sap.m.MessageBox.Icon.WARNING,
		// 															title: "Falha na alocação das unidades!",
		// 															actions: [sap.m.MessageBox.Action.OK],
		// 															onClose: function(oAction) {
		// 																that.byId("idTableItens").setBusy(false);
		// 															}
		// 														}
		// 													);
		// 												}
		// 											},
		// 											error: function(error) {
		// 												console.log(error);
		// 												that.byId("idTableItens").setBusy(false);
		// 												that.onMensagemErroODATA(error.response.statusCode);
		// 											}
		// 										});
		// 								} else {
		// 									sap.m.MessageBox.show(
		// 										retornoBeepCxTotal.Retorno, {
		// 											icon: sap.m.MessageBox.Icon.WARNING,
		// 											title: "Falha na Inserção de Itens no Inventário!",
		// 											actions: [sap.m.MessageBox.Action.OK],
		// 											onClose: function(oAction) {
		// 												that.byId("idTableItens").setBusy(false);

		// 											}
		// 										}
		// 									);
		// 								}

		// 							},
		// 							error: function(error) {
		// 								console.log(error);
		// 								that.byId("idTableItens").setBusy(false);
		// 								that.onMensagemErroODATA(error.response.statusCode);
		// 							}
		// 						});

		// 				} else {
		// 					sap.m.MessageBox.show(
		// 						"Código é diferente do material selecionado! ", {
		// 							icon: sap.m.MessageBox.Icon.WARNING,
		// 							title: "Falha na inserção do item!",
		// 							actions: [sap.m.MessageBox.Action.OK],
		// 							onClose: function(oAction) {
		// 								that.byId("idTableItens").setBusy(false);
		// 								that.byId("idInputPosicao").setValue();
		// 								that.byId("idInputEtiqueta").setValue();
		// 							}
		// 						}
		// 					);
		// 				}

		// 				that.byId("idTableItens").setBusy(false);

		// 			},
		// 			error: function(error) {
		// 				console.log(error);
		// 				that.byId("idTableItens").setBusy(false);
		// 				that.onMensagemErroODATA(error.response.statusCode);
		// 			}
		// 		});
		// 	}
		// },
		
		onBuscaMateriais: function(){
			var that = this;
			var Lgtyp = this.byId("idTiposDepositos").getSelectedKey();
			var Lgpla = this.byId("idInputPosicao").getValue();
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");
			
			var oModel3 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel3.read("/ListaMateriais/?$filter=IvLgpla eq '" + Lgpla + "' and IvLgtyp eq '" + Lgtyp + "' and IvWerks eq '" + werks + "'", {
				success: function(retornoItensInseridos) {
					
					that.byId("idFormTable").setVisible(true);

					if (retornoItensInseridos.results.length > 0) {

						for (var i = 0; i < retornoItensInseridos.results.length; i++) {

							var aux = {
								Tbnum: retornoItensInseridos.results[i].Tbnum, //Nº NT
								Tbpos: retornoItensInseridos.results[i].Tbpos, //Nr item NT
								Charg: retornoItensInseridos.results[i].Charg, //LOTE
								Posicao: retornoItensInseridos.results[i].Nlpla, //Posicao
								Barcode: retornoItensInseridos.results[i].Barcode, //Etiqueta
								Nltyp: retornoItensInseridos.results[i].Nltyp, //Tipo de Deposito
								QtdeCx: parseInt(retornoItensInseridos.results[i].Anfme), // Quantidade inserida,
								IdItem: parseInt(retornoItensInseridos.results[i].IdItem)
							};

							vetorItensInseridos.push(aux);

						}

						var oModel = new sap.ui.model.json.JSONModel(vetorItensInseridos);
						that.getView().setModel(oModel, "ItensGuardados");

					}

					that.byId("idTableItens").setBusy(false);

				},
				error: function(error) {
					console.log(error);
					that.byId("idTableItens").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});
			
		},

		onBeepCxIndividual: function() {
			var that = this;
			that.byId("idButtonIndividual").setEnabled(true);
			// that.byId("idButtonTotal").setEnabled(true);
			var GV_QTDE_CX = parseFloat(this.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntProposta"));
			var concluido = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Concluido");
			var Lgnum = that.getOwnerComponent().getModel("modelAux").getProperty("/lgnum");

			if (this.byId("idInputEtiqueta").getValue() == "") {

				sap.m.MessageBox.show(
					"Preencher o campo 'Etiqueta'.", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Campo(s) em branco!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idInputEtiqueta").focus();

						}
					}
				);

			} else if (this.byId("idInputPosicao").getValue() == "") {

				sap.m.MessageBox.show(
					"Preencher o campo 'Posição'.", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Campo(s) em branco!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idInputPosicao").focus();

						}
					}
				);
			} else if (this.byId("idInputQuantidade").getValue() <= 0) {

				sap.m.MessageBox.show(
					"Valor mínimo permitido é 1.", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Quantidade não permitida!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idInputQuantidade").focus();
							that.byId("idInputQuantidade").setValue(1);

						}
					}
				);
			} 
			else if (this.byId("idInputQuantidade").getValue() > GV_QTDE_CX) {

				sap.m.MessageBox.show(
					"Quantidade deve ser menor ou igual a quantidade escolhida na tela anterior.", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Quantidade não permitida!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idInputQuantidade").focus();
							that.byId("idInputQuantidade").setValue(1);

						}
					}
				);
			}
			else if (concluido == "X") {
				sap.m.MessageBox.show(
					"Itens Já finalizados. Impossivel inserir novos itens.", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Itens completos!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idButtonIndividual").setEnabled(false);
							// that.byId("idButtonTotal").setEnabled(false);

						}
					}
				);
			} else {

				that.byId("idTableItens").setBusy(true);

				//Nova quantidade
				var GV_QTDE_CX = parseFloat(this.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntProposta"));
				var GV_QTDE_UN = parseFloat(this.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/un"));
				// >>>>>>>>>>>>>>>>>
				var QtdeParcial = parseFloat(that.byId("idInputQuantidade").getValue());

				var GV_MEINS = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Meins");

				var GV_MATNR = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Matnr"); // Nr Material
				var GV_TBPOS = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbpos"); // Nr NT
				var GV_TBNUM = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Tbnum"); // NR item nt
				var GV_CHARG = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Charg"); // lote
				var GV_LGNUM = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Lgnum"); // Nr deposito
				var GV_BARCODE = this.byId("idInputEtiqueta").getValue();
				var GV_POSICAO = this.byId("idInputPosicao").getValue();
				var GV_NLTYP = this.byId("idTiposDepositos").getSelectedKey();
				var GV_TOTAL = ""; //Esse parâmetro não é usado

				var oModel2 = new sap.ui.model.odata.ODataModel({
					serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
					user: "appadmin",
					password: "sap123"
				});

				GV_BARCODE = GV_BARCODE.replace("/", "|");

				oModel2.read("/ChecaBarcodes(IvBarcode='" + GV_BARCODE + "')", {
					success: function(retorno) {

						var Matnr = that.getOwnerComponent().getModel("modelItemPendente").getProperty("/Matnr"); // Nr Material
						var Charg = that.getOwnerComponent().getModel("modelItemPendente").getProperty("/Charg"); // lote

						if (retorno.EvMatnr == Matnr && retorno.EvCharg == Charg) {
							
							GV_CHARG = GV_CHARG.replace("/", "|");
							
							oModel2.read("/BeepsCxIndividual(Tbpos='" + GV_TBPOS + "',Tbnum='" + GV_TBNUM + "',Matnr='" + GV_MATNR +
								"',QtdeCx=" + GV_QTDE_CX + ",QtdeParcial=" + QtdeParcial + ",Charg='" + GV_CHARG + "',Meins='" + GV_MEINS + "',Barcode='" +
								GV_BARCODE + "',Posicao='" + GV_POSICAO + "',Nltyp='" + GV_NLTYP + "',Lgnum='" + GV_LGNUM + "')", {
									success: function(retornoBeepCxIndividual) {
										
										console.log(retornoBeepCxIndividual);
										
										if (retornoBeepCxIndividual.Retorno == "OK") {
											
											var aux = {
												Charg: retornoBeepCxIndividual.Charg,
												Barcode: retornoBeepCxIndividual.Barcode,
												Lgnum: retornoBeepCxIndividual.Lgnum,
												Nltyp: retornoBeepCxIndividual.Nltyp,
												Posicao: retornoBeepCxIndividual.Posicao, //LOTE
												QtdeCx: retornoBeepCxIndividual.QtdeParcial, //>>>>>>>>>>
												Tbnum: retornoBeepCxIndividual.Tbnum, //Nº NT
												Tbpos: retornoBeepCxIndividual.Tbpos, //Nr item NT,
												IdItem: parseInt(retornoBeepCxIndividual.IdItem)
											};

											vetorItensInseridos.push(aux);

											var oModel3 = new sap.ui.model.json.JSONModel(vetorItensInseridos);
											that.getView().setModel(oModel3, "ItensGuardados");
											// that.byId("idTableItens").setBusy(false);
											that.byId("idInputEtiqueta").setValue();
											that.byId("idInputPosicao").setValue();
											that.byId("idInputEtiqueta").focus();
											that.byId("idButtonIndividual").setEnabled(true);
											// that.byId("idButtonTotal").setEnabled(false);

											if (parseInt(retornoBeepCxIndividual.QtdeCx) == parseInt(retornoBeepCxIndividual.IdItem)) {

												oModel2.read("/BeepsUn(Tbpos='" + GV_TBPOS + "',Tbnum='" + GV_TBNUM + "',Meins='" + GV_MEINS + "',Matnr='" + GV_MATNR +
													"',QtdeUnid=" + GV_QTDE_UN + ",Charg='" + GV_CHARG + "',Barcode='" + GV_BARCODE + "',Posicao='" + GV_POSICAO +
													"',Nltyp='" + GV_NLTYP + "',Lgnum='" + GV_LGNUM + "')", {
														success: function(retornoBeepUnidade) {
															if (retornoBeepUnidade.Retorno == "OK") {

																oModel2.read("/ItensConcluido(Tbpos='" + GV_TBPOS + "',Lgnum='" + Lgnum + "',Tbnum='" + GV_TBNUM + "')", {
																	success: function(retornoConcluido) {
																		if (retornoConcluido.Retorno == "OK") {

																			sap.m.MessageBox.show(
																				"Mercadorias posicionadas com sucesso!", {
																					icon: sap.m.MessageBox.Icon.SUCCESS,
																					title: "Operação completa!",
																					actions: [sap.m.MessageBox.Action.OK],
																					onClose: function(oAction) {
																						that.byId("idTableItens").setBusy(false);
																						sap.ui.core.UIComponent.getRouterFor(that).navTo("EntradaMercadoria_2");
																					}
																				}
																			);
																		} else {

																			sap.m.MessageBox.show(
																				"Falha ao setar item completo!", {
																					icon: sap.m.MessageBox.Icon.WARNING,
																					title: "Falha na operação!",
																					actions: [sap.m.MessageBox.Action.OK],
																					onClose: function(oAction) {
																						that.byId("idTableItens").setBusy(false);
																					}
																				}
																			);
																		}
																	},
																	error: function(error) {
																		console.log(error);
																		that.byId("idTableItens").setBusy(false);
																		that.onMensagemErroODATA(error.response.statusCode);
																	}
																});

															} else {
																sap.m.MessageBox.show(
																	"Falha ao adicionar as unidades !!", {
																		icon: sap.m.MessageBox.Icon.WARNING,
																		title: "Falha na alocação das unidades!",
																		actions: [sap.m.MessageBox.Action.OK],
																		onClose: function(oAction) {
																			that.byId("idTableItens").setBusy(false);
																		}
																	}
																);
															}
														},
														error: function(error) {
															console.log(error);
															that.byId("idTableItens").setBusy(false);
															that.onMensagemErroODATA(error.response.statusCode);
														}
													});
											} else {
												that.byId("idTableItens").setBusy(false);
											}
										} else if (retornoBeepCxIndividual.Retorno == 'LIMITE') {

											sap.m.MessageBox.show(
												"A quantidade limite de caixas foram atingidas!!", {
													icon: sap.m.MessageBox.Icon.WARNING,
													title: "Falha na alocação da caixa!",
													actions: [sap.m.MessageBox.Action.OK],
													onClose: function(oAction) {
														that.byId("idTableItens").setBusy(false);
													}
												}
											);
										} else {
											sap.m.MessageBox.show(
												retornoBeepCxIndividual.Retorno, {
													icon: sap.m.MessageBox.Icon.WARNING,
													title: "Falha na Inserção de Itens no Inventário!",
													actions: [sap.m.MessageBox.Action.OK],
													onClose: function(oAction) {
														that.byId("idTableItens").setBusy(false);

													}
												}
											);
										}
									},
									error: function(error) {
										console.log(error);
										that.byId("idTableItens").setBusy(false);
										that.onMensagemErroODATA(error.response.statusCode);
									}
								});

						} else {

							sap.m.MessageBox.show(
								"Código é diferente do material selecionado! ", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Falha na inserção do item!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("idTableItens").setBusy(false);
										that.byId("idInputPosicao").setValue();
										that.byId("idInputEtiqueta").setValue();
										that.byId("idInputQuantidade").setValue(1);
									}
								}
							);
						}

						that.byId("idTableItens").setBusy(false);

					},
					error: function(error) {
						console.log(error);
						that.byId("idTableItens").setBusy(false);
						that.onMensagemErroODATA(error.response.statusCode);
					}
				});

			}

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
						that.byId("idInputPosicao").focus();

					},

					function(error) {
						sap.m.MessageToast.show("Erro ao tentar ler código de barras.");
					}
				);
			} else {
				alert("Não encontrou o plugin");
			}
		},

		onBarcodeOpen2: function() {
			var that = this;
			var code = "";

			if (window.parent.cordova.plugins.barcodeScanner) {

				window.parent.cordova.plugins.barcodeScanner.scan(

					function(result) {

						code = result.text;
						that.byId("idInputPosicao").setValue(code);

					},

					function(error) {
						sap.m.MessageToast.show("Erro ao tentar ler código de barras.");
					}
				);
			} else {
				alert("Não encontrou o plugin");
			}
		},

		onDelete: function(oEvent) {
			var that = this;
			var oSelectedItem = oEvent.getParameter("listItem");
			var index = "";
			// var oModel = this.getView().getModel();

			this.byId("idTableItens").setBusy(true);
			var IvLgnum = that.getOwnerComponent().getModel("modelAux").getProperty("/lgnum");
			var IvTbpos = oSelectedItem.getBindingContext("ItensGuardados").getProperty("Tbpos"); // Nr NT
			var IvTbnum = oSelectedItem.getBindingContext("ItensGuardados").getProperty("Tbnum"); // NR item nt
			var IvIdItem = String(oSelectedItem.getBindingContext("ItensGuardados").getProperty("IdItem"));

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			var concluido = this.getOwnerComponent().getModel("modelItemPendente").getProperty("/Concluido");

			if (concluido == "X") {

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

				oModel2.remove("/DeleteItensBeep(IvIdItem='" + IvIdItem + "',IvTbnum='" + IvTbnum + "',IvLgnum='" + IvLgnum + "',IvTbpos='" +
					IvTbpos + "')", {
						success: function(retornoBeepUnidade) {

							for (var i = 0; i < vetorItensInseridos.length; i++) {
								if (vetorItensInseridos[i].IdItem == IvIdItem & vetorItensInseridos[i].Tbnum == IvTbnum &
									vetorItensInseridos[i].Tbpos == IvTbpos) {
									index = i;
								}
							}

							vetorItensInseridos.splice(index, 1);
							that.getView().getModel("ItensGuardados").refresh();
							MessageToast.show("Item Removido!");
							that.byId("idTableItens").setBusy(false);

							if (vetorItensInseridos.length == 0) {
								that.byId("idButtonIndividual").setEnabled(true);
								// that.byId("idButtonTotal").setEnabled(true);
							}
						},
						error: function(error) {
							console.log(error);
							that.byId("idTableItens").setBusy(false);
							that.onMensagemErroODATA(error.response.statusCode);
						}
					});
			}
		},

		onValidarCodigo: function(barCode) {

		},

		onEtiqueta: function() {
			this.byId("idInputPosicao").focus();
		},

		onCancelar: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("EntradaMercadoria_2");
		},

		onTipoDepositoChange: function() {
			this.byId("idInputEtiqueta").focus();
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