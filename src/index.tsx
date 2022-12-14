var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import * as React from 'react';
import convert from 'react-from-dom';
import { STATUS, canUseDOM, isSupportedEnvironment, randomString, removeProperties, } from './helpers';
export var cacheStore = Object.create(null);
var InlineSVG = /** @class */ (function (_super) {
    __extends(InlineSVG, _super);
    function InlineSVG(props) {
        var _this = _super.call(this, props) || this;
        _this.isActive = false;
        _this.handleCacheQueue = function (content) {
            /* istanbul ignore else */
            if (typeof content === 'string') {
                _this.handleLoad(content);
                return;
            }
            _this.handleError(content);
        };
        _this.handleLoad = function (content) {
            /* istanbul ignore else */
            if (_this.isActive) {
                _this.setState({
                    content: content,
                    status: STATUS.LOADED,
                }, _this.getElement);
            }
        };
        _this.handleError = function (error) {
            var onError = _this.props.onError;
            var status = error.message === 'Browser does not support SVG' ? STATUS.UNSUPPORTED : STATUS.FAILED;
            /* istanbul ignore else */
            if (_this.isActive) {
                _this.setState({ status: status }, function () {
                    /* istanbul ignore else */
                    if (typeof onError === 'function') {
                        onError(error);
                    }
                });
            }
        };
        _this.request = function () {
            var _a = _this.props, cacheRequests = _a.cacheRequests, fetchOptions = _a.fetchOptions, src = _a.src;
            try {
                if (cacheRequests) {
                    cacheStore[src] = { content: '', status: STATUS.LOADING, queue: [] };
                }
                return fetch(src, fetchOptions)
                    .then(function (response) {
                    var contentType = response.headers.get('content-type');
                    var _a = __read((contentType || '').split(/ ?; ?/), 1), fileType = _a[0];
                    if (response.status > 299) {
                        throw new Error('Not found');
                    }
                    if (!['image/svg+xml', 'text/plain'].some(function (d) { return fileType.indexOf(d) >= 0; })) {
                        throw new Error("Content type isn't valid: " + fileType);
                    }
                    return response.text();
                })
                    .then(function (content) {
                    var currentSrc = _this.props.src;
                    // the current src don't match the previous one, skipping...
                    if (src !== currentSrc) {
                        return;
                    }
                    _this.handleLoad(content);
                    /* istanbul ignore else */
                    if (cacheRequests) {
                        var cache = cacheStore[src];
                        /* istanbul ignore else */
                        if (cache) {
                            cache.content = content;
                            cache.status = STATUS.LOADED;
                            cache.queue = cache.queue.filter(function (cb) {
                                cb(content);
                                return false;
                            });
                        }
                    }
                })
                    .catch(function (error) {
                    _this.handleError(error);
                    /* istanbul ignore else */
                    if (cacheRequests) {
                        var cache = cacheStore[src];
                        /* istanbul ignore else */
                        if (cache) {
                            cache.queue.forEach(function (cb) {
                                cb(error);
                            });
                            delete cacheStore[src];
                        }
                    }
                });
            }
            catch (error) {
                return _this.handleError(new Error(error.message));
            }
        };
        _this.state = {
            content: '',
            element: null,
            hasCache: !!props.cacheRequests && !!cacheStore[props.src],
            status: STATUS.PENDING,
        };
        _this.hash = props.uniqueHash || randomString(8);
        return _this;
    }
    InlineSVG.prototype.componentDidMount = function () {
        this.isActive = true;
        if (!canUseDOM()) {
            return;
        }
        var status = this.state.status;
        var src = this.props.src;
        try {
            /* istanbul ignore else */
            if (status === STATUS.PENDING) {
                /* istanbul ignore else */
                if (!isSupportedEnvironment()) {
                    throw new Error('Browser does not support SVG');
                }
                /* istanbul ignore else */
                if (!src) {
                    throw new Error('Missing src');
                }
                this.load();
            }
        }
        catch (error) {
            this.handleError(error);
        }
    };
    InlineSVG.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (!canUseDOM()) {
            return;
        }
        var _a = this.state, hasCache = _a.hasCache, status = _a.status;
        var _b = this.props, onLoad = _b.onLoad, src = _b.src;
        if (prevState.status !== STATUS.READY && status === STATUS.READY) {
            /* istanbul ignore else */
            if (onLoad) {
                onLoad(src, hasCache);
            }
        }
        if (prevProps.src !== src) {
            if (!src) {
                this.handleError(new Error('Missing src'));
                return;
            }
            this.load();
        }
    };
    InlineSVG.prototype.componentWillUnmount = function () {
        this.isActive = false;
    };
    InlineSVG.prototype.processSVG = function () {
        var content = this.state.content;
        var preProcessor = this.props.preProcessor;
        if (preProcessor) {
            return preProcessor(content);
        }
        return content;
    };
    InlineSVG.prototype.updateSVGAttributes = function (node) {
        var _this = this;
        var _a = this.props, _b = _a.baseURL, baseURL = _b === void 0 ? '' : _b, uniquifyIDs = _a.uniquifyIDs;
        var replaceableAttributes = ['id', 'href', 'xlink:href', 'xlink:role', 'xlink:arcrole'];
        var linkAttributes = ['href', 'xlink:href'];
        var isDataValue = function (name, value) {
            return linkAttributes.indexOf(name) >= 0 && (value ? value.indexOf('#') < 0 : false);
        };
        if (!uniquifyIDs) {
            return node;
        }
        __spreadArray([], __read(node.children)).map(function (d) {
            if (d.attributes && d.attributes.length) {
                var attributes_1 = Object.values(d.attributes).map(function (a) {
                    var attr = a;
                    var match = a.value.match(/url\((.*?)\)/);
                    if (match && match[1]) {
                        attr.value = a.value.replace(match[0], "url(" + baseURL + match[1] + "__" + _this.hash + ")");
                    }
                    return attr;
                });
                replaceableAttributes.forEach(function (r) {
                    var attribute = attributes_1.find(function (a) { return a.name === r; });
                    if (attribute && !isDataValue(r, attribute.value)) {
                        attribute.value = attribute.value + "__" + _this.hash;
                    }
                });
            }
            if (d.children.length) {
                return _this.updateSVGAttributes(d);
            }
            return d;
        });
        return node;
    };
    InlineSVG.prototype.getNode = function () {
        var _a = this.props, description = _a.description, title = _a.title;
        try {
            var svgText = this.processSVG();
            var node = convert(svgText, { nodeOnly: true });
            if (!node || !(node instanceof SVGSVGElement)) {
                throw new Error('Could not convert the src to a DOM Node');
            }
            var svg = this.updateSVGAttributes(node);
            if (description) {
                var originalDesc = svg.querySelector('desc');
                if (originalDesc && originalDesc.parentNode) {
                    originalDesc.parentNode.removeChild(originalDesc);
                }
                var descElement = document.createElement('desc');
                descElement.innerHTML = description;
                svg.prepend(descElement);
            }
            if (title) {
                var originalTitle = svg.querySelector('title');
                if (originalTitle && originalTitle.parentNode) {
                    originalTitle.parentNode.removeChild(originalTitle);
                }
                var titleElement = document.createElement('title');
                titleElement.innerHTML = title;
                svg.prepend(titleElement);
            }
            return svg;
        }
        catch (error) {
            return this.handleError(error);
        }
    };
    InlineSVG.prototype.getElement = function () {
        try {
            var node = this.getNode();
            var element = convert(node);
            if (!element || !React.isValidElement(element)) {
                throw new Error('Could not convert the src to a React element');
            }
            this.setState({
                element: element,
                status: STATUS.READY,
            });
        }
        catch (error) {
            this.handleError(new Error(error.message));
        }
    };
    InlineSVG.prototype.load = function () {
        var _this = this;
        /* istanbul ignore else */
        if (this.isActive) {
            this.setState({
                content: '',
                element: null,
                status: STATUS.LOADING,
            }, function () {
                var _a = _this.props, cacheRequests = _a.cacheRequests, src = _a.src;
                var cache = cacheRequests && cacheStore[src];
                if (cache) {
                    /* istanbul ignore else */
                    if (cache.status === STATUS.LOADING) {
                        cache.queue.push(_this.handleCacheQueue);
                    }
                    else if (cache.status === STATUS.LOADED) {
                        _this.handleLoad(cache.content);
                    }
                    return;
                }
                var dataURI = src.match(/data:image\/svg[^,]*?(;base64)?,(.*)/);
                var inlineSrc;
                if (dataURI) {
                    inlineSrc = dataURI[1] ? atob(dataURI[2]) : decodeURIComponent(dataURI[2]);
                }
                else if (src.indexOf('<svg') >= 0) {
                    inlineSrc = src;
                }
                if (inlineSrc) {
                    _this.handleLoad(inlineSrc);
                    return;
                }
                _this.request();
            });
        }
    };
    InlineSVG.prototype.render = function () {
        var _a = this.state, element = _a.element, status = _a.status;
        var _b = this.props, _c = _b.children, children = _c === void 0 ? null : _c, innerRef = _b.innerRef, _d = _b.loader, loader = _d === void 0 ? null : _d;
        var elementProps = removeProperties(this.props, 'baseURL', 'cacheRequests', 'children', 'description', 'fetchOptions', 'innerRef', 'loader', 'onError', 'onLoad', 'preProcessor', 'src', 'title', 'uniqueHash', 'uniquifyIDs');
        if (!canUseDOM()) {
            return loader;
        }
        if (element) {
            return React.cloneElement(element, __assign({ ref: innerRef }, elementProps));
        }
        if ([STATUS.UNSUPPORTED, STATUS.FAILED].indexOf(status) > -1) {
            return children;
        }
        return loader;
    };
    InlineSVG.defaultProps = {
        cacheRequests: true,
        uniquifyIDs: false,
    };
    return InlineSVG;
}(React.PureComponent));
export default InlineSVG;
export * from './types';
//# sourceMappingURL=index.js.map