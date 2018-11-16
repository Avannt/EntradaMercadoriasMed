sap.ui.define([
	"aplicacao/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/m/Input"
], function(BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("aplicacao.controller.App", {

		onInit: function() {
			
		},

		onAfterRendering: function() {

		},

		handlePressHome: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Menu");
		},
		
		handleLogoffPress: function() {
			
		}
	});
});