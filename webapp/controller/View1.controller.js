sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/SearchField',
	'sap/m/Token',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (Controller, JSONModel, typeString, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("com.sap.valuehelpFilter.valuehelpFilter.controller.View1", {
		onInit: function () {
			this.oColModel = new JSONModel(sap.ui.require.toUrl("com/sap/valuehelpFilter/valuehelpFilter/model") +
				"/columnsModel.json");

			this.oColModel2 = new JSONModel(sap.ui.require.toUrl("com/sap/valuehelpFilter/valuehelpFilter/model") +
				"/columnsModel2.json");

			//Test upload

			this._oMultiInput = this.getView().byId("multiInput");
			this._oMultiInput.addValidator(this._onMultiInputValidate);
			//	this._oMultiInput.setTokens(this._getDefaultTokens());
			this._oMultiInput2 = this.getView().byId("multiInput2");
			this._oMultiInput2.addValidator(this._onMultiInputValidate2);

			// #region Value Help Dialog filters with suggestions
			// this._oMultiInputWithSuggestions = this.getView().byId("multiInputWithSuggestions");
			// this._oMultiInputWithSuggestions.addValidator(this._onMultiInputValidate);
			//	this._oMultiInputWithSuggestions.setTokens(this._getDefaultTokens());
			// #endregion

			//	this.oColModel = new JSONModel(sap.ui.require.toUrl("sap/ui/comp/sample/valuehelpdialog/filterbar") + "/columnsModel.json");
			this.oProductsModel = this.getOwnerComponent().getModel("revenueModel");
			this.oProductsModel2 = this.getOwnerComponent().getModel("revenueModel");
			this.readValues();
			//	this.getView().setModel(this.oProductsModel);

		},

		// #region
		onValueHelpRequested: function () {
			var aCols = this.oColModel.getData().cols;
			var oView = this.getView();
			//////////////////////////////

			this.oProductsModel.read("/Invoices", {

				success: function (oData, Response) {

					var orderModel = new sap.ui.model.json.JSONModel();
					oView.setModel(orderModel, "shipToModel");
					oView.getModel("shipToModel").setProperty("/ShipToPartySet", oData.results);

					console.log("Inside Success function maunal entry model", oManualEntryModel);
				},

				error: function (oData, Response, oError) {
					sap.ui.core.BusyIndicator.hide();
					console.log("Inside Error function");
				}

			});

			//////////////////////////////

			this._oBasicSearchField = new SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialog = sap.ui.xmlfragment("com.sap.valuehelpFilter.valuehelpFilter.fragments.outboundDelivery1", this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.setRangeKeyFields([{
				label: "Product",
				key: "ProductId",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 7
				})
			}]);

			var oFilterBar = this._oValueHelpDialog.getFilterBar();
			oFilterBar.setFilterBarExpanded(false);
			oFilterBar.setBasicSearch(this._oBasicSearchField);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oProductsModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/ZotcshLikpSet");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/ZotcshLikpSet", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
			this._oValueHelpDialog.open();
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput.setTokens(aTokens);
			this._oValueHelpDialog.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},

		onFilterBarSearch: function (oEvent) {
			var sSearchQuery = this._oBasicSearchField.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			aFilters.push(new Filter({
				filters: [
					new Filter({
						path: "Vbeln",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Vstel",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Lfart",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),

					new Filter({
						path: "Kunnr",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Kunag",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Route",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),

					new Filter({
						path: "WadatIst",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Fkstk",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Pdstk",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),

				],
				and: false
			}));

			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		_filterTable: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		},

		// #region2
		onValueHelpRequested2: function () {
			var aCols2 = this.oColModel2.getData().cols;
			var oView = this.getView();
			//////////////////////////////

			//////////////////////////////

			this._oBasicSearchField2 = new SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialog2 = sap.ui.xmlfragment("com.sap.valuehelpFilter.valuehelpFilter.fragments.outboundDelivery2", this);
			this.getView().addDependent(this._oValueHelpDialog2);
this._oValueHelpDialog2.setKey("Fkart");
					this._oValueHelpDialog2.setDescriptionKey("Vtext");
			this._oValueHelpDialog2.setRangeKeyFields([{
				label: "Product",
				key: "ProductId",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 7
				})
			}]);

			var oFilterBar = this._oValueHelpDialog2.getFilterBar();
			oFilterBar.setFilterBarExpanded(false);
			oFilterBar.setBasicSearch(this._oBasicSearchField2);

			this._oValueHelpDialog2.getTableAsync().then(function (oTable2) {
				oTable2.setModel(this.getView().getModel("shipToModel"));
				oTable2.setModel(this.oColModel2, "columns");

				if (oTable2.bindRows) {
					oTable2.bindAggregation("rows", "/ShipToPartySet");
				}

				if (oTable2.bindItems) {
					oTable2.bindAggregation("items", "/ShipToPartySet", function () {
						return new ColumnListItem({
							cells: aCols2.map(function (column) {
								return new Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}

				this._oValueHelpDialog2.update();
			}.bind(this));

			this._oValueHelpDialog2.setTokens(this._oMultiInput2.getTokens());
			this._oValueHelpDialog2.open();
		},
		onValueHelpOkPress2: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput2.setTokens(aTokens);
			this._oValueHelpDialog2.close();
		},

		onValueHelpCancelPress2: function () {
			this._oValueHelpDialog2.close();
		},

		onValueHelpAfterClose2: function () {
			this._oValueHelpDialog2.destroy();
		},

/*		onFilterBarSearch2: function (oEvent) {
			var sSearchQuery = this._oBasicSearchField2.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			aFilters.push(new Filter({
				filters: [
					new Filter({
						path: "Fkart",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Vtext",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					})

				],
				and: false
			}));

			this._filterTable2(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		_filterTable2: function (oFilter) {
			var oValueHelpDialog2 = this._oValueHelpDialog2;

			oValueHelpDialog2.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog2.update();
			});
		},  */
		
		onFilterBarSearch2: function (oEvent) {
		var sSearchQuery = this._oBasicSearchField2.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

				// var Filter1 = new sap.ui.model.Filter("Fkart", sap.ui.model.FilterOperator.EQ, sSearchQuery1);
				// var Filter2 = new sap.ui.model.Filter("Vtext", sap.ui.model.FilterOperator.EQ, sSearchQuery2);

			aFilters.push(new Filter({
				filters: [
					new Filter({
						path: "Fkart",
						operator: FilterOperator.EQ,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Vtext",
						operator: FilterOperator.EQ,
						value1: sSearchQuery
					})

				],
				and: false
			}));

			this._filterTable2(new sap.ui.model.Filter({
				filters: aFilters,
				and: true
			}));
		},
		
		
		readValues: function (oFilter) {

	this.oProductsModel2 = this.getOwnerComponent().getModel("revenueModel");
	var oModel=this.oProductsModel2;
	var that=this;
   var oView = that.getView();
	oModel.read("/HTvfkSet", {

				success: function (oData, Response) {

					// var revInvModel = new sap.ui.model.json.JSONModel();
					// oView.setModel(revInvModel, "revInvoiceModel");
					// oView.getModel("revInvoiceModel").setProperty("/revInvoiceSet", oData.results);

					// var immInvoiceModel = new sap.ui.model.json.JSONModel(oData);
					// 	that.getView().setModel(immInvoiceModel, "immInvoiceData");
					// 	immInvoiceModel.setProperty("/immInvoiceSet", oData.results);

					var shipToModel = new sap.ui.model.json.JSONModel();
					oView.setModel(shipToModel, "shipToModel");
					oView.getModel("shipToModel").setProperty("/ShipToPartySet", oData.results);
					sap.ui.core.BusyIndicator.hide();
					console.log("Inside Success function revenue invoice", oData.results);
				},

				error: function (oData, Response, oError) {
					console.log("Inside Error function");
				}

			});

},


		// #endregion

		_getDefaultTokens: function () {
			var ValueHelpRangeOperation = compLibrary.valuehelpdialog.ValueHelpRangeOperation;
			var oToken1 = new Token({
				key: "HT-1001",
				text: "Notebook Basic 17 (HT-1001)"
			});

			var oToken2 = new Token({
				key: "range_0",
				text: "!(=HT-1000)"
			}).data("range", {
				"exclude": true,
				"operation": ValueHelpRangeOperation.EQ,
				"keyField": "ProductId",
				"value1": "HT-1000",
				"value2": ""
			});

			return [oToken1, oToken2];
		}
	});
});