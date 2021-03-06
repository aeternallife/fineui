/**
 * 年份展示面板
 *
 * Created by GUY on 2015/9/2.
 * @class BI.YearCard
 * @extends BI.Trigger
 */
BI.DynamicYearCard = BI.inherit(BI.Widget, {

    props: {
        baseCls: "bi-year-card"
    },

    render: function () {
        var self = this;
        return {
            type: "bi.vertical",
            items: [{
                type: "bi.label",
                text: BI.i18nText("BI-Multi_Date_Relative_Current_Time"),
                textAlign: "left",
                height: 24
            }, {
                type: "bi.dynamic_date_param_item",
                ref: function () {
                    self.item = this;
                },
                listeners: [{
                    eventName: "EVENT_CHANGE",
                    action: function () {
                        self.fireEvent("EVENT_CHANGE");
                    }
                }]
            }],
            vgap: 10,
            hgap: 10
        };
    },

    _createValue: function (type, v) {
        return {
            dateType: type,
            value: Math.abs(v),
            offset: v > 0 ? 1 : 0
        };
    },

    setValue: function (v) {
        v = v || {year: 0};
        this.item.setValue(this._createValue(BI.DynamicDateCard.TYPE.YEAR, v.year));
    },

    getValue: function () {
        var value = this.item.getValue();
        return {
            year: (value.offset === 0 ? -value.value : value.value)
        };
    }
});
BI.DynamicYearCard.EVENT_CHANGE = "EVENT_CHANGE";
BI.shortcut("bi.dynamic_year_card", BI.DynamicYearCard);