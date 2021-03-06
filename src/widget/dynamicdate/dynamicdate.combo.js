BI.DynamicDateCombo = BI.inherit(BI.Single, {
    constants: {
        popupHeight: 259,
        popupWidth: 270,
        comboAdjustHeight: 1,
        border: 1,
        DATE_MIN_VALUE: "1900-01-01",
        DATE_MAX_VALUE: "2099-12-31"
    },

    props: {
        baseCls: "bi-dynamic-date-combo bi-border",
        height: 24
    },


    render: function () {
        var self = this, opts = this.options;
        this.storeTriggerValue = "";
        var date = BI.getDate();
        this.storeValue = opts.value;
        return {
            type: "bi.htape",
            items: [{
                el: {
                    type: "bi.icon_button",
                    cls: "bi-trigger-icon-button date-change-h-font",
                    width: 24,
                    height: 24,
                    ref: function () {
                        self.changeIcon = this;
                    }
                },
                width: 30
            }, {
                type: "bi.absolute",
                items: [{
                    el: {
                        type: "bi.combo",
                        ref: function () {
                            self.combo = this;
                        },
                        toggle: false,
                        isNeedAdjustHeight: false,
                        isNeedAdjustWidth: false,
                        el: {
                            type: "bi.dynamic_date_trigger",
                            min: this.constants.DATE_MIN_VALUE,
                            max: this.constants.DATE_MAX_VALUE,
                            value: opts.value,
                            ref: function () {
                                self.trigger = this;
                            },
                            listeners: [{
                                eventName: BI.DynamicDateTrigger.EVENT_KEY_DOWN,
                                action: function () {
                                    if (self.combo.isViewVisible()) {
                                        self.combo.hideView();
                                    }
                                }
                            }, {
                                eventName: BI.DynamicDateTrigger.EVENT_STOP,
                                action: function () {
                                    if (!self.combo.isViewVisible()) {
                                        self.combo.showView();
                                    }
                                }
                            }, {
                                eventName: BI.DynamicDateTrigger.EVENT_TRIGGER_CLICK,
                                action: function () {
                                    self.combo.toggle();
                                }
                            }, {
                                eventName: BI.DynamicDateTrigger.EVENT_FOCUS,
                                action: function () {
                                    self.storeTriggerValue = self.trigger.getKey();
                                    if (!self.combo.isViewVisible()) {
                                        self.combo.showView();
                                    }
                                    self.fireEvent(BI.DynamicDateCombo.EVENT_FOCUS);
                                }
                            }, {
                                eventName: BI.DynamicDateTrigger.EVENT_ERROR,
                                action: function () {
                                    self.storeValue = {
                                        year: date.getFullYear(),
                                        month: date.getMonth()
                                    };
                                    self.popup.setValue();
                                    self.fireEvent(BI.DynamicDateCombo.EVENT_ERROR);
                                }
                            }, {
                                eventName: BI.DynamicDateTrigger.EVENT_VALID,
                                action: function () {
                                    self.fireEvent(BI.DynamicDateCombo.EVENT_VALID);
                                }
                            }, {
                                eventName: BI.DynamicDateTrigger.EVENT_CHANGE,
                                action: function () {
                                    self.fireEvent(BI.DynamicDateCombo.EVENT_CHANGE);
                                }
                            }, {
                                eventName: BI.DynamicDateTrigger.EVENT_CONFIRM,
                                action: function () {
                                    if (self.combo.isViewVisible()) {
                                        return;
                                    }
                                    var dateStore = self.storeTriggerValue;
                                    var dateObj = self.trigger.getKey();
                                    if (BI.isNotEmptyString(dateObj) && !BI.isEqual(dateObj, dateStore)) {
                                        self.storeValue = self.trigger.getValue();
                                        self.setValue(self.trigger.getValue());
                                    } else if (BI.isEmptyString(dateObj)) {
                                        self.storeValue = null;
                                        self.trigger.setValue();
                                    }
                                    self.fireEvent(BI.DynamicDateCombo.EVENT_CONFIRM);
                                }
                            }]
                        },
                        adjustLength: this.constants.comboAdjustHeight,
                        popup: {
                            el: {
                                type: "bi.dynamic_date_popup",
                                min: this.constants.DATE_MIN_VALUE,
                                max: this.constants.DATE_MAX_VALUE,
                                value: opts.value,
                                ref: function () {
                                    self.popup = this;
                                },
                                listeners: [{
                                    eventName: BI.DynamicDatePopup.BUTTON_CLEAR_EVENT_CHANGE,
                                    action: function () {
                                        self.setValue();
                                        self.combo.hideView();
                                        self.fireEvent(BI.DynamicDateCombo.EVENT_CONFIRM);
                                    }
                                }, {
                                    eventName: BI.DynamicDatePopup.BUTTON_lABEL_EVENT_CHANGE,
                                    action: function () {
                                        var date = BI.getDate();
                                        self.setValue({
                                            year: date.getFullYear(),
                                            month: date.getMonth(),
                                            day: date.getDate()
                                        });
                                        self.combo.hideView();
                                        self.fireEvent(BI.DynamicDateCombo.EVENT_CONFIRM);
                                    }
                                }, {
                                    eventName: BI.DynamicDatePopup.BUTTON_OK_EVENT_CHANGE,
                                    action: function () {
                                        self.setValue(self.popup.getValue());
                                        self.combo.hideView();
                                        self.fireEvent(BI.DynamicDateCombo.EVENT_CONFIRM);
                                    }
                                }, {
                                    eventName: BI.DynamicDatePopup.EVENT_CHANGE,
                                    action: function () {
                                        self.setValue(self.popup.getValue());
                                        self.combo.hideView();
                                        self.fireEvent(BI.DynamicDateCombo.EVENT_CONFIRM);
                                    }
                                }]
                            },
                            stopPropagation: false
                        },
                        listeners: [{
                            eventName: BI.Combo.EVENT_BEFORE_POPUPVIEW,
                            action: function () {
                                self.popup.setValue(self.storeValue);
                                self.fireEvent(BI.DynamicDateCombo.EVENT_BEFORE_POPUPVIEW);
                            }
                        }]
                    },
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                }, {
                    el: {
                        type: "bi.icon_button",
                        cls: "bi-trigger-icon-button date-font",
                        width: 24,
                        height: 24,
                        listeners: [{
                            eventName: BI.IconButton.EVENT_CHANGE,
                            action: function () {
                                if (self.combo.isViewVisible()) {
                                    self.combo.hideView();
                                } else {
                                    self.combo.showView();
                                }
                            }
                        }]
                    },
                    top: 0,
                    right: 0
                }]
            }],
            ref: function (_ref) {
                self.comboWrapper = _ref;
            }
        };
    },

    mounted: function () {
        this._checkDynamicValue(this.options.value);
    },

    _checkDynamicValue: function (v) {
        var type = null;
        if (BI.isNotNull(v)) {
            type = v.type;
        }
        switch (type) {
            case BI.DynamicDateCombo.Dynamic:
                this.changeIcon.setVisible(true);
                this.comboWrapper.attr("items")[0].width = 30;
                this.comboWrapper.resize();
                break;
            default:
                this.comboWrapper.attr("items")[0].width = 0;
                this.comboWrapper.resize();
                this.changeIcon.setVisible(false);
                break;
        }
    },

    setValue: function (v) {
        this.storeValue = v;
        this.trigger.setValue(v);
        this._checkDynamicValue(v);
    },
    getValue: function () {
        return this.storeValue;
    },
    getKey: function () {
        return this.trigger.getKey();
    },
    hidePopupView: function () {
        this.combo.hideView();
    }
});

BI.DynamicDateCombo.EVENT_CONFIRM = "EVENT_CONFIRM";
BI.DynamicDateCombo.EVENT_FOCUS = "EVENT_FOCUS";
BI.DynamicDateCombo.EVENT_CHANGE = "EVENT_CHANGE";
BI.DynamicDateCombo.EVENT_VALID = "EVENT_VALID";
BI.DynamicDateCombo.EVENT_ERROR = "EVENT_ERROR";
BI.DynamicDateCombo.EVENT_BEFORE_POPUPVIEW = "BI.DynamicDateCombo.EVENT_BEFORE_POPUPVIEW";

BI.shortcut("bi.dynamic_date_combo", BI.DynamicDateCombo);

BI.extend(BI.DynamicDateCombo, {
    Static: 1,
    Dynamic: 2
});