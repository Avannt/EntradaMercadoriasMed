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
	var vetorItensInseridos = [];
	var vetorTiposDepositosOrigem = [];
	var vetorTiposDepositosDestino = [];
	var vetorListaMateriais = []; 

	return BaseController.extend("aplicacao.controller.MovFlowRack_3", {

		onInit: function() {
			this.getRouter().getRoute("MovFlowRack_3").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var that = this;
			vetorItensInseridos = [];

			var BotaoIndividual = "false";

			vetorItensInseridos = [];
			var oModel4 = new sap.ui.model.json.JSONModel(vetorItensInseridos);
			that.getView().setModel(oModel4, "ItensGuardados");
			
			that.byId("idListaMateriais").setVisible(false);
			oModel4 = new sap.ui.model.json.JSONModel(vetorListaMateriais);
			that.getView().setModel(oModel4, "ListaMateriais");

			this.byId("idInputQuantidade").setValue(1);
			this.byId("idInputEtiqueta").setValue();
			this.byId("idInputPosicao").setValue();

			this.byId("idTableItens").setBusy(false);
			var Tbpos = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Tbpos"); // Nr NT
			var Tbnum = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Tbnum"); // NR item nt
			var Lgnum = that.getOwnerComponent().getModel("modelAux").getProperty("/lgnum");

			// var oModel2 = new sap.ui.model.odata.ODataModel({
			// 	serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/"
			// });

			var tipoDepositoOrigem = {
				"Lgtyp": "001",
				"Ltypt": "Super Estoque"
			};

			vetorTiposDepositosOrigem.push(tipoDepositoOrigem);
			var oModel5 = new sap.ui.model.json.JSONModel(vetorTiposDepositosOrigem);
			that.getView().setModel(oModel5, "tipoDepositoOrigem");
			that.byId("idTiposDepositosOrigem").setSelectedKey(vetorTiposDepositosOrigem[0].Lgtyp);

			var tipoDepositoDestino = {
				"Lgtyp": "002",
				"Ltypt": "Flow Rack"
			};
			vetorTiposDepositosDestino.push(tipoDepositoDestino);
			var oModel6 = new sap.ui.model.json.JSONModel(vetorTiposDepositosDestino);
			that.getView().setModel(oModel6, "tipoDepositoDestino");
			that.byId("idTiposDepositosDestino").setSelectedKey(vetorTiposDepositosDestino[0].Lgtyp);

			var oModel3 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel3.read("/FR_GetCaixasBipadas/?$filter=IsTbnum eq '" + Tbnum + "' and IsLgnum eq '" + Lgnum + "' and IsTbpos eq '" + Tbpos +
				"'", {
					success: function(retornoItensInseridos) {

						if (retornoItensInseridos.results.length > 0) {

							for (var i = 0; i < retornoItensInseridos.results.length; i++) {

								console.log(retornoItensInseridos);
								//Sempre será o mesmo
								var tipoDeposito = retornoItensInseridos.results[i].Nltyp;

								var aux = {
									Tbnum: retornoItensInseridos.results[i].Tbnum, //Nº NT
									Tbpos: retornoItensInseridos.results[i].Tbpos, //Nr item NT
									Charg: retornoItensInseridos.results[i].Charg, //LOTE
									Posicao: retornoItensInseridos.results[i].Vlpla, //Posicao
									Barcode: retornoItensInseridos.results[i].Barcode, //Etiqueta
									Nltyp: retornoItensInseridos.results[i].Nltyp, //Tipo de Deposito
									QtdeCx: parseInt(retornoItensInseridos.results[i].Anfme), // Quantidade inserida,
									IdItem: parseInt(retornoItensInseridos.results[i].IdItem)
								};

								vetorItensInseridos.push(aux);

							}

							var oModel7 = new sap.ui.model.json.JSONModel(vetorItensInseridos);
							that.getView().setModel(oModel7, "ItensGuardados");

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

		onBuscaMateriais: function() {
			var that = this;
			vetorListaMateriais = [];
			that.byId("idListaMateriais").setBusy(true);
			that.byId("idListaMateriais").setVisible(true);
			
			var Lgtyp = that.byId("idTiposDepositosOrigem").getSelectedKey();
			Lgtyp = "001";
			var Lgpla = that.byId("idInputPosicao").getValue();
			var Matnr = that.getOwnerComponent().getModel("modelNT_FR").getProperty("/Matnr");
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel3 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel3.read("/PosicaoMateriais?$filter=IvLgpla eq '" + Lgpla + "' and IvLgtyp eq '" + Lgtyp + "' and IvMatnr eq '" + Matnr + "' and IvWerks eq '" + werks + "'", {
				success: function(retornoItensInseridos) {

					that.byId("idFormTable").setVisible(true);

					for (var i = 0; i < retornoItensInseridos.results.length; i++) {
						//"2019-07-30T00:00:00"
						var dataVenc = retornoItensInseridos.results[i].Vfdat;
						dataVenc = dataVenc.split("T");
						dataVenc = dataVenc[0].split("-");
						dataVenc = dataVenc[2] + "/"+ dataVenc[1] + "/" + dataVenc[0];
						var aux = {
							Matnr: retornoItensInseridos.results[i].Matnr, //Mat
							Charg: retornoItensInseridos.results[i].Charg, //LOTE
							Maktx: retornoItensInseridos.results[i].Maktx, //Desc
							Vfdat: dataVenc, //DataVenc
							Gesme: parseInt(retornoItensInseridos.results[i].Gesme) //Qnt
						};

						vetorListaMateriais.push(aux);

					}

					var oModel = new sap.ui.model.json.JSONModel(vetorListaMateriais);
					that.getView().setModel(oModel, "ListaMateriais");

					that.byId("idListaMateriais").setBusy(false);

				},
				error: function(error) {
					console.log(error);
					that.byId("idTableItens").setBusy(false);
					that.onMensagemErroODATA(error.response.statusCode);
				}
			});

		},

		onInserirCaixa: function() {
			var that = this;

			var Matnr = this.getOwnerComponent().getModel("modelAux").getProperty("/Matnr"); // Nr Material
			var Charg = this.getOwnerComponent().getModel("modelAux").getProperty("/Charg");
			var quantidadePermitida = that.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntProposta");

			if (this.byId("idInputPosicao").getValue() == "") {

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
			} else if (this.byId("idInputEtiqueta").getValue() == "") {

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
			} else if (this.byId("idInputQuantidade").getValue() <= 0) {

				sap.m.MessageBox.show(
					"Valor mínimo permitido é 1.", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Quantidadenão permitida!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idInputQuantidade").focus();
							that.byId("idInputQuantidade").setValue(1);

						}
					}
				);
			} else if (this.byId("idInputQuantidade").getValue() > quantidadePermitida) {

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
			} else {

				that.byId("idTableItens").setBusy(true);

				var oModel2 = new sap.ui.model.odata.ODataModel({
					serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
					user: "appadmin",
					password: "sap123"
				});

				//Nova quantidade
				var GV_QTDE_CX = parseFloat(this.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntProposta"));
				var GV_MEINS = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Meins");
				var GV_MATNR = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Matnr"); // Nr Material
				var GV_TBPOS = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Tbpos"); // Nr NT
				var GV_TBNUM = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Tbnum"); // NR item nt
				var GV_CHARG = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Charg"); // lote
				var GV_LGNUM = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Lgnum"); // Nr deposito
				var GV_BARCODE = this.byId("idInputEtiqueta").getValue();
				var GV_POSICAO = this.byId("idInputPosicao").getValue();
				var GV_QTDE_PARCIAL = this.byId("idInputQuantidade").getValue();

				GV_BARCODE = GV_BARCODE.replace("/", "|");

				oModel2.read("/ChecaBarcodes(IvBarcode='" + GV_BARCODE + "')", {
					success: function(retorno) {

						if (retorno.EvMatnr == Matnr) {

							oModel2.read("/FR_BeepCxIndividual(IvTbpos='" + GV_TBPOS + "',IvTbnum='" + GV_TBNUM + "',IvMatnr='" + GV_MATNR +
								"',IvQtdeCx=" + GV_QTDE_CX + "',IvQtdeParcial=" + GV_QTDE_PARCIAL + ",IvMeins='" + GV_MEINS + "',IvBarcode='" + GV_BARCODE +
								"',IvPosicao='" + GV_POSICAO + "',IvLgnum='" + GV_LGNUM + "')", {
									success: function(retornoBeepCxIndividual) {
										console.log(retornoBeepCxIndividual);

										if (retornoBeepCxIndividual.EvRetorno == "OK") {

											var aux = {
												Charg: retornoBeepCxIndividual.EvCharg, //LOTE
												Barcode: retornoBeepCxIndividual.IvBarcode,
												Lgnum: retornoBeepCxIndividual.IvLgnum,
												// Nltyp: retornoBeepCxIndividual.Nltyp,
												Posicao: retornoBeepCxIndividual.IvPosicao,
												QtdeCx: retornoBeepCxIndividual.IvQtdeParcial,
												Tbnum: retornoBeepCxIndividual.IvTbnum, //Nº NT
												Tbpos: retornoBeepCxIndividual.IvTbpos, //Nr item NT,
												IdItem: parseInt(retornoBeepCxIndividual.EvIdItem)
											};

											vetorItensInseridos.push(aux);

											var oModel3 = new sap.ui.model.json.JSONModel(vetorItensInseridos);
											that.getView().setModel(oModel3, "ItensGuardados");

											that.byId("idInputEtiqueta").setValue();
											that.byId("idInputPosicao").setValue();
											that.byId("idInputEtiqueta").focus();
											that.byId("idTableItens").setBusy(false);

										} else if (retornoBeepCxIndividual.EvRetorno == 'LIMITE') {

											sap.m.MessageBox.show(
												"A quantidade limite de caixas foram atingidas!!", {
													icon: sap.m.MessageBox.Icon.WARNING,
													title: "Falha na alocação da caixa!",
													actions: [sap.m.MessageBox.Action.OK],
													onClose: function(oAction) {

														that.byId("idTableItens").setBusy(false);
														that.byId("idInputEtiqueta").setValue();
														that.byId("idInputPosicao").setValue();
														that.byId("idButtonOT").focus();

													}
												}
											);
										} else {
											sap.m.MessageBox.show(
												"Falha ao inserir um item para tranferência !!", {
													icon: sap.m.MessageBox.Icon.WARNING,
													title: "Falha na alocação da caixa!",
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
						that.onBuscaMateriais();

					},

					function(error) {
						sap.m.MessageToast.show("Erro ao tentar ler código de barras.");
					}
				);
			} else {
				alert("Não encontrou o plugin");
			}
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

		onGerarOT: function() {
			var that = this;
			var tipoDeposito = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Lgnum");
			var Tbnum = this.getOwnerComponent().getModel("modelNT_FR").getProperty("/Tbnum");
			var qtdCaixas = that.getOwnerComponent().getModel("modelSeparacaoCaixas").getProperty("/qntProposta");
			that.byId("idTableItens").setBusy(true);

			if (qtdCaixas > vetorItensInseridos.length) {
				sap.m.MessageBox.show(
					"Terminar os lançamentos das caixas!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Beepagem de caixas Pendentes!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idTableItens").setBusy(false);
						}
					}
				);
			} else {
				var oModel3 = new sap.ui.model.odata.ODataModel({
					serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
					user: "appadmin",
					password: "sap123"
				});

				oModel3.read("/FR_GerarOT(IvTbnum='" + Tbnum + "',IvLgnum='" + tipoDeposito + "')", {
					success: function(retornoOT) {

						if (retornoOT.EvRetorno == "OK") {

							sap.m.MessageBox.show(
								"Nº OT: " + retornoOT.EvTanum + " criado com sucesso!", {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "O.T. gerada!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("idTableItens").setBusy(false);
										sap.ui.core.UIComponent.getRouterFor(that).navTo("MovFlowRack_1");
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

			}
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

		onDelete: function(oEvent) {
			var that = this;
			var oSelectedItem = oEvent.getParameter("listItem");
			var index = "";
			this.byId("idTableItens").setBusy(true);

			var Tbnum = oSelectedItem.getBindingContext("ItensGuardados").getProperty("Tbnum"); // NR item nt
			var Tbpos = oSelectedItem.getBindingContext("ItensGuardados").getProperty("Tbpos");
			var IdItem = oSelectedItem.getBindingContext("ItensGuardados").getProperty("IdItem");
			var lgnum = that.getOwnerComponent().getModel("modelAux").getProperty("/lgnum");

			var oModel2 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel2.remove("/FR_DeleteItensBeep(IvTbpos='" + Tbpos + "',IvLgnum='" + lgnum + "',IvTbnum='" + Tbnum +
				"',IvIdItem='" + IdItem + "')", {
					success: function(retorno) {

						for (var i = 0; i < vetorItensInseridos.length; i++) {
							if (vetorItensInseridos[i].IdItem == IdItem & vetorItensInseridos[i].Tbnum == Tbnum &
								vetorItensInseridos[i].Tbpos == Tbpos) {
								index = i;
							}
						}

						vetorItensInseridos.splice(index, 1);
						that.getView().getModel("ItensGuardados").refresh();
						MessageToast.show("Item Removido!");
						that.byId("idTableItens").setBusy(false);

					},
					error: function(error) {
						console.log(error);
						that.byId("idTableItens").setBusy(false);
						that.onMensagemErroODATA(error.response.statusCode);
					}
				});
		}
	});
});