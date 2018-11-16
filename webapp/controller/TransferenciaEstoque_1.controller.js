sap.ui.define([
	"aplicacao/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(BaseController, Controller, MessageBox, MessageToast, JSONModel, Device) {
	"use strict";
	var vectorReceiving = [];
	var vetorTiposDepositosOrigem = [];
	var vetorTiposDepositosDestino = [];
	var vetorListaMateriais = [];

	return BaseController.extend("aplicacao.controller.TransferenciaEstoque_1", {

		onInit: function() {
			this.getRouter().getRoute("TransferenciaEstoque_1").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var that = this;

			var tipoDepositoOrigem = {
				"Lgtyp": "001",
				"Ltypt": "Super Estoque"
			};
			vetorTiposDepositosOrigem.push(tipoDepositoOrigem);
			var oModel5 = new sap.ui.model.json.JSONModel(vetorTiposDepositosOrigem);
			that.getView().setModel(oModel5, "tipoDepositoOrigem");
			that.byId("idTiposDepositosOrigem").setSelectedKey(vetorTiposDepositosOrigem[0].Lgtyp);

			var tipoDepositoDestino = [{
				"Lgtyp": "001",
				"Ltypt": "Super Estoque"
			}, {
				"Lgtyp": "002",
				"Ltypt": "Flow Rack"
			}];

			var oModel6 = new sap.ui.model.json.JSONModel(tipoDepositoDestino);
			that.getView().setModel(oModel6, "tipoDepositoDestino");
			that.byId("idTiposDepositosDestino").setSelectedKey(tipoDepositoDestino[1].Lgtyp);
			this.byId("idInputQuantidade").setValue(1);

			that.onLimpaTela();
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

		onBarcodeOpen3: function() {
			var that = this;
			var code = "";

			if (window.parent.cordova.plugins.barcodeScanner) {

				window.parent.cordova.plugins.barcodeScanner.scan(

					function(result) {

						code = result.text;
						that.byId("idInputPosicaoDestino").setValue(code);

					},

					function(error) {
						sap.m.MessageToast.show("Erro ao tentar ler código de barras.");
					}
				);
			} else {
				alert("Não encontrou o plugin");
			}
		},

		onAfterRendering: function() {

		},
		
		onMaterialSelecionado: function(oEvent){
			
			var that = this;
			vetorListaMateriais = [];
			that.byId("idListaMateriais").setBusy(true);
			
			var oList = oEvent.getParameter("listItem") || oEvent.getSource();
			var Matnr = oList.getBindingContext("ListaMateriais").getProperty("Matnr");

			var Lgtyp = that.byId("idTiposDepositosOrigem").getSelectedKey();
			Lgtyp = "001";
			var Lgpla = that.byId("idInputPosicao").getValue();
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
		
		onBuscaMateriais: function() {
			var that = this;
			vetorListaMateriais = [];
			that.byId("idListaMateriais").setBusy(true);
			that.byId("idListaMateriais").setVisible(true);
			
			var Lgtyp = that.byId("idTiposDepositosOrigem").getSelectedKey();
			Lgtyp = "001";
			var Lgpla = that.byId("idInputPosicao").getValue();
			var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/werks");

			var oModel3 = new sap.ui.model.odata.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});

			oModel3.read("/ListaMateriais?$filter=IvLgpla eq '" + Lgpla + "' and IvLgtyp eq '" + Lgtyp + "' and IvWerks eq '" + werks + "'", {
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
			
			vetorListaMateriais = [];
			var oModel = new sap.ui.model.json.JSONModel(vetorListaMateriais);
			this.getView().setModel(oModel, "ListaMateriais");
			this.byId("idInputPosicaoDestino").setValue();
			this.byId("idTiposDepositosDestino").setSelectedKey();
			this.byId("idInputPosicao").setValue();
			this.byId("idInputEtiqueta").setValue();
			this.byId("idListaMateriais").setVisible(false);

		},

		onTransferir: function(oEvent) {
			var that = this;
			this.byId("detail").setBusy(true);
			var IV_WERKS = this.getOwnerComponent().getModel("modelAux").getProperty("/werks");
			var IV_BARCODE_ORIGEM = this.byId("idInputEtiqueta").getValue();
			var IV_POSICAO_ORIGEM = this.byId("idInputPosicao").getValue();
			var IV_POSICAO_DESTINO = this.byId("idInputPosicaoDestino").getValue();
			var IV_TIPO_DEP_ORIGEM = this.byId("idTiposDepositosOrigem").getSelectedKey();
			var IV_TIPO_DEP_DESTINO = this.byId("idTiposDepositosDestino").getSelectedKey();
			var qtdeTransferir = this.byId("idInputQuantidade").getValue();

			if (this.byId("idInputPosicao").getValue() == "") {

				sap.m.MessageBox.show(
					"Preencher o campo 'Posição'", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Campo(s) em branco!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idInputPosicao").focus();
							that.byId("detail").setBusy(false);

						}
					}
				);
			} else if (this.byId("idInputEtiqueta").getValue() == "") {

				sap.m.MessageBox.show(
					"Preencher o campo 'Etiqueta'", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Campo(s) em branco!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idInputEtiqueta").focus();
							that.byId("detail").setBusy(false);
						}
					}
				);
			} else if (this.byId("idInputQuantidade").getValue() <= 0) {

				sap.m.MessageBox.show(
					"Valor mínimo permitido é 1", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Quantidade não permitida!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idInputQuantidade").focus();
							that.byId("idInputQuantidade").setValue(1);

						}
					}
				);
			} else if (this.byId("idTiposDepositosDestino").getSelectedKey() == "001" && this.byId("idInputPosicaoDestino").getValue() == "") {

				sap.m.MessageBox.show(
					"Preencher a posição de Destino!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Campo(s) em branco!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("detail").setBusy(false);
						}
					}
				);
			} else {

				IV_BARCODE_ORIGEM = IV_BARCODE_ORIGEM.replace("/", "|");

				var oModel3 = new sap.ui.model.odata.ODataModel({
					serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
					user: "appadmin",
					password: "sap123"
				});

				oModel3.read("/TF_SetTransferencia(IvWerks='" + IV_WERKS + "',IvBarcodeOrigem='" + IV_BARCODE_ORIGEM + "',IvPosicaoOrigem='" +
					IV_POSICAO_ORIGEM + "',IvTipoDepDestino='" + IV_TIPO_DEP_DESTINO 
					+ "',IvQtdeParcial=" + qtdeTransferir + ",IvTipoDepOrigem='" + IV_TIPO_DEP_ORIGEM +
					"',IvPosicaoDestino='" + IV_POSICAO_DESTINO + "')", {
						success: function(retornoTransf) {

							if (retornoTransf.EvRetorno == "OK") {

								sap.m.MessageBox.show(
									"Nº OT: " + retornoTransf.EvTanum + " criado com sucesso!", {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "O.T. gerada!",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function(oAction) {
											that.onLimpaTela();
											that.byId("detail").setBusy(false);
										}
									}
								);

							} else {

								sap.m.MessageBox.show(
									retornoTransf.EvRetorno + " ao gerar OT! ", {
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
			}
		},

		onNavBack: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Menu");
		},

		onChangeTipoDepositoDestino: function() {
			var that = this;
			var IV_WERKS = this.getOwnerComponent().getModel("modelAux").getProperty("/werks");
			var IV_TIPO_DEP_DESTINO = this.byId("idTiposDepositosDestino").getSelectedKey();
			var IV_BARCODE_ORIGEM = this.byId("idInputEtiqueta").getValue();
			
			
			if(IV_BARCODE_ORIGEM == ""){
				sap.m.MessageBox.show(
					"Preencher o campo 'Etiqueta'.", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Campo(s) em branco!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idInputEtiqueta").focus();
							that.byId("idTiposDepositosDestino").setSelectedKey();

						}
					}
				);
			}
			else if (this.byId("idTiposDepositosDestino").getSelectedKey() == "001") {

				this.byId("idInputPosicaoDestino").setValue();
				this.byId("idFormPosicaoDestino").setVisible(true);

			} else {
				
				IV_BARCODE_ORIGEM = IV_BARCODE_ORIGEM.replace("/", "|");
				var oModel3 = new sap.ui.model.odata.ODataModel({
					serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
					user: "appadmin",
					password: "sap123"
				});

				oModel3.read("/FR_PosicaoFlowRack(IvWerks='" + IV_WERKS + "',IvBarcodeOrigem='" + IV_BARCODE_ORIGEM + "',IvTipoDepDestino='" +
					IV_TIPO_DEP_DESTINO + "')", {
						success: function(retornoPosicaoDestino) {

							if (retornoPosicaoDestino.EvRettyp == "S") {

								that.byId("idInputPosicaoDestino").setValue();
								that.byId("idFormPosicaoDestino").setVisible(true);
								that.byId("idInputPosicaoDestino").setValue(retornoPosicaoDestino.EvPosicaoDestino);

							} else {

								sap.m.MessageBox.show(
									retornoPosicaoDestino.EvReturn, {
										icon: sap.m.MessageBox.Icon.WARNING,
										title: "Posição não encontrada!",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function(oAction) {

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
		}
	});
});