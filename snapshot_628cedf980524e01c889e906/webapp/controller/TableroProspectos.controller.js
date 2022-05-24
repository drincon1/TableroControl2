sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"../model/kpiHelper"
], function(BaseController, MessageBox, Utilities, History, KPIHelper) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.tablerosDeControl20.controller.TableroProspectos", {
		handleRouteMatched: function(oEvent) {
			var sAppId = "App628cedf980524e01c889e906";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		_onButtonPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("Menu", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		applyFiltersAndSorters: function(sControlId, sAggregationName, chartBindingInfo) {
			if (chartBindingInfo) {
				var oBindingInfo = chartBindingInfo;
			} else {
				var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			}
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		updateBindingOptions: function(sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		createFiltersAndSorters: function() {
			this.mBindingOptions = {};
			var oBindingData, aPropertyFilters;
			oBindingData = {};
			oBindingData.sorters = [];

			oBindingData.sorters.push(new sap.ui.model.Sorter("Edad", false, false));
			this.updateBindingOptions("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330", oBindingData);
			oBindingData = {};
			oBindingData.sorters = [];

			oBindingData.sorters.push(new sap.ui.model.Sorter("Edad", false, false));
			this.updateBindingOptions("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889", oBindingData);

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("TableroProspectos").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			var oView = this.getView(),
				oData = {},
				self = this;
			var oModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oModel, "staticDataModel");
			self.oBindingParameters = {};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894913864"] = {};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894913864"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894913864'] = {
				"path": "/CompraSet",
				"parameters": {}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894913864"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652888466836"] = {};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652888466836"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652888466836'] = {
				"path": "/LeadSet",
				"parameters": {}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652888466836"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330"] = {};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330'] = {
				"path": "/CompraSet",
				"parameters": {}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_BarChart-1652888812025"] = {};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_BarChart-1652888812025"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_BarChart-1652888812025'] = {
				"path": "/CompraSet",
				"parameters": {}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_BarChart-1652888812025"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889"] = {};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889'] = {
				"path": "/CompraSet",
				"parameters": {}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_HeatmapChart-1652894201841"] = {};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_HeatmapChart-1652894201841"]["data"] = [{
				"dim0": "24-Seven",
				"mea0": 428214.13,
				"__id": 0
			}, {
				"dim0": "A&A",
				"mea0": 1722148.36,
				"__id": 1
			}, {
				"dim0": "Alexeis Specialities",
				"mea0": 1331176.70688374,
				"__id": 2
			}, {
				"dim0": "All-you-need Store",
				"mea0": 18301238.4,
				"__id": 3
			}, {
				"dim0": "BC Market",
				"mea0": 1878466.82,
				"__id": 4
			}, {
				"dim0": "Choices Franchise 1",
				"mea0": 3386251.94,
				"__id": 5
			}, {
				"dim0": "Choices Franchise 2",
				"mea0": 15001186.81,
				"__id": 6
			}, {
				"dim0": "Choices Franchise 3",
				"mea0": 20899680.97,
				"__id": 7
			}, {
				"dim0": "Choices Franchise 4",
				"mea0": 30280027.72,
				"__id": 8
			}, {
				"dim0": "Choices Franchise 5",
				"mea0": 39165270.4,
				"__id": 9
			}];

			self.oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_HeatmapChart-1652894201841'] = {
				"path": "/LeadSet",
				"parameters": {}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_HeatmapChart-1652894201841"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894602888"] = {};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894602888"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894602888'] = {
				"path": "/CompraSet",
				"parameters": {}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894602888"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894844016"] = {};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894844016"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894844016'] = {
				"path": "/CompraSet",
				"parameters": {}
			};

			oData["sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894844016"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oView.getModel("staticDataModel").setData(oData, true);

			function dateDimensionFormatter(oDimensionValue, sTextValue) {
				var oValueToFormat = sTextValue !== undefined ? sTextValue : oDimensionValue;
				if (oValueToFormat instanceof Date) {
					var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
						style: "short"
					});
					return oFormat.format(oValueToFormat);
				}
				return oValueToFormat;
			}

			var aDimensions = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894913864").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652888466836").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_BarChart-1652888812025").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_HeatmapChart-1652894201841").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894602888").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894844016").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			this.mAggregationBindingOptions = {};
			this.createFiltersAndSorters();

		},
		onAfterRendering: function() {

			var oChart,
				self = this,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894913864");
				var oParameters = oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894913864'];

				KPIHelper.getKPIModel("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894913864", oChart, undefined, oParameters.path, oChart.getDimensions(), {
					"MES_ID_DISTINCTCOUNT": {
						"source": "ID",
						"operation": "DISTINCTCOUNT"
					}
				}, self.updateBindingOptions.bind(self), function(oKPIModel) {
					oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894913864");
					oChart.setModel(oKPIModel, "kpiModel");
					oChart.bindData({
						path: "/",
						model: "kpiModel"
					});
				});

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652888466836");
				var oParameters = oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652888466836'];

				KPIHelper.getKPIModel("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652888466836", oChart, undefined, oParameters.path, oChart.getDimensions(), {
					"MES_Name_DISTINCTCOUNT": {
						"source": "Name",
						"operation": "DISTINCTCOUNT"
					}
				}, self.updateBindingOptions.bind(self), function(oKPIModel) {
					oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652888466836");
					oChart.setModel(oKPIModel, "kpiModel");
					oChart.bindData({
						path: "/",
						model: "kpiModel"
					});
				});

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330");
				var oParameters = oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330'];

				KPIHelper.getKPIModel("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330", oChart, undefined, oParameters.path, oChart.getDimensions(), {
					"MES_ID_DISTINCTCOUNT": {
						"source": "ID",
						"operation": "DISTINCTCOUNT"
					}
				}, self.updateBindingOptions.bind(self), function(oKPIModel) {
					oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_PieChart-1652894995330");
					oChart.setModel(oKPIModel, "kpiModel");
					oChart.bindData({
						path: "/",
						model: "kpiModel"
					});
				});

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_BarChart-1652888812025");
				var oParameters = oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_BarChart-1652888812025'];

				KPIHelper.getKPIModel("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_BarChart-1652888812025", oChart, undefined, oParameters.path, oChart.getDimensions(), {
					"MES_ID_DISTINCTCOUNT": {
						"source": "ID",
						"operation": "DISTINCTCOUNT"
					}
				}, self.updateBindingOptions.bind(self), function(oKPIModel) {
					oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_BarChart-1652888812025");
					oChart.setModel(oKPIModel, "kpiModel");
					oChart.bindData({
						path: "/",
						model: "kpiModel"
					});
				});

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889");
				var oParameters = oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889'];

				self.applyFiltersAndSorters("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889", "data", oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652893694889']);

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_HeatmapChart-1652894201841");
				var oParameters = oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_HeatmapChart-1652894201841'];

				KPIHelper.getKPIModel("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_HeatmapChart-1652894201841", oChart, undefined, oParameters.path, oChart.getDimensions(), {
					"MES_ID_DISTINCTCOUNT": {
						"source": "ID",
						"operation": "DISTINCTCOUNT"
					}
				}, self.updateBindingOptions.bind(self), function(oKPIModel) {
					oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_HeatmapChart-1652894201841");
					oChart.setModel(oKPIModel, "kpiModel");
					oChart.bindData({
						path: "/",
						model: "kpiModel"
					});
				});

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894602888");
				var oParameters = oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894602888'];

				KPIHelper.getKPIModel("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894602888", oChart, undefined, oParameters.path, oChart.getDimensions(), {
					"MES_PrecioLista_AVG": {
						"source": "PrecioLista",
						"operation": "AVG"
					}
				}, self.updateBindingOptions.bind(self), function(oKPIModel) {
					oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894602888");
					oChart.setModel(oKPIModel, "kpiModel");
					oChart.bindData({
						path: "/",
						model: "kpiModel"
					});
				});

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894844016");
				var oParameters = oBindingParameters['sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894844016'];

				KPIHelper.getKPIModel("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894844016", oChart, undefined, oParameters.path, oChart.getDimensions(), {
					"MES_PrecioFinal_AVG": {
						"source": "PrecioFinal",
						"operation": "AVG"
					}
				}, self.updateBindingOptions.bind(self), function(oKPIModel) {
					oChart = oView.byId("sap_m_Page_0-9byqjshrm14r77tawa49lmo98_S8-content-sap_chart_LineChart-1652894844016");
					oChart.setModel(oKPIModel, "kpiModel");
					oChart.bindData({
						path: "/",
						model: "kpiModel"
					});
				});

			});

		}
	});
}, /* bExport= */ true);
