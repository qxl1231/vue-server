var compiler = require('./../compiler');
var excludeInstanceOptions = {
    'data': true,
    'methods': true,
    'computed': true,
    'props': true,
    'el': true,
    'elementDirective': true,
    'parent': true,
    'template': true,
    'replace': true,
    'created': true,
    'createdBe': true,
    'beforeCompile': true,
    'compiled': true,
    'compiledBe': true,
    'activate': true,
    'activateBe': true,
    'ready': true,
    'readyBe': true,
    'attached': true,
    'detached': true,
    'beforeDestroy': true,
    'destroyed': true,
    'directives': true,
    'filters': true,
    'components': true,
    'partials': true,
    'transitions': true,
    'inherit': true,
    'events': true,
    'watch': true,
    'mixins': true,
    'name': true
};

var objectUtils = {
    // Get ALL class properties
    getNames: function (object, isModern) {
        if (isModern) {
            return this.getNamesModern(object);
        } else {
            return this.getNamesLegacy(object);
        }
    },

    getNamesLegacy: function (object) {
        var names = Object.keys(object);
        var objectProto = Object.getPrototypeOf(object);

        if (objectProto) {
            names = names.concat(
                this.getNamesLegacy(objectProto)
            );
        }

        return names;
    },

    getNamesModern: function (object) {
        var names = Object.keys(object).concat(gogo(object));

        function gogo(obj) {
            var objectProto = Object.getPrototypeOf(obj);
            var protoNames;

            if (objectProto && objectProto.__proto__) {
                protoNames = Object.getOwnPropertyNames(objectProto).concat(gogo(objectProto));
            }

            if (protoNames) {
                return protoNames;
            } else {
                return [];
            }
        }

        var newNames = [];
        for (var i = 0; i < names.length; i++) {
            if (names[i] === 'constructor') {
                continue;
            }

            newNames.push(names[i]);
        }

        return newNames;
    }
}

exports.compileTemplate = function ($logger, template, logName) {
    var tplTypeof;

    if (template) {
        tplTypeof = typeof template;

        if (tplTypeof === 'string') {
            return compiler(template);
        } else if (tplTypeof !== 'function') {
            $logger.warn(logName + ' type is not valid (' + tplTypeof + ')');
            return null;
        }
    } else {
        $logger.debug(logName + ' is empty (' + tplTypeof + ')');
    }

    return template;
}

exports.composeComponent = function ($logger, component, globalMixin) {
    var Component = function () {};
    var options = Component.prototype;
    var toData = {};
    var instancePropsMap = objectUtils.getNames(component);
    Component.__isCtor = true;

    options.methods = component.methods || {};

    // Walk through object-class properties and setting all functions to methods
    for (var i = instancePropsMap.length - 1; i >= 0; i--) {
        (function () {
            var name = instancePropsMap[i],
                item = component[name];

            if (excludeInstanceOptions[name]) {
                options[name] = item;
            } else {
                if (typeof item === 'function') {
                    options.methods[name] = item;
                } else {
                    toData[name] = item;
                }
            }
        })();
    }

    var data = options.data;
    var dataObject;
    if (!data) {
        data = function () {
            return {};
        }
    } else if (typeof data === 'object') {
        dataObject = data;
    }
    options.data = function () {
        for (var name in toData) {
            this[name] = toData[name];
        }
        return dataObject || data.call(this);
    }

    // Global mixin via Vue.mixin = ...
    if (globalMixin) {
        options.mixins = options.mixins || [];
        options.mixins = globalMixin.concat(options.mixins);
    }

    options.template = exports.compileTemplate($logger, options.template, 'Component\'s template');

    if (options.partials) {
        for (var name in options.partials) {
            options.partials[name] = exports.compileTemplate(
                $logger,
                options.partials[name],
                'Partial "' + name + '"'
            );
        }
    }

    return Component;
}
