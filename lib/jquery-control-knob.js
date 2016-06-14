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
/*global Boolean, Math, Number, document, window, jQuery, module*/
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
    $.createControlKnob = function (options) {
        var is_options_valid = $.type(options) === 'object',
            $ck_wrap = $(document.createElement('span')),
            $ck_anchor = $(document.createElement('span')),
            $ck_handle = $(document.createElement('span')),
            $ck_decal = $(document.createElement('span')),
            $ck_value = $(document.createElement('span')),
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
            initializeParts,
            refreshControls,
            trigger_param_list = [],
            $_proto = $.fn,
            default_tab_index = (is_options_valid && Number.toInteger(options.tabIndex)) || 0,
            tab_index = default_tab_index,
            active = false,
            disabled = true,
            default_min_val = (is_options_valid && Number(options.min)) || 0,
            default_max_val = 100,
            default_val,
            min_value = default_min_val,
            max_value = default_max_val,
            max_sub,
            value,
            user_set_value = false,
            prev_input_value,
            prev_change_value,
            control_knob_object,
            $control_knob_object;
        if (is_options_valid && hasOwnProperty.call(options, 'max')) {
            default_max_val = Number(options.max) || 0;
            max_value = default_max_val;
        }
        function getComputedMax() {
            var max = max_value;
            if ((max < min_value) && (min_value < 100)) {
                max = 100;
            }
            return max;
        }
        if (is_options_valid && hasOwnProperty.call(options, 'value')) {
            max_sub = getComputedMax();
            default_val = Number(options.value) || 0;
            if (default_val > max_sub) {
                default_val = max_sub;
            }
            if (default_val < min_value) {
                default_val = min_value;
            }
        } else {
            default_val = (min_value >= max_value) ? min_value : (min_value + ((max_value - min_value) / 2));
        }
        value = default_val;
        prev_input_value = value;
        prev_change_value = value;
        for (t = 0, tlen = number_of_bands, degrees = 0; t <= tlen; t += 1) {
            if (t > 0) {
                degrees += degree_increment;
            }
            $band = $(document.createElement('span')).css('transform', 'rotate(' + (degrees - 45) + 'deg)');
            $band.data('$self', $band);
            band_list.push($band[0]);
        }
        $ck_band = $(band_list);
        parts_list = [$ck_wrap, $ck_anchor, $ck_handle, $ck_decal, $ck_value, $ck_min_label, $ck_max_label, $ck_bands_wrap, $ck_band];
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
                $ck_min_label.toggle(show);
                $ck_max_label.toggle(show);
                return control_knob_object;
            }
            return $ck_min_label.is(':visible') && $ck_max_label.is(':visible');
        }
        function displayValue(show) {
            if (arguments.length > 0) {
                $ck_value.toggle(!!show);
                return control_knob_object;
            }
            return $ck_value.is(':visible');
        }
        initializeParts = (function initializeParts() {
            $ck_wrap.addClass('control-knob').addClass('ck-wrap');
            $ck_anchor.addClass('ck-anchor');
            $ck_handle.addClass('ck-handle');
            $ck_decal.addClass('ck-decal');
            $ck_value.addClass('ck-value').text(default_val.toFixed(2));
            $ck_min_label.addClass('ck-min-label').text('MIN');
            $ck_max_label.addClass('ck-max-label').text('MAX');
            $ck_bands_wrap.addClass('ck-bands-wrap');
            $ck_band.addClass('ck-band');
            // Connect the parts
            $ck_wrap
                .append($ck_anchor)
                .append($ck_min_label)
                .append($ck_max_label)
                .append($ck_bands_wrap)
                .attr('tabindex', tab_index);
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
            }
            return initializeParts;
        }());
        // getComputedValue is used to get the cured value if the user didn't enter any specific value ->
        // -> either via direct ui input or the value method (both of which sets user_set_value to true) ->
        // -> this is part of the default chrome range input behaviour simulation
        function getComputedValue(computed_max) {
            var val = value;
            if (computed_max === undef) {
                computed_max = getComputedMax();
            }
            if (val > computed_max) {
                val = computed_max;
            }
            if (val < min_value) {
                val = min_value;
            }
            return val;
        }
        function val(val) {
            max_sub = getComputedMax();
            if (arguments.length > 0) {
                val = Number(val) || 0;
                if (val > max_sub) {
                    val = max_sub;
                }
                if (val < min_value) {
                    val = min_value;
                }
                value = val;
                prev_input_value = val;
                prev_change_value = val;
                user_set_value = true;
                refreshControls(true);
                return control_knob_object;
            }
            return (user_set_value) ? value : getComputedValue(max_sub);
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
            min: function min(val) {
                if (arguments.length > 0) {
                    min_value = Number(val) || 0;
                    if (user_set_value) {
                        max_sub = getComputedMax();
                        if (value > max_sub) {
                            value = max_sub;
                        }
                        if (value < min_value) {
                            value = min_value;
                        }
                    }
                    refreshControls(true);
                    return control_knob_object;
                }
                return min_value;
            },
            max: function max(val) {
                if (arguments.length > 0) {
                    max_value = Number(val) || 0;
                    if (user_set_value) {
                        max_sub = getComputedMax();
                        if (value > max_sub) {
                            value = max_sub;
                        }
                        if (value < min_value) {
                            value = min_value;
                        }
                    }
                    refreshControls(true);
                    return control_knob_object;
                }
                return max_value;
            },
            value: val,
            val: val,
            displayLabels: displayLabels,
            displayBands: displayBands,
            displayValue: displayValue,
            attachTo: function attachTo(arg) {
                $ck_wrap.appendTo(arg);
                refreshControls(true);
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
                refreshControls(true);
                return control_knob_object;
            },
            getElement: function getElement() {
                return $ck_wrap;
            }
        });
        control_knob_object = $control_knob_object[0];
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
                angle = 0,
                angle_additive = 0,
                radian_diff = 0,
                minangle = 0,
                maxangle = 270,
                prev_radians,
                max_radians = (360 * Math.PI) / 180,
                css_options = {
                    '-moz-transform': 'rotate(0deg)',
                    '-webkit-transform': 'rotate(0deg)',
                    '-o-transform': 'rotate(0deg)',
                    '-ms-transform': 'rotate(0deg)',
                    'transform': 'rotate(0deg)'
                },
                prevX,
                prevY;
            // Updates the slider UI
            refreshControls = function refresh(calculate_angle) {
                var active_bands, k, len, key, rotate, rate;
                if (calculate_angle) {
                    max_sub = getComputedMax();
                    if (max_sub <= min_value) {
                        rate = 0;
                    } else {
                        rate = ((value - min_value) / (max_sub - min_value));
                    }
                    angle = rate * maxangle;
                }
                rotate = 'rotate(' + angle + 'deg)';
                // rotate knob
                for (key in css_options) {
                    if (hasOwnProperty.call(css_options, key)) {
                        css_options[key] = rotate;
                    }
                }
                $ck_handle.css(css_options);
                active_bands = (Math.floor(angle / degree_increment) + 1);
                $ck_value.text(value.toFixed(2));
                // highlight bands
                $ck_band.removeClass('active');
                for (k = 0, len = active_bands; k < len; k += 1) {
                    $ck_band[k].className += ' active';
                    //$ck_band[k].classList.add('active');
                }
            };
            // getDistance may be used to limit the active zone in the control knob handle
            function getDistance(x1, y1, x2, y2) {
                return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            }
            function getRadians(mouse_x, mouse_y) {
                var rad = Math.atan2(knob_center.getY() - mouse_y, mouse_x - knob_center.getX());
                if (rad < 0) {
                    rad = max_radians + rad;
                }
                return rad;
            }
            function moveKnob(direction) {
                var rate, max_sub, calculated_value;
                switch (direction) {
                case 'up':
                    angle_additive = 2;
                    break;
                case 'down':
                    angle_additive = -2;
                    break;
                }
                angle = angle + angle_additive;
                if (angle > maxangle) {
                    angle = maxangle;
                }
                if (angle < minangle) {
                    angle = minangle;
                }
                // update % value in text
                rate = (angle / 270);
                //console.log(rate);
                ////////////////////////////////////////////////////////////////////////////
                max_sub = getComputedMax();
                if (max_sub >= min_value) {
                    prev_input_value = (user_set_value) ? value : getComputedValue(max_sub);
                    calculated_value = min_value + (rate * (max_sub - min_value));
                    if (disabled === false) {
                        if (calculated_value !== prev_input_value) {
                            user_set_value = true;
                            value = calculated_value;
                            trigger_param_list.push(value);
                            $control_knob_object.triggerHandler('input', trigger_param_list);
                            trigger_param_list.length = 0;
                        }
                    }
                }
                ////////////////////////////////////////////////////////////////////////////
                refreshControls();
            }
            function windowEventHandler(event) {
                switch (event.type) {
                case 'blur':
                    $document.trigger('mouseup');
                    break;
                }
            }
            /*
                The nowX-nowY-prevX-prevY tandem is a hack for browsers with stupid mousemove event implementation (Chrome, I'm looking at you!).
                What is this stupidity you're talking about?
                    Some browsers fire a single mousemove event of an element everytime a mousedown event of that same element fires.
                LINK(S):
                    http://stackoverflow.com/questions/24670598/why-does-chrome-raise-a-mousemove-on-mousedown
            */
            function documentEventHandler(event) {
                var nowX, nowY, now_radians, value_sub;
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
                    moveKnob();
                    prev_radians = now_radians;
                    prevX = nowX;
                    prevY = nowY;
                    break;
                case 'touchend':
                    /* falls through */
                case 'mouseup':
                    value_sub = (user_set_value) ? value : getComputedValue();
                    if (disabled === false) {
                        trigger_param_list.push(value_sub);
                        // 'seek' event is like a forced-change event
                        $control_knob_object.triggerHandler('seek', trigger_param_list);
                        if (prev_change_value !== value_sub) {
                            $control_knob_object.triggerHandler('change', trigger_param_list);
                            prev_change_value = value_sub;
                        }
                        trigger_param_list.length = 0;
                    }
                    ////////////////////////////////////////////////////
                    angle_additive = 0;
                    radian_diff = 0;
                    $ck_wrap.removeClass('active');
                    $document.off('mousemove mouseup touchmove touchend', documentEventHandler);
                    $window.off('blur', windowEventHandler);
                    active = false;
                    break;
                }
            }
            function ckWrapEventHandler(event) {
                switch (event.type) {
                case 'touchstart':
                    event.pageX = event.originalEvent.touches[0].pageX;
                    event.pageY = event.originalEvent.touches[0].pageY;
                    /* falls through */
                case 'mousedown':
                    event.preventDefault();
                    active = true;
                    prevX = event.pageX;
                    prevY = event.pageY;
                    prev_radians = getRadians(prevX, prevY);
                    $ck_wrap.addClass('active');
                    $document.on('mousemove mouseup touchmove touchend', documentEventHandler);
                    $window.on('blur', windowEventHandler);
                    break;
                case 'DOMMouseScroll':
                    event.preventDefault();
                    if (event.originalEvent.detail > 0) {
                        moveKnob('down');
                    } else {
                        moveKnob('up');
                    }
                    break;
                case 'mousewheel':
                    event.preventDefault();
                    if (event.originalEvent.wheelDelta < 0) {
                        moveKnob('down');
                    } else {
                        moveKnob('up');
                    }
                    break;
                case 'keydown':
                    //console.log(event.which);
                    switch (event.which) {
                    case 38:
                        moveKnob('up');
                        break;
                    case 40:
                        moveKnob('down');
                        break;
                    }
                    break;
                }
            }
            function enableDisableAid(event) {
                switch (event.type) {
                case 'touchstart':
                    /* falls through */
                case 'mousedown':
                    event.preventDefault();
                    break;
                }
            }
            control_knob_object.enable = function enable() {
                if (disabled === true) {
                    disabled = false;
                    $ck_wrap
                        .removeClass('disabled')
                        .attr('tabindex', tab_index)
                        .off('mousedown', enableDisableAid)
                        .on('mousedown touchstart mousewheel mousewheel keydown', ckWrapEventHandler);
                }
                return control_knob_object;
            };
            control_knob_object.disable = function disable() {
                if (disabled === false) {
                    disabled = true;
                    if (active) {
                        $document.trigger('mouseup'); // Manually trigger the 'mouseup' event handler
                    }
                    $ck_wrap
                        .addClass('disabled')
                        .removeAttr('tabindex')
                        .off('mousedown touchstart mousewheel mousewheel keydown', ckWrapEventHandler)
                        .on('mousedown', enableDisableAid);
                    //removeTransitionClass();
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
                if (Boolean(hard) === true) {
                    resetStructure();
                    for (i = 0, length = parts_list.length; i < length; i += 1) {
                        parts_list[i].off();
                    }
                }
                min_value = default_min_val;
                max_value = default_max_val;
                value = default_val;
                prev_input_value = value;
                prev_change_value = value;
                $ck_wrap.attr('tabindex', tab_index);
                refreshControls(true);
                control_knob_object.enable();
                return control_knob_object;
            };
        }());
        $ck_wrap.data('ck:host-object', control_knob_object).data('control-knob-object', control_knob_object);
        control_knob_object.enable();
        return control_knob_object;
    };
}(window, (typeof jQuery === "function" && jQuery) || (typeof module === "object" && typeof module.exports === "function" && module.exports)));