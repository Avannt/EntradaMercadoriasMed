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
	var vetorPost = [];
	var vetorUsuarios = [];

	return BaseController.extend("aplicacao.controller.Login", {

		onInit: function() {
			
			var oModel = new sap.ui.model.json.JSONModel({
				receiving: "",
				nt: "",
				werks: "", 
				Ivnum: "",
				lgnum: "",
				nomeCentro: ""
			});
			
			this.getOwnerComponent().setModel(oModel, "modelAux");
			
			
			this.getRouter().getRoute("Login").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
				
			var oModel = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
				user: "appadmin",
				password: "sap123"
			});
			this.getView().setModel(oModel);

			this.byId("idLogin").focus();
		},

		onAfterRendering: function() {

		},
		
		onNomeCentro: function(evt){
			var oInput = evt.getSource();
			
			var nomeEmpresa = oInput.getProperty("value");
			
			this.getOwnerComponent().getModel("modelAux").setProperty("/nomeCentro", nomeEmpresa);
		},

		onLoginSubmit: function() {
			this.byId("idSenha").focus();
			this.byId("idLogin").setValueState("None");
			this.byId("idLogin").setValueStateText("");
		},

		onCheckLogin: function() {
			var that = this;

			this.byId("idLogin").setValueState("None");
			this.byId("idLogin").setValueStateText("");

			this.byId("idSenha").setValueState("None");
			this.byId("idSenha").setValueStateText("");

			var login = this.byId("idLogin").getValue();
			var senha = this.byId("idSenha").getValue();
			var centro = this.byId("idCentro").getSelectedKey();
			var versao = this.byId("idVersao").getText();

			if (login == "" && senha == "") {

				this.byId("idLogin").focus();
				this.byId("idLogin").setValueState("Error");
				this.byId("idLogin").setValueStateText("Preencha o Login!");

				this.byId("idSenha").setValueState("Error");
				this.byId("idSenha").setValueStateText("Preencha a Senha!");

			} else if (login == "") {
				this.byId("idLogin").focus();
				this.byId("idLogin").setValueState("Error");
				this.byId("idLogin").setValueStateText("Preencha a Login!");

			} else if (senha == "") {
				this.byId("idSenha").focus();
				this.byId("idSenha").setValueState("Error");
				this.byId("idSenha").setValueStateText("Preencha a Senha!");

				this.byId("idLogin").setValueState("None");
				this.byId("idLogin").setValueStateText("");

			} else if (centro == "") {
				
				sap.m.MessageBox.show(
					"Escolha um centro!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Falha na Autenticação!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.byId("idCentro").focus();

						}
					}
				);

			} else {

				this.byId("detail").setBusy(true);

				var oModel = new sap.ui.model.odata.v2.ODataModel({
					serviceUrl: "http://192.168.10.226:50000/sap/opu/odata/SAP/ZENTRADA_MERCADORIA_SRV/",
					user: "appadmin",
					password: "sap123"
				});

				oModel.read("/BuscaLogin(GvLogin='" + login + "',GvSenha='"  + senha + "',GvVersaoapp='" + versao + "',GvCentro='" + centro + "')", {
					success: function(RetornoChamada) {
						
						
						var retorno = RetornoChamada.GvAutenticado;
						var werks = RetornoChamada.GvCentro;
						that.byId("detail").setBusy(false);
						that.getOwnerComponent().getModel("modelAux").setProperty("/lgnum", RetornoChamada.GvLgnum);

						if (retorno == "1") {

							that.getOwnerComponent().getModel("modelAux").setProperty("/werks", werks);
							that.byId("idLogin").setValueState("Success");
							that.byId("idLogin").setValueStateText("");

							that.byId("idSenha").setValueState("Success");
							that.byId("idSenha").setValueStateText("");
							sap.ui.core.UIComponent.getRouterFor(that).navTo("Menu");
							
						} else if (retorno == "3") {

							sap.m.MessageBox.show(
								"O aplicativo está desatualizado! Faça o download em: www.sap.app.medicamental.com.br", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Aplicação Desatualizada!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {

									}
								}
							);
						} else {
							
							sap.m.MessageBox.show(
								"Usuário e/ou Senha inválido(s)!", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Falha na Autenticação!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {

										that.byId("idLogin").focus();
										that.byId("idLogin").setValueState("Error");
										that.byId("idLogin").setValueStateText("Login Inválido!");

										that.byId("idSenha").setValueState("Error");
										that.byId("idSenha").setValueStateText("Senha Inválida!");

									}
								}
							);
						}
					},
					error: function(error) {
						console.log(error.responseText);
						that.byId("detail").setBusy(false);

						if (error.statusCode == 0) {
							sap.m.MessageBox.show(
								"Verifique a conexão com a internet!", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Falha na Conexão!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("idLogin").focus();
										that.byId("idLogin").setValueState("None");
										that.byId("idLogin").setValueStateText("");

										that.byId("idSenha").setValueState("None");
										that.byId("idSenha").setValueStateText("");
									}
								}
							);
						} else if (error.statusCode == 400) {
							sap.m.MessageBox.show(
								"Url mal formada! Contate a consultoria!", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Erro no programa Fiori!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("idLogin").focus();
										that.byId("idLogin").setValueState("None");
										that.byId("idLogin").setValueStateText("");

										that.byId("idSenha").setValueState("None");
										that.byId("idSenha").setValueStateText("");
									}
								}
							);
						} else if (error.statusCode == 500) {
							sap.m.MessageBox.show(
								"Ocorreu um Erro! Contate a consultoria!", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Erro no programa Abap!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("idLogin").focus();
										that.byId("idLogin").setValueState("None");
										that.byId("idLogin").setValueStateText("");

										that.byId("idSenha").setValueState("None");
										that.byId("idSenha").setValueStateText("");
									}
								}
							);
						}
					}
				});
			}
		}
	});
});