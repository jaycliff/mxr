/*
    Copyright 2016 Jaycliff Arcilla of Eversun Software Philippines Corporation

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
/*
    DEPENDENCIES:
        jQuery library
        domxy
*/
/*global Math, Number, document, window, jQuery, module*/
/*jslint bitwise: false, unparam: true*/
/*jshint bitwise: false, unused: false*/
if (typeof Number.toInteger !== "function") {
    Number.toInteger = function toInteger(arg) {
        "use strict";
        // ToInteger conversion
        arg = Number(arg);
        return (arg !== arg) ? 0 : (arg === 0 || arg === Infinity || arg === -Infinity) ? arg : (arg > 0) ? Math.floor(arg) : Math.ceil(arg);
    };
}
if (typeof Number.isFinite !== "function") {
    Number.isFinite = function isFinite(value) {
        "use strict";
        return typeof value === "number" && isFinite(value);
    };
}
if (typeof Math.toDegrees !== "function") {
    Math.toDegrees = function toDegrees(radians) {
        "use strict";
        return (radians * 180) / Math.PI;
    };
}
if (typeof String.prototype.trim !== "function") {
    String.prototype.trim = function trim() {
        "use strict";
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}
(function (window, $, undef) {
    "use strict";
    var $document = $(document),
        $window = $(window),
        applier = (function () {
            var list = [];
            return function (func, obj, args) {
                var i, length = args.length, result;
                list.length = 0;
                for (i = 0; i < length; i += 1) {
                    list.push(args[i]);
                }
                result = func.apply(obj, list);
                list.length = 0;
                return result;
            };
        }());
    if (typeof $.fn.getX !== "function") {
        $.fn.getX = function () {
            return this.offset().left;
        };
    }
    if (typeof $.fn.getY !== "function") {
        $.fn.getY = function () {
            return this.offset().top;
        };
    }
    function decimalDigitsLength(num) {
        var string, dot_index;
        if (typeof num !== "number") {
            throw new TypeError('parameter must be a number');
        }
        string = String(num);
        dot_index = string.indexOf('.');
        if (dot_index < 0) {
            return 0;
        }
        return string.length - (dot_index + 1);
    }
    function valueByStep(value, step) {
        if (typeof step !== "number") {
            step = 1;
        }
        return +((Math.round(value / step) * step).toFixed(decimalDigitsLength(step)));
    }
    $.createControlKnob = function (options) {
        var is_options_valid = $.type(options) === 'object',
            $ck_wrap = $(document.createElement('span')),
            $ck_subwrap = $(document.createElement('span')),
            $ck_anchor = $(document.createElement('span')),
            $ck_handle = $(document.createElement('span')),
            $ck_decal = $(document.createElement('span')),
            $ck_value = $(document.createElement('span')),
            $ck_label_wrap = $(document.createElement('span')),
            $ck_min_label = $(document.createElement('span')),
            $ck_max_label = $(document.createElement('span')),
            $ck_bands_wrap = $(document.createElement('span')),
            $ck_band,
            $hot_swap_dummy = $(document.createElement('span')),
            hasOwnProperty = Object.prototype.hasOwnProperty,
            band_list = [],
            $band,
            number_of_bands = (is_options_valid && hasOwnProperty.call(options, 'numberOfBands')) ? Math.abs(parseInt(options.numberOfBands, 10)) - 1 : 30,
            degree_increment = 270 / number_of_bands,
            degrees,
            t,
            tlen,
            parts_list,
            refreshControls,
            trigger_param_list = [],
            $_proto = $.fn,
            default_tab_index = (is_options_valid && Number.toInteger(options.tabIndex)) || 0,
            tab_index = default_tab_index,
            active = false,
            disabled = true,
            transition_class_added = false,
            properties,
            angle = 0,
            minangle = 0,
            maxangle = 270,
            prev_input_value,
            prev_change_value,
            control_knob_object,
            $control_knob_object;
        properties = (function () {
            var obj = {},
                temp,
                user_set = false,
                def_step = 1,
                def_min = 0,
                def_max = 100,
                def_value,
                def_angle,
                do_median_value = true,
                step = def_step,
                min = def_min,
                max = def_max,
                value;
            if (is_options_valid) {
                if (hasOwnProperty.call(options, 'step')) {
                    temp = Number(options.step) || 1;
                    if (temp < 0) {
                        temp = 1;
                    }
                    if (Number.isFinite(temp)) {
                        def_step = temp;
                        step = def_step;
                    }
                }
                if (hasOwnProperty.call(options, 'max')) {
                    temp = Number(options.max) || 0;
                    if (Number.isFinite(temp)) {
                        def_max = temp;
                        max = def_max;
                    }
                }
                if (hasOwnProperty.call(options, 'min')) {
                    temp = Number(options.min) || 0;
                    if (Number.isFinite(temp)) {
                        def_min = temp;
                        min = def_min;
                    }
                }
                if (hasOwnProperty.call(options, 'value')) {
                    temp = Number(options.value) || 0;
                    if (Number.isFinite(temp)) {
                        def_value = temp;
                        value = def_value;
                        do_median_value = false;
                    }
                }
            }
            if (do_median_value) {
                def_value = (min >= max) ? min : (min + ((max - min) / 2));
                value = def_value;
            }
            def_angle = ((value - min) / (max - min)) * maxangle;
            angle = def_angle;
            Object.defineProperties(obj, {
                "max": {
                    get: function () {
                        var c_max = max;
                        if ((c_max < min) && (min < 100)) {
                            c_max = 100;
                        }
                        return c_max;
                    },
                    set: function (val) {
                        max = val;
                    }
                },
                "min": {
                    get: function () {
                        return min;
                    },
                    set: function (val) {
                        min = val;
                    }
                },
                "value": {
                    get: function () {
                        var c_max = this.max, val = value;
                        if (val > c_max) {
                            val = c_max;
                        }
                        if (val < min) {
                            val = min;
                        }
                        return (user_set) ? val : valueByStep(val, step);
                    },
                    set: function (val) {
                        value = val;
                        user_set = true;
                    }
                },
                "step": {
                    get: function () {
                        return step;
                    },
                    set: function (val) {
                        step = val;
                    }
                }
            });
            obj.reset = function () {
                max = def_max;
                min = def_min;
                value = def_value;
                angle = def_angle;
            };
            return obj;
        }());
        prev_input_value = properties.value;
        prev_change_value = prev_input_value;
        for (t = 0, tlen = number_of_bands, degrees = 0; t <= tlen; t += 1) {
            if (t > 0) {
                degrees += degree_increment;
            }
            $band = $(document.createElement('span')).css('transform', 'rotate(' + (degrees - 45) + 'deg)');
            $band.data('$self', $band);
            band_list.push($band[0]);
        }
        $ck_band = $(band_list);
        parts_list = [$ck_wrap, $ck_subwrap, $ck_anchor, $ck_handle, $ck_decal, $ck_value, $ck_label_wrap, $ck_min_label, $ck_max_label, $ck_bands_wrap, $ck_band];
        function displayBands(show) {
            if (arguments.length > 0) {
                $ck_bands_wrap.toggle(!!show);
                return control_knob_object;
            }
            return $ck_bands_wrap.is(':visible');
        }
        function displayLabels(show) {
            if (arguments.length > 0) {
                show = !!show;
                $ck_label_wrap.toggle(show);
                return control_knob_object;
            }
            return $ck_label_wrap.is(':visible');
        }
        function displayValue(show) {
            if (arguments.length > 0) {
                $ck_value.toggle(!!show);
                return control_knob_object;
            }
            return $ck_value.is(':visible');
        }
        function initializeParts() {
            $ck_wrap.addClass('control-knob').addClass('ck-wrap');
            $ck_subwrap.addClass('ck-subwrap');
            $ck_anchor.addClass('ck-anchor');
            $ck_handle.addClass('ck-handle');
            $ck_decal.addClass('ck-decal');
            $ck_value.addClass('ck-value').text(properties.value.toFixed(2));
            $ck_label_wrap.addClass('ck-label-wrap');
            $ck_min_label.addClass('ck-min-label').text('MIN');
            $ck_max_label.addClass('ck-max-label').text('MAX');
            $ck_bands_wrap.addClass('ck-bands-wrap');
            $ck_band.addClass('ck-band');
            // Connect the parts
            $ck_wrap
                .append($ck_subwrap)
                .attr('tabindex', tab_index);
            $ck_subwrap
                .append($ck_bands_wrap)
                .append($ck_label_wrap)
                .append($ck_anchor);
            $ck_label_wrap
                .append($ck_min_label)
                .append($ck_max_label);
            $ck_anchor
                .append($ck_handle)
                .append($ck_value);
            $ck_handle.append($ck_decal);
            $ck_bands_wrap.append($ck_band);
            if (is_options_valid) {
                if (hasOwnProperty.call(options, 'showBands')) {
                    displayBands(options.showBands);
                }
                if (hasOwnProperty.call(options, 'showLabels')) {
                    displayLabels(options.showLabels);
                }
                if (hasOwnProperty.call(options, 'showValue')) {
                    displayValue(options.showValue);
                }
                if (hasOwnProperty.call(options, 'width')) {
                    $ck_wrap.css('width', options.width);
                }
                if (hasOwnProperty.call(options, 'height')) {
                    $ck_wrap.css('height', options.height);
                }
            }
        }
        initializeParts();
        // Some utilities
        function removeTransitionClass() {
            //console.log('removeTransitionClass');
            $ck_subwrap
                .removeClass('ck-transition')
                .off('transitionend', removeTransitionClass);
            transition_class_added = false;
        }
        function addTransitionClass() {
            //console.log('addTransitionClass');
            $ck_subwrap
                .addClass('ck-transition')
                .on('transitionend', removeTransitionClass);
            transition_class_added = true;
        }
        // Create the jQuery-fied control knob object (http://api.jquery.com/jQuery/#working-with-plain-objects)
        $control_knob_object = $({
            tabIndex: function tabIndex(index) {
                if (arguments.length > 0) {
                    $ck_wrap.attr('tabindex', Number.toInteger(index));
                    return control_knob_object;
                }
                return tab_index;
            },
            step: function (val) {
                if (arguments.length > 0) {
                    val = Number(val) || 1;
                    if (val < 0) {
                        val = 1;
                    }
                    if (Number.isFinite(val)) {
                        properties.step = val;
                    }
                    return control_knob_object;
                }
                return properties.step;
            },
            min: function (val, animate) {
                var max_sub, min_sub, value_sub, rate;
                if (arguments.length > 0) {
                    val = Number(val) || 0;
                    if (Number.isFinite(val)) {
                        properties.min = val;
                        min_sub = val;
                        max_sub = properties.max;
                        value_sub = properties.value;
                        rate = (value_sub - min_sub) / (max_sub - min_sub);
                        angle = rate * maxangle;
                        refreshControls(animate);
                    }
                    return control_knob_object;
                }
                return properties.min;
            },
            max: function (val, animate) {
                var max_sub, min_sub, value_sub, rate;
                if (arguments.length > 0) {
                    val = Number(val) || 0;
                    if (Number.isFinite(val)) {
                        properties.max = val;
                        max_sub = val;
                        min_sub = properties.min;
                        value_sub = properties.value;
                        rate = (value_sub - min_sub) / (max_sub - min_sub);
                        angle = rate * maxangle;
                        refreshControls(animate);
                    }
                    return control_knob_object;
                }
                return properties.max;
            },
            val: function val(user_val, animate) {
                var max_sub, min_sub, rate;
                if (arguments.length > 0) {
                    max_sub = properties.max;
                    min_sub = properties.min;
                    user_val = valueByStep(Number(user_val) || 0, properties.step);
                    if (user_val > max_sub) {
                        user_val = max_sub;
                    }
                    if (user_val < min_sub) {
                        user_val = min_sub;
                    }
                    properties.value = user_val;
                    prev_input_value = user_val;
                    prev_change_value = user_val;
                    rate = (user_val - min_sub) / (max_sub - min_sub);
                    angle = rate * maxangle;
                    refreshControls(animate);
                    return control_knob_object;
                }
                return properties.value;
            },
            displayLabels: displayLabels,
            displayBands: displayBands,
            displayValue: displayValue,
            attachTo: function attachTo(arg) {
                $ck_wrap.appendTo(arg);
                removeTransitionClass();
                refreshControls();
                return control_knob_object;
            },
            switchTo: function switchTo(arg) {
                var $target;
                if (arg instanceof $) {
                    $target = arg;
                } else {
                    $target = $(arg);
                }
                $ck_wrap.data('ck:swapped-element', $target.replaceWith($ck_wrap));
                removeTransitionClass();
                refreshControls();
                return control_knob_object;
            },
            getElement: function getElement() {
                return $ck_wrap;
            }
        });
        control_knob_object = $control_knob_object[0];
        Object.defineProperty(control_knob_object, 'value', {
            get: function () {
                return properties.value;
            },
            set: function (val) {
                var max_sub = properties.max, min_sub = properties.min, rate;
                val = valueByStep(Number(val) || 0, properties.step);
                if (val > max_sub) {
                    val = max_sub;
                }
                if (val < min_sub) {
                    val = min_sub;
                }
                properties.value = val;
                prev_input_value = val;
                prev_change_value = val;
                rate = (val - min_sub) / (max_sub - min_sub);
                angle = rate * maxangle;
                refreshControls();
            }
        });
        // Event-handling setup
        (function () {
            var knob_center = {
                    getX: function getX() {
                        return $ck_anchor.getX() + ($ck_anchor.outerWidth() / 2);
                    },
                    getY: function getY() {
                        return $ck_anchor.getY() + ($ck_anchor.outerHeight() / 2);
                    }
                },
                angle_additive = 0,
                radian_diff = 0,
                prev_radians,
                max_radians = (360 * Math.PI) / 180,
                css_options = {
                    '-moz-transform': 'rotate(0deg)',
                    '-webkit-transform': 'rotate(0deg)',
                    '-o-transform': 'rotate(0deg)',
                    '-ms-transform': 'rotate(0deg)',
                    'transform': 'rotate(0deg)'
                },
                ckWrapMetaControlHandler,
                ck_do_not_trigger_map = {},
                ck_wrap_do_not_trigger_map = {},
                prevX,
                prevY;
            Object.defineProperties(knob_center, {
                'x': {
                    get: function () {
                        return $ck_anchor.getX() + ($ck_anchor.outerWidth() / 2);
                    }
                },
                'y': {
                    get: function () {
                        return $ck_anchor.getY() + ($ck_anchor.outerHeight() / 2);
                    }
                }
            });
            // Updates the knob UI
            refreshControls = function refresh(animate) {
                var active_bands, k, len, key, rotate;
                rotate = 'rotate(' + angle + 'deg)';
                // rotate knob
                for (key in css_options) {
                    if (hasOwnProperty.call(css_options, key)) {
                        css_options[key] = rotate;
                    }
                }
                if (!!animate && (disabled === false) && (transition_class_added === false)) {
                    addTransitionClass();
                }
                $ck_handle.css(css_options);
                active_bands = (Math.floor(angle / degree_increment) + 1);
                //console.log(degree_increment);
                $ck_value.text(properties.value.toFixed(2));
                // highlight bands
                $ck_band.removeClass('active');
                for (k = 0, len = active_bands; k < len; k += 1) {
                    $ck_band[k].className += ' active';
                    //$ck_band[k].classList.add('active');
                }
            };
            // getDistance may be used to limit the active zone in the control knob handle
            /*
            function getDistance(x1, y1, x2, y2) {
                return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            }
            */
            function getRadians(mouse_x, mouse_y) {
                var rad = Math.atan2(knob_center.y - mouse_y, mouse_x - knob_center.x);
                if (rad < 0) {
                    rad = max_radians + rad;
                }
                return rad;
            }
            function inputEvent(rate) {
                var max_sub = properties.max, min_sub = properties.min, calculated_value;
                if (max_sub >= min_sub) {
                    prev_input_value = properties.value;
                    calculated_value = min_sub + (rate * (max_sub - min_sub));
                    calculated_value = valueByStep(calculated_value, properties.step);
                    if (disabled === false) {
                        if (calculated_value !== prev_input_value) {
                            properties.value = calculated_value;
                            trigger_param_list.push(calculated_value);
                            $control_knob_object.triggerHandler('input', trigger_param_list);
                            trigger_param_list.length = 0;
                        }
                    }
                }
            }
            function calculateAngleAndRate(mode, direction) {
                var rate, min_sub;
                switch (mode) {
                case 'indirect':
                    switch (direction) {
                    case 'up':
                        min_sub = properties.min;
                        rate = (((properties.value + properties.step) - min_sub) / (properties.max - min_sub));
                        //console.log(rate);
                        if (rate > 1) {
                            rate = 1;
                        }
                        angle = rate * maxangle;
                        inputEvent(rate);
                        break;
                    case 'down':
                        min_sub = properties.min;
                        rate = (((properties.value - properties.step) - min_sub) / (properties.max - min_sub));
                        //console.log(rate);
                        if (rate < 0) {
                            rate = 0;
                        }
                        angle = rate * maxangle;
                        inputEvent(rate);
                        break;
                    default:
                        
                    }
                    break;
                case 'direct':
                    angle = angle + angle_additive;
                    if (angle > maxangle) {
                        angle = maxangle;
                    }
                    if (angle < minangle) {
                        angle = minangle;
                    }
                    // update % value in text
                    rate = (angle / maxangle);
                    inputEvent(rate);
                    break;
                }
            }
            function docWinEventHandler() {
                active = false;
                if (disabled === false) {
                    changeEvent();
                }
                angle_additive = 0;
                radian_diff = 0;
                $ck_wrap.removeClass('active');
                $document.off('mousemove touchmove mouseup touchend', documentEventHandler);
                $window.off('blur', docWinEventHandler);
            }
            function changeEvent() {
                var value_sub = properties.value;
                trigger_param_list.push(value_sub);
                // 'seek' event is like a forced-change event
                $control_knob_object.triggerHandler('seek', trigger_param_list);
                if (prev_change_value !== value_sub) {
                    $control_knob_object.triggerHandler('change', trigger_param_list);
                    prev_change_value = value_sub;
                }
                trigger_param_list.length = 0;
            }
            /*
                The nowX-nowY-prevX-prevY tandem is a hack for browsers with stupid mousemove event implementation (Chrome, I'm looking at you!).
                What is this stupidity you're talking about?
                    Some browsers fire a single mousemove event of an element everytime a mousedown event of that same element fires.
                LINK(S):
                    http://stackoverflow.com/questions/24670598/why-does-chrome-raise-a-mousemove-on-mousedown
            */
            function documentEventHandler(event) {
                var nowX, nowY, now_radians;
                event.preventDefault();
                switch (event.type) {
                case 'touchmove':
                    event.pageX = event.originalEvent.touches[0].pageX;
                    event.pageY = event.originalEvent.touches[0].pageY;
                    /* falls through */
                case 'mousemove':
                    nowX = event.pageX;
                    nowY = event.pageY;
                    if (prevX === nowX && prevY === nowY) {
                        //console.log('faux mousemove');
                        return;
                    }
                    now_radians = getRadians(nowX, nowY);
                    radian_diff = prev_radians - now_radians;
                    //console.log(radian_diff);
                    if (radian_diff < 0) {
                        if (Math.abs(radian_diff) > max_radians / 2) {
                            radian_diff += max_radians;
                            //console.log('POSITIVE COMPENSATION');
                        }
                    } else if (radian_diff > 0) {
                        if (radian_diff > max_radians / 2) {
                            radian_diff -= max_radians;
                            //console.log('NEGATIVE COMPENSATION');
                        }
                    }
                    angle_additive = Math.toDegrees(radian_diff);
                    calculateAngleAndRate('direct');
                    refreshControls();
                    prev_radians = now_radians;
                    prevX = nowX;
                    prevY = nowY;
                    break;
                case 'touchend':
                    /* falls through */
                case 'mouseup':
                    docWinEventHandler();
                    break;
                }
            }
            function containsTarget(target, node) {
                var k, len, children;
                if (target === node) {
                    return true;
                }
                children = node.children;
                len = children.length;
                if (len > 0) {
                    for (k = 0; k < len; k += 1) {
                        if (containsTarget(target, children[k])) {
                            return true;
                        }
                    }
                }
                return false;
            }
            ckWrapMetaControlHandler = (function () {
                var is_default_prevented = false, ck_anchor = $ck_anchor[0];
                function helper(event) {
                    is_default_prevented = event.isDefaultPrevented();
                }
                return function ckWrapMetaControlHandler(event) {
                    var event_type = event.type;
                    // trigger's extra parameters won't work with focus and blur events. See https://github.com/jquery/jquery/issues/1741
                    if (!ck_do_not_trigger_map[event_type]) {
                        ck_wrap_do_not_trigger_map[event_type] = true;
                        $control_knob_object.one(event_type, helper);
                        $control_knob_object.triggerHandler(event_type);
                        ck_wrap_do_not_trigger_map[event_type] = false;
                    }
                    if (is_default_prevented) {
                        // prevent event default behaviour and propagation
                        event.stopImmediatePropagation();
                        return false;
                    }
                    switch (event_type) {
                    case 'touchstart':
                        event.pageX = event.originalEvent.touches[0].pageX;
                        event.pageY = event.originalEvent.touches[0].pageY;
                        /* falls through */
                    case 'mousedown':
                        event.preventDefault();
                        //console.log(event.target);
                        if (containsTarget(event.target, ck_anchor)) {
                            if (event.originalEvent === undef || event.which === 3) {
                                return undef;
                            }
                            active = true;
                            prevX = event.pageX;
                            prevY = event.pageY;
                            prev_radians = getRadians(prevX, prevY);
                            $ck_wrap.trigger('focus').addClass('active');
                            $document.on('mousemove touchmove mouseup touchend', documentEventHandler);
                            $window.on('blur', docWinEventHandler);
                        }
                        break;
                    case 'DOMMouseScroll':
                        if (containsTarget(event.target, ck_anchor)) {
                            if (event.originalEvent) {
                                if (event.originalEvent.detail > 0) {
                                    calculateAngleAndRate('indirect', 'down');
                                } else {
                                    calculateAngleAndRate('indirect', 'up');
                                }
                                refreshControls();
                                changeEvent();
                            }
                        }
                        break;
                    case 'mousewheel':
                        if (containsTarget(event.target, ck_anchor)) {
                            if (event.originalEvent) {
                                if (event.originalEvent.wheelDelta < 0) {
                                    calculateAngleAndRate('indirect', 'down');
                                } else {
                                    calculateAngleAndRate('indirect', 'up');
                                }
                                refreshControls();
                                changeEvent();
                            }
                        }
                        break;
                    case 'keydown':
                        //console.log(event.which);
                        // Do not call event.preventDefault, else the tab function won't work!
                        switch (event.which) {
                        case 8: // Backspace key
                        /* falls through */
                        case 36: // Home key
                            angle = minangle;
                            inputEvent(0);
                            refreshControls();
                            changeEvent();
                            break;
                        case 33: // Page up key
                        /* falls through */
                        case 38: // Up arrow key
                        /* falls through */
                        case 39: // Right arrow key
                            calculateAngleAndRate('indirect', 'up');
                            refreshControls();
                            changeEvent();
                            break;
                        case 34: // Page down key
                        /* falls through */
                        case 37: // Left arrow key
                        /* falls through */
                        case 40: // Down arrow key
                            calculateAngleAndRate('indirect', 'down');
                            refreshControls();
                            changeEvent();
                            break;
                        case 35: // End key
                            angle = maxangle;
                            inputEvent(1);
                            refreshControls();
                            changeEvent();
                            break;
                        }
                        break;
                    }
                };
            }());
            function enableDisableAid(event) {
                switch (event.type) {
                case 'touchstart':
                    /* falls through */
                case 'mousedown':
                    event.preventDefault();
                    break;
                }
            }
            // ckEventHandler is mainly used for manually-triggered events (via the trigger / fire method)
            function ckEventHandler(event) {
                var event_type = event.type;
                // Prevent invocation when triggered manually from $ck_wrap
                if (!ck_wrap_do_not_trigger_map[event_type]) {
                    //console.log('triggered ' + event_type);
                    ck_do_not_trigger_map[event_type] = true;
                    $ck_wrap.trigger(event_type);
                    ck_do_not_trigger_map[event_type] = false;
                }
            }
            control_knob_object.enable = function enable() {
                if (disabled === true) {
                    disabled = false;
                    $control_knob_object.on('focus blur touchstart mousewheel DOMMouseScroll mousedown mouseup click keydown keyup keypress', ckEventHandler);
                    $ck_wrap
                        .removeClass('disabled')
                        .on('focus blur touchstart mousewheel DOMMouseScroll mousedown mouseup click keydown keyup keypress', ckWrapMetaControlHandler)
                        .attr('tabindex', tab_index)
                        .off('mousedown', enableDisableAid);
                }
                return control_knob_object;
            };
            control_knob_object.disable = function disable() {
                if (disabled === false) {
                    disabled = true;
                    $control_knob_object.off('focus blur touchstart mousewheel DOMMouseScroll mousedown mouseup click keydown keyup keypress', ckEventHandler);
                    if (active) {
                        $document.trigger('mouseup'); // Manually trigger the 'mouseup' event handler
                    }
                    $ck_wrap
                        .addClass('disabled')
                        .off('focus blur touchstart mousewheel DOMMouseScroll mousedown mouseup click keydown keyup keypress', ckWrapMetaControlHandler)
                        .removeAttr('tabindex')
                        .on('mousedown', enableDisableAid);
                    removeTransitionClass();
                }
                return control_knob_object;
            };
            control_knob_object.refresh = refreshControls;
            control_knob_object.on = function on() {
                applier($_proto.on, $control_knob_object, arguments);
                return control_knob_object;
            };
            control_knob_object.one = function one() {
                applier($_proto.one, $control_knob_object, arguments);
                return control_knob_object;
            };
            control_knob_object.off = function off() {
                applier($_proto.off, $control_knob_object, arguments);
                return control_knob_object;
            };
            function trigger() {
                applier($_proto.trigger, $control_knob_object, arguments);
                return control_knob_object;
            }
            control_knob_object.trigger = trigger;
            control_knob_object.fire = trigger;
            function resetStructure() {
                var parentNode = $ck_wrap[0].parentNode, i, length, item;
                if (parentNode !== null) {
                    //$ck_wrap.detach();
                    $ck_wrap.replaceWith($hot_swap_dummy);
                }
                for (i = 0, length = parts_list.length; i < length; i += 1) {
                    item = parts_list[i];
                    item.removeAttr('class').removeAttr('style');
                    if (item === $ck_wrap) {
                        item.removeAttr('tabindex');
                    }
                }
                initializeParts();
                if (parentNode !== null) {
                    //$ps_wrap.appendTo(parentNode);
                    $hot_swap_dummy.replaceWith($ck_wrap);
                }
            }
            control_knob_object.reset = function reset(hard) {
                var i, length;
                control_knob_object.disable();
                $control_knob_object.off();
                if (!!hard) {
                    resetStructure();
                    for (i = 0, length = parts_list.length; i < length; i += 1) {
                        parts_list[i].off();
                    }
                }
                properties.reset();
                prev_input_value = properties.value;
                prev_change_value = prev_input_value;
                refreshControls();
                control_knob_object.enable();
                return control_knob_object;
            };
        }());
        $ck_wrap.data('ck:host-object', control_knob_object).data('control-knob-object', control_knob_object);
        control_knob_object.enable();
        refreshControls(false);
        return control_knob_object;
    };
}(window, (typeof jQuery === "function" && jQuery) || (typeof module === "object" && typeof module.exports === "function" && module.exports)));