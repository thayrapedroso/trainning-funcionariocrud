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
        const oView = this.getView();
        const oModel = oView.getModel();

        // 🧠 Garante o formato correto da chave
        let sPath = `/FuncionarioSet(${sId})`;
        const oMeta = oModel.getMetaModel();
        const oEntityType = oMeta.getODataEntityType(
          "ZGW_HELLOWORLD00_SRV.Funcionario"
        );
        const oKeyProp = oEntityType.key.propertyRef[0].name;
        const oKeyType = oEntityType.property.find(
          (p) => p.name === oKeyProp
        )?.type;
        if (oKeyType && oKeyType.includes("String")) {
          sPath = `/FuncionarioSet('${sId}')`;
        }

        console.log("Binding path:", sPath);

        oView.bindElement({
          path: sPath,
          parameters: {
            expand: "",
            updateGroupId: "updateGroup",
          },
          events: {
            dataRequested: () => oView.setBusy(true),
            dataReceived: () => oView.setBusy(false),
          },
        });

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
      onSave: function () {
        const oModel = this.getView().getModel();
        const oCtx = this.getView().getBindingContext();

        if (!oCtx) {
          sap.m.MessageBox.error("Nenhum contexto encontrado para atualização");
          return;
        }

        const sPath = oCtx.getPath();
        const oData = oCtx.getObject();

        console.log("Salvando:", sPath, oData);

        // Tenta via submitChanges primeiro (caso o modelo rastreie pendências)
        if (oModel.hasPendingChanges()) {
          oModel.submitChanges({
            success: () => {
              sap.m.MessageToast.show("Alterações salvas com sucesso");
              this.onNavBack();
            },
            error: (oError) => {
              console.error("Erro no submitChanges:", oError);
              sap.m.MessageBox.error("Erro ao salvar alterações");
            },
          });
        } else {
          // Fallback: chama update() diretamente
          oModel.update(sPath, oData, {
            success: () => {
              sap.m.MessageToast.show("Atualização realizada com sucesso");
              this.onNavBack();
            },
            error: (e) => {
              console.error("Erro no update:", e);
              sap.m.MessageBox.error("Erro ao atualizar o registro");
            },
          });
        }
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
