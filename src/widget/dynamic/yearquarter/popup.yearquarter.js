BI.DynamicYearQuarterPopup = BI.inherit(BI.Widget, {
    constants: {
        tabHeight: 30
    },

    props: {
        baseCls: "bi-year-quarter-popup",
        behaviors: {},
        min: "1900-01-01", // 最小日期
        max: "2099-12-31", // 最大日期,
        width: 180,
        height: 240
    },

    render: function () {
        var self = this, opts = this.options;
        this.storeValue = {type: BI.DynamicYearQuarterCombo.Static};
        return {
            type: "bi.vtape",
            items: [{
                el: this._getTabJson()
            }, {
                el: {
                    type: "bi.grid",
                    items: [[{
                        type: "bi.text_button",
                        forceCenter: true,
                        cls: "bi-border-top bi-high-light",
                        shadow: true,
                        text: BI.i18nText("BI-Basic_Clear"),
                        listeners: [{
                            eventName: BI.TextButton.EVENT_CHANGE,
                            action: function () {
                                self.fireEvent(BI.DynamicYearQuarterPopup.BUTTON_CLEAR_EVENT_CHANGE);
                            }
                        }]
                    }, {
                        type: "bi.text_button",
                        forceCenter: true,
                        cls: "bi-border-left bi-border-right bi-border-top",
                        shadow: true,
                        text: BI.i18nText("BI-Basic_Current_Quarter"),
                        ref: function () {
                            self.textButton = this;
                        },
                        listeners: [{
                            eventName: BI.TextButton.EVENT_CHANGE,
                            action: function () {
                                self.fireEvent(BI.DynamicYearQuarterPopup.BUTTON_lABEL_EVENT_CHANGE);
                            }
                        }]
                    }, {
                        type: "bi.text_button",
                        forceCenter: true,
                        cls: "bi-border-top bi-high-light",
                        shadow: true,
                        text: BI.i18nText("BI-Basic_OK"),
                        listeners: [{
                            eventName: BI.TextButton.EVENT_CHANGE,
                            action: function () {
                                self.fireEvent(BI.DynamicYearQuarterPopup.BUTTON_OK_EVENT_CHANGE);
                            }
                        }]
                    }]]
                },
                height: 24
            }]
        };
    },

    _setInnerValue: function () {
        if (this.dateTab.getSelect() === BI.DynamicYearQuarterCombo.Static) {
            this.textButton.setValue(BI.i18nText("BI-Basic_Current_Quarter"));
            this.textButton.setEnable(true);
        } else {
            var date = BI.DynamicDateHelper.getCalculation(this.dynamicPane.getValue());
            date = date.print("%Y-%x");
            this.textButton.setValue(date);
            this.textButton.setEnable(false);
        }
    },

    _getTabJson: function () {
        var self = this, o = this.options;
        return {
            type: "bi.tab",
            showIndex: BI.DynamicYearQuarterCombo.Static,
            ref: function () {
                self.dateTab = this;
            },
            tab: {
                height: this.constants.tabHeight,
                items: BI.createItems([{
                    text: BI.i18nText("BI-Basic_Year_Fen"),
                    value: BI.DynamicYearQuarterCombo.Static
                }, {
                    text: BI.i18nText("BI-Basic_Dynamic_Title"),
                    value: BI.DynamicYearQuarterCombo.Dynamic
                }], {
                    textAlign: "center",
                    cls: "bi-list-item-active"
                }),
                layouts: [{
                    type: "bi.center"
                }]
            },
            cardCreator: function (v) {
                switch (v) {
                    case BI.DynamicYearQuarterCombo.Dynamic:
                        return {
                            type: "bi.dynamic_year_quarter_card",
                            listeners: [{
                                eventName: "EVENT_CHANGE",
                                action: function () {
                                    self._setInnerValue(self.year, v);
                                }
                            }],
                            ref: function () {
                                self.dynamicPane = this;
                            }
                        };
                    case BI.DynamicYearQuarterCombo.Static:
                    default:
                        return {
                            type: "bi.static_year_quarter_card",
                            behaviors: o.behaviors,
                            min: self.options.min,
                            max: self.options.max,
                            listeners: [{
                                eventName: BI.YearCard.EVENT_CHANGE,
                                action: function () {
                                    self.fireEvent(BI.DynamicYearQuarterPopup.EVENT_CHANGE);
                                }
                            }],
                            ref: function () {
                                self.year = this;
                            }
                        };
                }
            },
            listeners: [{
                eventName: BI.Tab.EVENT_CHANGE,
                action: function () {
                    var v = self.dateTab.getSelect();
                    switch (v) {
                        case BI.DynamicYearQuarterCombo.Static:
                            var date = BI.DynamicDateHelper.getCalculation(self.dynamicPane.getValue());
                            self.year.setValue({year: date.getFullYear(), quarter: date.getQuarter()});
                            self._setInnerValue();
                            break;
                        case BI.DynamicYearQuarterCombo.Dynamic:
                        default:
                            if(self.storeValue && self.storeValue.type === BI.DynamicYearQuarterCombo.Dynamic) {
                                self.dynamicPane.setValue(self.storeValue.value);
                            }else{
                                self.dynamicPane.setValue({
                                    year: 0
                                });
                            }
                            self._setInnerValue();
                            break;
                    }
                }
            }]
        };
    },

    setValue: function (v) {
        this.storeValue = v;
        var self = this;
        var type, value;
        v = v || {};
        type = v.type || BI.DynamicDateCombo.Static;
        value = v.value || v;
        this.dateTab.setSelect(type);
        switch (type) {
            case BI.DynamicDateCombo.Dynamic:
                this.dynamicPane.setValue(value);
                self._setInnerValue();
                break;
            case BI.DynamicDateCombo.Static:
            default:
                this.year.setValue(value);
                this.textButton.setValue(BI.i18nText("BI-Basic_Current_Quarter"));
                this.textButton.setEnable(true);
                break;
        }
    },

    getValue: function () {
        return {
            type: this.dateTab.getSelect(),
            value: this.dateTab.getValue()
        };
    }

});
BI.DynamicYearQuarterPopup.BUTTON_CLEAR_EVENT_CHANGE = "BUTTON_CLEAR_EVENT_CHANGE";
BI.DynamicYearQuarterPopup.BUTTON_lABEL_EVENT_CHANGE = "BUTTON_lABEL_EVENT_CHANGE";
BI.DynamicYearQuarterPopup.BUTTON_OK_EVENT_CHANGE = "BUTTON_OK_EVENT_CHANGE";
BI.DynamicYearQuarterPopup.EVENT_CHANGE = "EVENT_CHANGE";
BI.shortcut("bi.dynamic_year_quarter_popup", BI.DynamicYearQuarterPopup);