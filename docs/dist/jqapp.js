/**
 * Jqapp
 * 
 * @author  Nick Tsai <myintaer@gmail.com>
 * @version 1.0.0
 * @see     https://github.com/yidas/jqapp
 */

;(function (window, $) {

  'use strict';

  /**
   * Jqapp parent class
   * 
   * @param {object} options 
   * @param {element} el 
   * @param {object} $el jQuery element object
   */
  var Instance = function (options, el) {
    
    var that = this; 
    options = options || {};
    // Relate options for read-only
    this.options = Object.freeze(options);
    this.el = null;
    this.$el = null;
    this.template = false;
    this.components = options.components || {};
    this.hooks = {
      beforeCreate: options.beforeCreate || null,
      created: options.created || null,
      beforeMount: options.beforeMount || null,
      mounted: options.mounted || null,
      beforeDestroy: options.beforeDestroy || null,
      destroyed: options.destroyed || null,
    };

    // Hook: beforeCreate
    if (typeof this.hooks.beforeCreate === 'function') {
      this.hooks.beforeCreate.bind(this)();
    }

    /**
     * Inject properties
     */
    // Data
    if (options.data) {
      // Support $.each
      for (var key in options.data) {
        // skip loop if the property is from prototype
        if (!options.data.hasOwnProperty(key)) continue;

        if (key in that)
          Helper.warn('Data "'+key+'" has already been defined as a reserved word.');
        else
          that[key] = options.data[key];
      }
    }
    // Method
    if (options.methods) {
      for (var key in options.methods) {
        if (options.data && key in options.data)
          Helper.warn('Method "'+key+'" has already been defined as a data property.');
        else if (key in that)
          Helper.warn('Method "'+key+'" has already been defined as a reserved word.');
        else
          that[key] = options.methods[key];
      }
    }

    // Hook: created
    if (typeof this.hooks.created === 'function') {
      this.hooks.created.bind(this)();
    }

    // Has `template` options
    if (options.template) {

      /**
       * Template engine
       */
      var html;
      var wrapper= document.createElement('div');
      // Template polymorphism
      if (options.template.indexOf("#")===0) {
        var el = document.querySelector(options.template);
        if (!el)
          Helper.error("Component `"+id+"`: template not found");
        html = el.innerHTML;
      } else {
        html = options.template;
      }

      // Template variable process (Supported IE)
      var regex = new RegExp('{{\\s?(.*?)\\s?}}', 'gi');
      html = html.replace(regex, function (match, g1, offset, string) {

        // Template value compilation
        var value = that;
        // Variable properties with dot pattern
        var keys = g1.split('.');
        for (var i = 0; i < keys.length; i++) {

          var key = keys[i];
          if (typeof value !== 'object' || !(key in value)) {
            // Empty if is invalid variable
            return '';
          }
          // Deep assignment
          value = value[key];
        }
        return String(value);
      });
      // Escaped character
      html = html.replace(new RegExp('\\\\{', 'g'), '{');
      
      // Prevent node escaped string
      wrapper.innerHTML= html.trim();
      
      if (wrapper.childElementCount !== 1)
        Helper.error("template should contain exactly one root element.");
        
      this.template = wrapper.firstChild;

      /**
       * jQuery element Handler
       */
      /*
      // Support <script> template inner HTML
      var $el = (options.template.indexOf("<")===0) ? $(options.template) : $($(options.template).html());
      var el = $el.get(0);
      */

      // Template replace el condition
    }

    // Mount element
    this.mount(options.el);
    
    return this;
  }

  /**
   * Mount element into instance
   * 
   * @param {Element|string|jQuery} elementOrSelector
   * @return {Object} Instance 
   */
  Instance.prototype.mount = function (elementOrSelector) {

    // Hook: beforeMount
    if (typeof this.hooks.beforeMount === 'function') {
      this.hooks.beforeMount.bind(this)();
    }

    // Skip scenario
    if (!elementOrSelector && !this.template) 
      return false;

    var el;

    // Element may be template like Component or defined el
    el = (!elementOrSelector && this.template) ? this.template : Helper.queryElement(elementOrSelector);

    /**
     * Element assignment
     */
    if (!el)
      Helper.error("element `"+elementOrSelector+"` not found", true);

    // el + template replacement
    if (elementOrSelector && this.template) {
      
      el = el.parentNode.replaceChild(this.template, el);
    }

    // Reset read-only properties
    delete this.el;
    delete this.$el;
    this.el = el;
    // Assign jQuery element cache
    this.$el = ($) ? $(this.el) : null;

    // Protect read-only properties
    Object.defineProperty(this, "el", { configurable: true, writable: false });
    Object.defineProperty(this, "$el", { configurable: true, writable: false });

    // Hook: mounted
    if (typeof this.hooks.mounted === 'function') {
      this.hooks.mounted.bind(this)();
    }

    return this;
  }

  /**
   * Remove all elements from instance
   * 
   * @return {Object} Instance 
   */
  Instance.prototype.remove = function () {

    // Hook: beforeDestroy
    if (typeof this.hooks.beforeDestroy === 'function') {
      this.hooks.beforeDestroy.bind(this)();
    }

    // Remove
    if (this.el.parentNode) {

      this.el.parentNode.removeChild(this.el);

      // Hook: destroyed
      if (typeof this.hooks.destroyed === 'function') {
        this.hooks.destroyed.bind(this)();
      }
    }

    return this;
  }

  /**
   * Find element from instance element
   * 
   * @param {string} selector
   * @return {Element} Instance element 
   */
  Instance.prototype.find = function (selector) {

    return this.el.querySelector(selector);
  }

  /**
   * Create a Component
   * 
   * @param {string} componentKey
   * @param {object} options Component options
   * @return {object} Jqapp Component
   */
  Instance.prototype.createComponent = function (componentKey, options) {

    if (!componentKey) 
      Helper.error("Component: First parameter `component key` required", true);
    
    if (!componentKey in this.components)
      Helper.error("Component: `"+componentKey+"` not found", true);

    if (options) {

      // Extend options
      options = ($) 
        ? $.extend(true, {}, this.components[componentKey], options)
        : Helper.extend(true, {}, this.components[componentKey], options)

    } else {

      // Default
      options = this.components[componentKey]
    }

    // options parameter require jQuery
    // if (options && !$)
    //   Helper.error("Component: jQuery required while creating `"+componentKey+"` with options parameter", true);

    // Component instance
    var component = new JqappComponent(options, componentKey, this);

    return component;
  }

  /**
   * Render a element from Component
   * 
   * @param {string} componentKey
   * @param {Object} options Component options
   * @return {Element} Component instance element
   */
  Instance.prototype.renderComponent = function (componentKey, options) {

    return this.createComponent(componentKey, options).el;
  }

  /**
   * Shortcut of appending `this.renderComponent()` into `this.find()` element
   * 
   * @param {string} type Shorthand type
   * @param {Function} handler A function to call once for handling element
   * @param {string} selector
   * @param {string} componentKey
   * @param {Object} options Component options
   * @param {Function} complete A function to call once the shortcut is complete
   * @return {Element} Instance element
   */
  Instance.prototype.shorthand = function (type, handler, selector, componentKey, options, complete) {

    var el = (selector) ? this.find(selector) : this.el;
    
    if (!el) {
      Helper.warn(type + '(): Query selector `' + selector + '` not found', true);
      return false;
    }
    
    // Render component and get the element
    var componentElement = this.renderComponent(componentKey, options);

    handler.bind(this)(el, componentElement);

    // Complete callback
    if (typeof complete === 'function') {
      complete.bind(this)(componentElement);
    }

    return el;
  }

  /**
   * Shortcut of appending `this.renderComponent()` into `this.find()` element
   * 
   * @param {string} selector
   * @param {string} componentKey
   * @param {Object} options Component options
   * @param {Function} complete A function to call once the shortcut is complete
   * @return {Element} Instance element
   */
  Instance.prototype.append = function (selector, componentKey, options, complete) {

    return this.shorthand('append', function (el, componentElement) {

      el.appendChild(componentElement);

    }, selector, componentKey, options, complete);
  }

  /**
   * Shortcut of replacing `this.find()` element with `this.renderComponent()`
   * 
   * @param {string} selector
   * @param {string} componentKey
   * @param {Object} options Component options
   * @param {Function} complete A function to call once the shortcut is complete
   * @return {Element} Instance element
   */
  Instance.prototype.replace = function (selector, componentKey, options, complete) {

    return this.shorthand('append', function (el, componentElement) {

      el.replaceChild(componentElement, el);

    }, selector, componentKey, options, complete);
  }

  /**
   * Shortcut of setting `this.renderComponent()` into `this.find()` element
   * 
   * @param {string} selector
   * @param {string} componentKey
   * @param {Object} options Component options
   * @param {Function} complete A function to call once the shortcut is complete
   * @return {Element} Instance element
   */
  Instance.prototype.html = function (selector, componentKey, options, complete) {

    return this.shorthand('append', function (el, componentElement) {

      // Reset HTML
      el.innerHTML = '';
      el.appendChild(componentElement);

    }, selector, componentKey, options, complete);
  }

  /**
   * Find jQuery element from instance element
   * 
   * @param {string | Element | jQuery} selectorOrElement
   * @return {jQuery} jQuery element
   */
  Instance.prototype.$find = function (selectorOrElement) {

    Helper.jQueryRequired();

    return this.$el.find(selectorOrElement);
  }

  /**
   * Render a jQuery element from Component
   * 
   * @param {string} componentKey
   * @param {Object} options Component options
   * @return {jQuery} jQuery component instance element
   */
  Instance.prototype.$renderComponent = function (componentKey, options) {

    Helper.jQueryRequired();

    return this.createComponent(componentKey, options).$el;
  }

  /**
   * Shortcut of appending `this.renderComponent()` into `this.find()` element
   * 
   * @param {string} type Shorthand type
   * @param {Function} handler A function to call once for handling element
   * @param {string | jQuery | Element} selectorOrElement
   * @param {string} componentKey
   * @param {Object} options Component options
   * @param {Function} complete A function to call once the shortcut is complete
   * @return {Element} Instance element
   */
  Instance.prototype.$shorthand = function (type, handler, selectorOrElement, componentKey, options, complete) {

    Helper.jQueryRequired();

    var $el = this.$find(selectorOrElement)
    
    // Render component and get the element
    var $componentElement = this.$renderComponent(componentKey, options);

    handler.bind(this)($el, $componentElement);

    // Complete callback
    if (typeof complete === 'function') {
      complete.bind(this)($componentElement);
    }

    return $el;
  }

  /**
   * Shortcut of appending `this.renderComponent()` into `this.$find()` element
   * 
   * @param {string | jQuery | Element} selectorOrElement
   * @param {string} componentKey
   * @param {Object} options Component options
   * @param {Function} complete A function to call once the shortcut is complete
   * @return {jQuery} jQuery instance element
   */
  Instance.prototype.$append = function (selectorOrElement, componentKey, options, complete) {

    return this.$shorthand('$append', function ($el, componentElement) {

      $el.append(componentElement);

    }, selectorOrElement, componentKey, options, complete);
  }

  /**
   * Shortcut of replacing `this.$find()` element with `this.renderComponent()`
   * 
   * @param {string | jQuery | Element} selectorOrElement
   * @param {string} componentKey
   * @param {Object} options Component options
   * @param {Function} complete A function to call once the shortcut is complete
   * @return {jQuery} jQuery instance element
   */
  Instance.prototype.$replace = function (selectorOrElement, componentKey, options, complete) {

    return this.$shorthand('$replace', function ($el, componentElement) {

      $el.replaceWith(componentElement);

    }, selectorOrElement, componentKey, options, complete);
  }

  /**
   * Shortcut of setting `this.renderComponent()` into `this.$find()` element
   * 
   * @param {string | jQuery | Element} selectorOrElement
   * @param {string} componentKey
   * @param {Object} options Component options
   * @param {Function} complete A function to call once the shortcut is complete
   * @return {jQuery} jQuery element
   */
  Instance.prototype.$html = function (selectorOrElement, componentKey, options, complete) {

    return this.$shorthand('$html', function ($el, componentElement) {

      $el.html(componentElement);

    }, selectorOrElement, componentKey, options, complete);
  }

  /**
   * Jqapp App
   * 
   * @param {object} options
   */
  var Jqapp = function (options) {

    // jQuery check
    if (Jqapp.config.jQuery && !$)
      Helper.error("jQuery is not loaded");

    Instance.call(this, options);

    return this;
  }
  // Inheritance 
  Jqapp.prototype = Object.create(Instance.prototype);

  /**
   * Global Config
   */
  Jqapp.config = {
    jQuery: true,
  };

  /**
   * Jqapp Component
   * 
   * @param {object} options 
   * @param {string} id 
   * @param {object} parent 
   */
  var JqappComponent = function (options, id, parent) {

    if (!options)
      Helper.error("Component `"+id+"`: invalid data");

    // Key check
    if (!options.template)
      Helper.error("Component `"+id+"`: template not defined");

    // Identity
    this.id = id;

    // Inject Jqapp object as parent
    this.parent = parent;
    
    Instance.call(this, options);

    return this;
  }
  // Inheritance 
  JqappComponent.prototype = Object.create(Instance.prototype);

  /**
   * Helper
   */
  var Helper = new function () {

    /**
     * Get element by multiple input
     * 
     * @param {element|string|jQuery|boolean} elementOrSelector
     * @return {element}
     */
    this.queryElement = function (elementOrSelector) {

      return (elementOrSelector instanceof HTMLElement) ? elementOrSelector : 
        ($ && (elementOrSelector instanceof $)) ? elementOrSelector.get(0) : document.querySelector(elementOrSelector);
    }

    this.jQueryRequired = function () {
      
      if (!$) {
        this.error("jQuery is required", 6);
      }

      return true;
    }

    /**
     * Error
     * 
     * @param {string} message
     * @param {boolean} withCaller
     */
    this.error = function (message, withCaller) {

      var message = "[Jqapp] " + message;
      message = (withCaller) ? message + '\nAt' + this.getErrorCaller(withCaller) : message;

      throw message;
    }

    /**
     * Warning
     * 
     * @param {string} message
     */
    this.warn = function (message) {

      console.error("[Jqapp Warn] " + message);
    }

    /**
     * Get error caller info
     * 
     * @param {integer} index
     * @return {string}
     */
    this.getErrorCaller = function (index) {

      function getErrorObject(){
        try { throw Error('') } catch(err) { return err; }
      }
      
      // Is numeric
      index = (!isNaN(parseFloat(index)) && isFinite(index)) ? index : 5;
      var err = getErrorObject();
      var callerLine = err.stack.split("\n")[index];
      return callerLine.slice(callerLine.indexOf("at ")+2, callerLine.length);
    }

    /**
     * Support jQuery $.extend
     * 
     * @return {object}
     */
    this.extend = function () {

      var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

      // Handle a deep copy situation
      if (typeof target === "boolean") {
        deep = target;

        // Skip the boolean and the target
        target = arguments[i] || {};
        i++;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {};
      }

      // Check argument
      if (i === length) {
        throw "Arguments required";
      }

      for (; i < length; i++) {
          // Only deal with non-null/undefined values
          if ((options = arguments[i]) != null) {
              // Extend the base object
              for (name in options) {
                  src = target[name];
                  copy = options[name];

                  // Prevent never-ending loop
                  if (target === copy) {
                      continue;
                  }

                  // Recurse if we're merging plain objects or arrays
                  if (deep && copy && (typeof copy === 'object' || (copyIsArray = (Object.prototype.toString.call(copy) === '[object Array]')))) {
                      if (copyIsArray) {
                          copyIsArray = false;
                          clone = src && Object.prototype.toString.call(src) === '[object Array]' ? src : [];

                      } else {
                          clone = src && typeof src === 'object' ? src : {};
                      }

                      // Never move original objects, clone them
                      target[name] = this.extend(deep, clone, copy);

                      // Don't bring in undefined values
                  } else if (copy !== undefined) {
                      target[name] = copy;
                  }
              }
          }
      }

      // Return the modified object
      return target;
    }
  }

  // Library interface
  window.Jqapp = Jqapp;

})(window, window.jQuery || null);