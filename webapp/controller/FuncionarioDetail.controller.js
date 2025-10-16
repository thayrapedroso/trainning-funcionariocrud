sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (Controller, History, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("funcionariocrud.controller.FuncionarioDetail", {
      onInit: function () {
        const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter
          .getRoute("Edit")
          .attachPatternMatched(this._onEditMatched, this);
        oRouter
          .getRoute("Create")
          .attachPatternMatched(this._onCreateMatched, this);

        this.oModel = this.getView().getModel();
      },

      /* =========================================================== */
      /* ====================== EDIÇÃO ============================= */
      /* =========================================================== */
      _onEditMatched: function (oEvent) {
        const sId = oEvent.getParameter("arguments").ID;
        const sPath = `/FuncionarioSet(${sId})`;
        const oView = this.getView();

        oView.bindElement({
          path: sPath,
          parameters: {
            expand: "", // opcional
            updateGroupId: "update", // força agrupamento de updates
          },
          events: {
            dataRequested: () => oView.setBusy(true),
            dataReceived: () => oView.setBusy(false),
          },
        });

        // Garante TwoWay no modelo (alguns templates criam como OneWay)
        const oModel = oView.getModel();
        oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
      },

      _onBindingChange: function () {
        const oContext = this.getView().getBindingContext();
        if (!oContext) {
          MessageBox.error("Registro não encontrado");
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("Main");
        }
      },

      /* =========================================================== */
      /* ====================== CRIAÇÃO ============================ */
      /* =========================================================== */
      _onCreateMatched: function () {
        const oModel = this.getView().getModel();

        // Cria um novo registro localmente
        const oContext = oModel.createEntry("/FuncionarioSet", {
          properties: {
            NAME: "",
            DEPARTMENT: "",
            SALARY: "0.00",
          },
        });

        this.getView().setBindingContext(oContext);
      },

      /* =========================================================== */
      /* ======================== SALVAR =========================== */
      /* =========================================================== */
      onSave: function (oEvent) {
        // Supondo que você tenha o modelo OData V2 registrado no manifest
        const oModel = this.getView().getModel();

        // Caminho da entidade a ser atualizada
        const sPath = oEvent.getSource().getBindingContext(); // ou conforme sua key

        // Dados novos
        const oData = {
          "NAME": this.getView().byId("inputName").getValue(),
          "DEPARTMENT": this.getView().byId("inputDepartment").getValue(),
          "SALARY": this.getView().byId("inputSalary").getValue()
        };

        // Chamada do update
        oModel.update(sPath, oData, {
          success: function () {
            sap.m.MessageToast.show("Registro atualizado com sucesso!");
          },
          error: function (oError) {
            sap.m.MessageBox.error("Erro ao atualizar: " + oError.message);
          },
        });
      },

      /* =========================================================== */
      /* ====================== CANCELAR =========================== */
      /* =========================================================== */
      onCancel: function () {
        const oModel = this.getView().getModel();

        if (oModel.hasPendingChanges()) {
          oModel.resetChanges();
        }
        this.onNavBack();
      },

      /* =========================================================== */
      /* ====================== VOLTAR ============================= */
      /* =========================================================== */
      onNavBack: function () {
        const oHistory = sap.ui.core.routing.History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();
        const oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          oRouter.navTo("Main", {}, true);
        }
      },
    });
  }
);
