/**
 * Created by zcf on 2016/9/26.
 */
BI.IntervalSlider = BI.inherit(BI.Widget, {
    _constant: {
        EDITOR_WIDTH: 58,
        EDITOR_R_GAP: 60,
        EDITOR_HEIGHT: 30,
        SLIDER_WIDTH_HALF: 15,
        SLIDER_WIDTH: 30,
        SLIDER_HEIGHT: 30,
        TRACK_HEIGHT: 24
    },

    _defaultConfig: function () {
        return BI.extend(BI.IntervalSlider.superclass._defaultConfig.apply(this, arguments), {
            baseCls: "bi-interval-slider bi-slider-track",
            digit: false,
            unit: ""
        })
    },

    _init: function () {
        BI.IntervalSlider.superclass._init.apply(this, arguments);

        var self = this;
        var c = this._constant;
        this.enable = false;
        this.valueOne = "";
        this.valueTwo = "";
        this.calculation = new BI.AccurateCalculationModel();

        // this.backgroundTrack = BI.createWidget({
        //     type: "bi.layout",
        //     cls: "background-track",
        //     height: c.TRACK_HEIGHT
        // });
        this.grayTrack = BI.createWidget({
            type: "bi.layout",
            cls: "gray-track",
            height: 6
        });
        this.blueTrack = BI.createWidget({
            type: "bi.layout",
            cls: "blue-track bi-high-light-background",
            height: 6
        });
        this.track = this._createTrackWrapper();

        this.labelOne = BI.createWidget({
            type: "bi.sign_text_editor",
            cls: "slider-editor-button",
            text: this.options.unit,
            errorText: "",
            allowBlank: false,
            width: c.EDITOR_WIDTH,
            validationChecker: function (v) {
                return self._checkValidation(v);
            }
        });
        this.labelOne.element.hover(function () {
            self.labelOne.element.removeClass("bi-border").addClass("bi-border");
        }, function () {
            self.labelOne.element.removeClass("bi-border");
        });
        this.labelOne.on(BI.Editor.EVENT_CONFIRM, function () {
            var v = BI.parseFloat(this.getValue());
            self.valueOne = v;
            var percent = self._getPercentByValue(v);
            var significantPercent = BI.parseFloat(percent.toFixed(1));//分成1000份
            self._setLabelOnePosition(significantPercent);
            self._setSliderOnePosition(significantPercent);
            self._setBlueTrack();
            self.fireEvent(BI.IntervalSlider.EVENT_CHANGE);
        });

        this.labelTwo = BI.createWidget({
            type: "bi.sign_text_editor",
            cls: "slider-editor-button",
            errorText: "",
            text: this.options.unit,
            allowBlank: false,
            width: c.EDITOR_WIDTH,
            validationChecker: function (v) {
                return self._checkValidation(v);
            }
        });
        this.labelTwo.element.hover(function () {
            self.labelTwo.element.removeClass("bi-border").addClass("bi-border");
        }, function () {
            self.labelTwo.element.removeClass("bi-border");
        });
        this.labelTwo.on(BI.Editor.EVENT_CONFIRM, function () {
            var v = BI.parseFloat(this.getValue());
            self.valueTwo = v;
            var percent = self._getPercentByValue(v);
            var significantPercent = BI.parseFloat(percent.toFixed(1));
            self._setLabelTwoPosition(significantPercent);
            self._setSliderTwoPosition(significantPercent);
            self._setBlueTrack();
            self.fireEvent(BI.IntervalSlider.EVENT_CHANGE);
        });

        this.sliderOne = BI.createWidget({
            type: "bi.single_slider_button"
        });
        this.sliderTwo = BI.createWidget({
            type: "bi.single_slider_button"
        });
        this._draggable(this.sliderOne, true);
        this._draggable(this.sliderTwo, false);
        this._setVisible(false);

        BI.createWidget({
            type: "bi.absolute",
            element: this,
            items: [{
                el: {
                    type: "bi.vertical",
                    items: [{
                        type: "bi.absolute",
                        items: [{
                            el: this.track,
                            width: "100%",
                            height: c.TRACK_HEIGHT
                        }]
                    }],
                    hgap: 7,
                    height: c.TRACK_HEIGHT
                },
                top: 23,
                left: 0,
                width: "100%"
            },
                this._createLabelWrapper(),
                this._createSliderWrapper()
            ]
        })
    },

    _rePosBySizeAfterMove: function (size, isLeft) {
        var o = this.options;
        var percent = size * 100 / (this._getGrayTrackLength());
        var significantPercent = BI.parseFloat(percent.toFixed(1));
        var v = this._getValueByPercent(significantPercent);
        v = this._assertValue(v);
        v = o.digit === false ? v : v.toFixed(o.digit);
        if(isLeft){
            this._setLabelOnePosition(significantPercent);
            this._setSliderOnePosition(significantPercent);
            this.labelOne.setValue(v);
            this.valueOne = v;
        }else{
            this._setLabelTwoPosition(significantPercent);
            this._setSliderTwoPosition(significantPercent);
            this.labelTwo.setValue(v);
            this.valueTwo = v;
        }
        this._setBlueTrack();
    },

    _rePosBySizeAfterStop: function (size, isLeft) {
        var percent = size * 100 / (this._getGrayTrackLength());
        var significantPercent = BI.parseFloat(percent.toFixed(1));
        isLeft ? this._setSliderOnePosition(significantPercent) : this._setSliderTwoPosition(significantPercent);
    },

    _draggable: function (widget, isLeft) {
        var self = this, o = this.options;
        var startDrag = false;
        var size = 0, offset = 0, defaultSize = 0;
        var mouseMoveTracker = new BI.MouseMoveTracker(function (deltaX) {
            if (mouseMoveTracker.isDragging()) {
                startDrag = true;
                offset += deltaX;
                size = optimizeSize(defaultSize + offset);
                widget.element.addClass("dragging");
                self._rePosBySizeAfterMove(size, isLeft);
            }
        }, function () {
            if (startDrag === true) {
                size = optimizeSize(size);
                self._rePosBySizeAfterStop(size, isLeft);
                size = 0;
                offset = 0;
                defaultSize = size;
                startDrag = false;
            }
            widget.element.removeClass("dragging");
            mouseMoveTracker.releaseMouseMoves();
            self.fireEvent(BI.IntervalSlider.EVENT_CHANGE);
        }, document);
        widget.element.on("mousedown", function (event) {
            if(!widget.isEnabled()){
                return;
            }
            defaultSize = this.offsetLeft;
            optimizeSize(defaultSize);
            mouseMoveTracker.captureMouseMoves(event);
        });

        function optimizeSize(s) {
            return BI.clamp(s, 0, self._getGrayTrackLength());
        }
    },

    _createLabelWrapper: function () {
        var c = this._constant;
        return {
            el: {
                type: "bi.vertical",
                items: [{
                    type: "bi.absolute",
                    items: [{
                        el: this.labelOne,
                        top: 0,
                        left: "0%"
                    }]
                }, {
                    type: "bi.absolute",
                    items: [{
                        el: this.labelTwo,
                        top: 0,
                        left: "100%"
                    }]
                }],
                rgap: c.EDITOR_R_GAP,
                height: 70
            },
            top: 0,
            left: 0,
            width: "100%"
        }
    },

    _createSliderWrapper: function () {
        var c = this._constant;
        return {
            el: {
                type: "bi.vertical",
                items: [{
                    type: "bi.absolute",
                    items: [{
                        el: this.sliderOne,
                        top: 0,
                        left: "0%"
                    }]
                }, {
                    type: "bi.absolute",
                    items: [{
                        el: this.sliderTwo,
                        top: 0,
                        left: "100%"
                    }]
                }],
                hgap: c.SLIDER_WIDTH_HALF,
                height: c.SLIDER_HEIGHT
            },
            top: 20,
            left: 0,
            width: "100%"
        }
    },

    _createTrackWrapper: function () {
        return BI.createWidget({
            type: "bi.absolute",
            items: [{
                el: {
                    type: "bi.vertical",
                    items: [{
                        type: "bi.absolute",
                        items: [{
                            el: this.grayTrack,
                            top: 0,
                            left: 0,
                            width: "100%"
                        }, {
                            el: this.blueTrack,
                            top: 0,
                            left: 0,
                            width: "0%"
                        }]
                    }],
                    hgap: 8,
                    height: 8
                },
                top: 8,
                left: 0,
                width: "100%"
            }]
        })
    },

    _checkValidation: function (v) {
        return BI.isNumeric(v) && !(BI.isNull(v) || v < this.min || v > this.max)
    },

    _checkOverlap: function () {
        var labelOneLeft = this.labelOne.element[0].offsetLeft;
        var labelTwoLeft = this.labelTwo.element[0].offsetLeft;
        if (labelOneLeft <= labelTwoLeft) {
            if ((labelTwoLeft - labelOneLeft) < 90) {
                this.labelTwo.element.css({"top": 40});
            } else {
                this.labelTwo.element.css({"top": 0});
            }
        } else {
            if ((labelOneLeft - labelTwoLeft) < 90) {
                this.labelTwo.element.css({"top": 40});
            } else {
                this.labelTwo.element.css({"top": 0});
            }
        }
    },

    _setLabelOnePosition: function (percent) {
        this.labelOne.element.css({"left": percent + "%"});
        this._checkOverlap();
    },

    _setLabelTwoPosition: function (percent) {
        this.labelTwo.element.css({"left": percent + "%"});
        this._checkOverlap();
    },

    _setSliderOnePosition: function (percent) {
        this.sliderOne.element.css({"left": percent + "%"});
    },

    _setSliderTwoPosition: function (percent) {
        this.sliderTwo.element.css({"left": percent + "%"});
    },

    _setBlueTrackLeft: function (percent) {
        this.blueTrack.element.css({"left": percent + "%"});
    },

    _setBlueTrackWidth: function (percent) {
        this.blueTrack.element.css({"width": percent + "%"});
    },

    _setBlueTrack: function () {
        var percentOne = this._getPercentByValue(this.labelOne.getValue());
        var percentTwo = this._getPercentByValue(this.labelTwo.getValue());
        if (percentOne <= percentTwo) {
            this._setBlueTrackLeft(percentOne);
            this._setBlueTrackWidth(percentTwo - percentOne);
        } else {
            this._setBlueTrackLeft(percentTwo);
            this._setBlueTrackWidth(percentOne - percentTwo);
        }
    },

    _setAllPosition: function (one, two) {
        this._setSliderOnePosition(one);
        this._setLabelOnePosition(one);
        this._setSliderTwoPosition(two);
        this._setLabelTwoPosition(two);
        this._setBlueTrack();
    },

    _setVisible: function (visible) {
        this.sliderOne.setVisible(visible);
        this.sliderTwo.setVisible(visible);
        this.labelOne.setVisible(visible);
        this.labelTwo.setVisible(visible);
    },

    _setErrorText: function () {
        var errorText = BI.i18nText("BI-Please_Enter") + this.min + "-" + this.max + BI.i18nText("BI-Basic_De") + BI.i18nText("BI-Basic_Number");
        this.labelOne.setErrorText(errorText);
        this.labelTwo.setErrorText(errorText);
    },

    _getGrayTrackLength: function () {
        return this.grayTrack.element[0].scrollWidth
    },

    //其中取max-min后保留4为有效数字后的值的小数位数为最终value的精度
    _getValueByPercent: function (percent) {//return (((max-min)*percent)/100+min)
        var sub = this.calculation.accurateSubtraction(this.max, this.min);
        var mul = this.calculation.accurateMultiplication(sub, percent);
        var div = this.calculation.accurateDivisionTenExponent(mul, 2);
        if(this.precision < 0){
            var value = BI.parseFloat(this.calculation.accurateAddition(div, this.min));
            var reduceValue = Math.round(this.calculation.accurateDivisionTenExponent(value, -this.precision));
            return this.calculation.accurateMultiplication(reduceValue, Math.pow(10, -this.precision));
        }else{
            return BI.parseFloat(this.calculation.accurateAddition(div, this.min).toFixed(this.precision));
        }
    },

    _getPercentByValue: function (v) {
        return (v - this.min) * 100 / (this.max - this.min);
    },

    _setDraggableEnable: function (enable) {
        this.sliderOne.setEnable(enable);
        this.sliderTwo.setEnable(enable);
    },

    _getPrecision: function () {
        //计算每一份值的精度(最大值和最小值的差值保留4为有效数字后的精度)
        //如果差值的整数位数大于4,toPrecision(4)得到的是科学计数法123456 => 1.235e+5
        //返回非负值: 保留的小数位数
        //返回负值: 保留的10^n精度中的n
        var sub = this.calculation.accurateSubtraction(this.max, this.min);
        var pre = sub.toPrecision(4);
        //科学计数法
        var eIndex = pre.indexOf("e");
        var arr = [];
        if(eIndex > -1){
            arr = pre.split("e");
            var decimalPartLength = BI.size(arr[0].split(".")[1]);
            var sciencePartLength = BI.parseInt(arr[1].substring(1));
            return decimalPartLength - sciencePartLength;
        }else{
            arr = pre.split(".");
            return arr.length > 1 ? arr[1].length : 0;
        }
    },

    _assertValue: function (value) {
        if(value <= this.min){
            return this.min
        }
        if(value >= this.max){
            return this.max;
        }
        return value;
    },

    getValue: function () {
        if (this.valueOne <= this.valueTwo) {
            return {min: this.valueOne, max: this.valueTwo}
        } else {
            return {min: this.valueTwo, max: this.valueOne}
        }
    },

    setMinAndMax: function (v) {
        var minNumber = BI.parseFloat(v.min);
        var maxNumber = BI.parseFloat(v.max);
        if ((!isNaN(minNumber)) && (!isNaN(maxNumber)) && (maxNumber >= minNumber )) {
            this.min = minNumber;
            this.max = maxNumber;
            this.valueOne = minNumber;
            this.valueTwo = maxNumber;
            this.precision = this._getPrecision();
            this._setDraggableEnable(true);
        }
        if (maxNumber === minNumber) {
            this._setDraggableEnable(false);
        }
    },

    setValue: function (v) {
        var o = this.options;
        var valueOne = BI.parseFloat(v.min);
        var valueTwo = BI.parseFloat(v.max);
        valueOne = o.digit === false ? valueOne : valueOne.toFixed(o.digit);
        valueTwo = o.digit === false ? valueTwo : valueTwo.toFixed(o.digit);
        if (!isNaN(valueOne) && !isNaN(valueTwo)) {
            if (this._checkValidation(valueOne)) {
                this.valueOne = valueOne;
            }
            if (this._checkValidation(valueTwo)) {
                this.valueTwo = valueTwo;
            }
            if (valueOne < this.min) {
                this.valueOne = this.min;
            }
            if (valueTwo > this.max) {
                this.valueTwo = this.max;
            }
        }
    },

    reset: function () {
        this._setVisible(false);
        this.enable = false;
        this.valueOne = "";
        this.valueTwo = "";
        this.min = NaN;
        this.max = NaN;
        this._setBlueTrackWidth(0);
    },

    populate: function () {
        if (!isNaN(this.min) && !isNaN(this.max)) {
            this.enable = true;
            this._setVisible(true);
            this._setErrorText();
            if ((BI.isNumeric(this.valueOne) || BI.isNotEmptyString(this.valueOne)) && (BI.isNumeric(this.valueTwo) || BI.isNotEmptyString(this.valueTwo))) {
                this.labelOne.setValue(this.valueOne);
                this.labelTwo.setValue(this.valueTwo);
                this._setAllPosition(this._getPercentByValue(this.valueOne), this._getPercentByValue(this.valueTwo));
            } else {
                this.labelOne.setValue(this.min);
                this.labelTwo.setValue(this.max);
                this._setAllPosition(0, 100)
            }
        }
    }
});
BI.IntervalSlider.EVENT_CHANGE = "EVENT_CHANGE";
BI.shortcut("bi.interval_slider", BI.IntervalSlider);