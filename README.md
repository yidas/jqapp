<p align="center">
    <a href="https://jquery.com" target="_blank">
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/JQuery_logo.svg/220px-JQuery_logo.svg.png" height="50px">
    </a>
        <h1 align="center">Jqapp.js</h1>
    <br>
</p>

[![npm version](https://img.shields.io/npm/v/jqapp.svg)](https://www.npmjs.com/package/jqapp)
[![License](https://img.shields.io/github/license/yidas/jqapp.svg)](https://github.com/yidas/jqapp/blob/master/LICENSE)

JavaScript MVC (MVP) Framework suitable for jQuery development

FEATURES
--------

- ***Lightweight MVC (MVP)** Javascript framework with [Vue.js](https://vuejs.org/) pattern like*

- ***[jQuery](https://jquery.com/)** supported, or **alternatively [pure JS (ECMAScript 5) alone](#-jquery)** without any library*

- ***[Element Scope](#instance-element-scope), [Template Engine](#template), [Components](#components)** features*

---

OUTLINE
-------

- [Introduction](#introduction)
- [Demonstration](#demonstration)
- [Requirements](#requirements)
- [Installation](#installation)
- [Guide](#guide)
    - [Jqapp Instance](#jqapp-instance)
        - [Creating a Jqapp Instance](#creating-a-jqapp-instance)
        - [Data and Methods](#data-and-methods)
        - [Instance Element Scope](#instance-element-scope)
        - [Instance Lifecycle Hooks](#instance-lifecycle-hooks)
        - [Lifecycle Diagram](#lifecycle-diagram)
    - [Template](#template)
        - [Text variable](#text-variable)
        - [String Template](#string-template)
        - [DOM Template](#dom-template)
    - [Components](#components)
        - [Base Example](#base-example)
        - [Render Component](#render-component)
- [API](#api)
    - [Global Config](#global-config)
    - [Options / Data](#options--data)
    - [Options / DOM](#options--dom)
    - [Options / Lifecycle Hooks](#options--lifecycle-hooks)
    - [Instance Properties](#instance-properties)
    - [Instance Methods / Data](#instance-methods--data)

---

INTRODUCTION
------------

Jqapp is a simple JavaScript / jQuery framework that makes you develop Frond-End application smoothly and efficiently with skeleton.

In general, we use [jQuery](https://jquery.com/) to solve simple Front-End requirements but no framework specification. Jqapp aims to provide the solution for jQuery development with MVC (MVP) design pattern, which may be suitable for your jQuery project, optimizing the architecture and improving maintainability. On the other hand, if you need to develop large requirements which is suitable for MVVM framework with two-way binding, you could choose [Vue.js](https://vuejs.org/) or other else.

---

DEMONSTRATION
-------------

Jqapp.js Demo Site: [https://yidas.github.io/jqapp/](https://yidas.github.io/jqapp/)

At the core of Jqapp.js is a system that enables us to declaratively render data to the DOM using straightforward template syntax:

```html
<div id="app">
</div>
```

```javascript
new Jqapp({
  el: "#app",
  data: {message: 'Hello Jqapp!'},
  template: '<div>{{ message }}</div>',
})
```

```
Hello Jqapp!
```
[JSFiddle Example](https://jsfiddle.net/718mxp6r/)

---

REQUIREMENTS
------------
This library requires the following:

- jQuery 1.11.0+ | 2.0+ | 3.0+ (Optional)

---

INSTALLATION
------------

### Bower Installation

```
bower install jqapp
```

> You could also download by [NPM](https://www.npmjs.com/package/jqapp) or directly copy [`dist`](https://github.com/yidas/jqapp/tree/master/dist) assets. ([Last Release for download](https://github.com/yidas/jqapp/releases))

### Assets include

Add Jqapp JavaScript file either to the `<head>`, or to the bottom of `<body>`

```html
<script type="text/javascript" src="dist/jqapp.min.js"></script>
```

---

GUIDE
-----


### Jqapp Instance

#### Creating a Jqapp Instance

Every Jqapp application starts by creating a new Jqapp instance with the `Jqapp` function:

```javascript
var app = new Jqapp({
  // options
})
```

As a convention, we often use the variable `app` to refer to our Jqapp instance.

#### Data and Methods

When a Jqapp instance is created, it adds all the properties found in its `data` and `methods` objects. Please note that this framework is not MVVM pattern, the `data` will not react with view.

```javascript
// Create a app with data and methods
var app = new Jqapp({
  data: { a: 1 },
  methods: {
    alert: function () {alert()}
  },
});

// Get data from Jqapp instance
app.a // => 1

// Call method from Jqapp instance
app.alert();
```

#### Instance Element Scope

After Jqapp instance is [mounted](#-mounted), the [`this.$el`](#-thisel)(Element) / [`this.$$el`](#-thisel-1)(jQuery Element) will be created which refer to the instance element. You can manipulate or query any element under the instance root element's scope by using them:

```javascript
new Jqapp({
  el: "#app",
  mounted: function () {
    // Set content for the instance root element by ECMAScript5
    this.$el.innerHTML = '<p>Text by JS</p>';
    // Append element to the instance root element by jQuery
    this.$$el.append('<p>Text by jQuery</p>');
  }
})
```

> [JSFiddle Example](https://jsfiddle.net/o0hj65kw/)

#### Instance Lifecycle Hooks

Each Jqapp instance goes through a series of initialization steps when it’s created - for example, it needs to compile the template, and mount the DOM element to the instance. Along the way, it also runs functions called lifecycle hooks, giving users the opportunity to add their own code at specific stages.

For example, the `mounted` hook can be used to run code after an instance is mounted with element cache:

```javascript
new Jqapp({
  el: "#app",
  mounted: function () {
    // `this` points to the app instance
    console.log(this.$el)  // Element
    console.log(this.$$el) // jQuery element
  }
})
```

There are also other hooks which will be called at different stages of the instance’s lifecycle, such as `beforeCreate`, `created` and `mounted`. All lifecycle hooks are called with their this context pointing to the Jqapp instance invoking it.

#### Lifecycle Diagram

Below is a diagram for the instance lifecycle. You don’t need to fully understand everything going on right now, but as you learn and build more, it will be a useful reference.

<p align="center">
    <img src="https://raw.githubusercontent.com/yidas/jqapp/master/img/jqapp.png" width="60%">
</p>

### Template

Jqapp uses an HTML-based template syntax that allows you to render DOM with variables from the instance's data. All Jqapp templates are valid HTML that can be parsed by spec-compliant browsers and HTML parsers.

#### Text variable

The most basic form of data rendering is text interpolation using the “Mustache” syntax (double curly braces):

```html
<span>Message: {{ msg }}</span>
```

The mustache tag will be replaced with the value of the `msg` property on the corresponding data object.

> [Example of Template](https://yidas.github.io/jqapp/template.html)

#### String Template

You can directly define HTML string into `template` option with text variable:

```javascript
new Jqapp({
  el: "#app",
  components: {
    'item': {
      data: {msg: ''},
      template: "<div><span>Message: {{ msg }}</span></div>",
    },
  },
  mounted: function () {
    this.$append("div.items", 'item', {data: {msg: 'Data from Parent'}});
  },
})
```

In above case, the `{{ msg }}` variable will be replaced to `Data from Parent` from parent instance.

#### DOM Template

You can also define a template in HTML DOM with a `text/template` type script tag:

```html
<script type="text/template" id="item-template">
  <div>
    <span>Message: {{ msg }}</span>
  </div>
</script>
```

Then declare the the template's ID querySelector into `template` option (Sample code from [String Template](#string-template)):

```javascript
{
  data: {msg: ''},
  template: "#item-template",
},
```

### Components

#### Base Example

Here’s an example of a Jqapp component:

```javascript
// Define a new component called counter for Jqapp instance
var counterComponent = {
  data: {count: 0},
  template: '<div><button>You clicked me <span class="count">{{ count }}</span> times.</button></div>',
  mounted: function () {
    var component = this;
    this.$$el.find('button').click(function () {
      component.count ++;
      $(this).find(".count").text(component.count);
    });
  }
};
```

Components are reusable Jqapp instances defined in a Jqapp instance, we can render a component as a custom element by calling `renderComponent()` with component name: in this case, `counter`. The Other Hand, by calling `append()` to render a component and append into the element.

```javascript
var app = new Jqapp({
  el: "#app",
  components: {
    'counter': counterComponent,
  },
  methods: {
    createCounter: function () {
      this.$append(".list", 'counter');
    }
  },
  mounted: function () {
    this.createCounter();
    this.createCounter();
    var app = this;
    this.$$find(".btn-add").click(function() {
      app.createCounter();
    });
  },
```

```html
<div id="app">
  <button type="button" class="btn-add">Add a Counter</button>
  <div class="list"></div>
</div>
```

> [Example of Components](https://yidas.github.io/jqapp/components.html)

#### Render Component

To render a component element:

```javascript
new Jqapp({
  el: "#app",
  components: {
    'item': {
      template: "<div><p>Item</p></div>",
    },
  },
  mounted: function () {
    // renderComponent() returns element
    var compoentElement = this.$renderComponent('item');
    this.$$el.find("div.items").append(compoentElement);
    // Equal to `this.$append('item', "div.items")`;
  },
})
```

Above sample code uses `renderComponent()` to render a component element then append into `app` root element. You could use `append` to render and append a component into a element by giving component name and element/selector.


---

API
---

### Global Config

#### # silent

- Type: `boolean`
- Default: `false`
- Usage:

    ```javascript
    Jqapp.config.silent = true
    ```
    Suppress all Vue logs and warnings.
    
#### # jQuery

- Type: `boolean`
- Default: `true`
- Usage:

    ```javascript
    Jqapp.config.jQuery = false
    ```
    Whether to require jQuery. You can use pure JS alone by turning to `false`.
    
#### # compileElement

- Type: `boolean`
- Default: `true`
- Usage:

    ```javascript
    Jqapp.config.compileElement = false
    ```
    Whether to compile `options.el` elements when there are no `options.template`.

### Options / Data

#### # data

- Type: `Object | Function`
- Details:

    The data object for the Jqapp instance. Data will be mixed into the Jqapp instance. You can access these data directly on the Jqapp instance, or use them in directive expressions. Data is also be used by [Template](#template) on renderning.

#### # methods

- Type: `{ [key: string]: Function }`
- Details:

    Methods to be mixed into the Jqapp instance. You can access these methods directly on the Jqapp instance, or use them in directive expressions. All methods will have their `this` context automatically bound to the current instance.

### Options / DOM

#### # el

- Type: `string | HTMLElement`
- Details:

    Provide the Jqapp instance an existing DOM element to mount on. It can be a CSS selector string or an actual HTMLElement.

#### # template

- Type: `string`
- Details:

    A string template to be used as the markup for the Jqapp instance. The template will replace the mounted element. Any existing markup inside the mounted element will be ignored.

    If the string starts with `#` it will be used as a querySelector and use the selected element’s innerHTML as the template string. This allows the use of the common `<script type="text/template">` trick to include templates.
    
    > From a security perspective, you should only use Jqapp templates that you can trust. Never use user-generated content as your template.

### Options / Lifecycle Hooks

#### # beforeCreate

- Type: `Function`
- Details:

    Called synchronously immediately after the instance has been initialized, before data / methods mixing.
    
- See also: [Lifecycle Diagram](#lifecycle-diagram)

#### # created

- Type: `Function`
- Details:

    Called synchronously after the instance is created. At this stage, the instance has finished processing the options which means data / methods have been set up. However, the mounting phase has not been started, and the `el` / `$el` property will not be available yet.
    
- See also: [Lifecycle Diagram](#lifecycle-diagram)

#### # beforeMount

- Type: `Function`
- Details:

    Called right before the mounting begins: the [template](#template) is about to be rendered for the first time.
    
- See also: [Lifecycle Diagram](#lifecycle-diagram)

#### # mounted

- Type: `Function`
- Details:

    Called after the instance has been mounted, where `el` is replaced by the newly created `this.$el` / `this.$$el`. If the root instance is mounted to an in-document element, `this.$el` will also be in-document when mounted is called.
    
- See also: [Lifecycle Diagram](#lifecycle-diagram)

#### # beforeDestroy

- Type: `Function`
- Details:

    Called right before a Jqapp instance is destroyed. At this stage the instance is still fully functional.
    
- See also: [Lifecycle Diagram](#lifecycle-diagram)

#### # destoryed

- Type: `Function`
- Details:

    Called after a Jqapp instance has been destroyed. When this hook is called, the root element of the Jqapp instance have been removed.
    
- See also: [Lifecycle Diagram](#lifecycle-diagram)

### Instance Properties

#### # this.$el

- Type: `HTMLElement`
- Read only
- Details:

    The current instance's element

#### # this.$$el

- Type: `jQuery HTMLElement`
- Read only
- Details:

    The current instance's jQuery element, `null` when jQuery not loaded

#### # this.$parent

- Type: `Object` Jqapp instance
- Details:

    The current instance's parent instance which could be App or Component
    
#### # this.$root

- Type: `Object` Jqapp instance
- Details:
    
    The root Jqapp instance of the current component tree. If the current instance has no parents this value will be itself.

#### # this.$data

- Type: `Object`
- Read only
- Details:

    The data object that the Jqapp instance is used, which same as [Data instance properties](#data-and-methods).
    
- See also: [Options / Data - data](#-data)
    
#### # this.$options

- Type: `Object`
- Read only
- Details:

    The instantiation options used for the current Jqapp instance. This is useful when you want to include custom properties in the options.

### Instance Methods / Data


#### # this.$mount()

Mount element into instance

- Arguments:
    - `{Element|string|jQuery} elementOrSelector`
- Returns: `{Object}` Instance 

#### # this.$remove()

Remove all elements from instance

- Arguments:
    - `{Element|string|jQuery} elementOrSelector`
- Returns: `{Object}` Instance 

#### # this.$renderComponent()

Render a element from Component

- Arguments:
    - `{string} componentKey`
    - `{Object} options` Component options
- Returns: `{Element}` Component instance element

#### # this.$$renderComponent()

Render a jQuery element from Component

- Arguments:
    - `{string} componentKey`
    - `{Object} options` Component options
- Returns: `{jQuery}` jQuery component instance element

#### # this.$find()

Find element from instance element

- Arguments:
    - `{string} selector`
- Returns: `{Element} Instance element`

#### # this.$$find()

Find jQuery element from instance element

- Arguments:
    - `{string | Element | jQuery} selectorOrElement`
- Returns: `{jQuery} jQuery element`

#### # this.$append()

Shortcut of appending `this.$renderComponent()` into `this.$find()` element

- Arguments:
    - `{string} selector`
    - `{string} componentKey`
    - `{Object} options` Component options
    - `{Function} complete` A function to call once the shortcut is complete
- Returns: `{Element}` Instance element

#### # this.$$append()

Shortcut of appending `this.$renderComponent()` into `this.$$find()` element

- Arguments:
    - `{string | jQuery | Element} selectorOrElement`
    - `{string} componentKey`
    - `{Object} options` Component options
    - `{Function} complete` A function to call once the shortcut is complete
- Returns: `{jQuery}` jQuery Instance element

#### # this.$replace()

Shortcut of replacing `this.$find()` element with `this.$renderComponent()`

- Arguments:
    - `{string} selector`
    - `{string} componentKey`
    - `{Object} options` Component options
    - `{Function} complete` A function to call once the shortcut is complete
- Returns: `{Element}` Instance element

#### # this.$$replace()

Shortcut of replacing `this.$$find()` element with `this.$renderComponent()`

- Arguments:
    - `{string | jQuery | Element} selectorOrElement`
    - `{string} componentKey`
    - `{Object} options` Component options
    - `{Function} complete` A function to call once the shortcut is complete
- Returns: `{jQuery}` jQuery Instance element

#### # this.$html()

Shortcut of setting `this.$renderComponent()` into `this.$find()` element

- Arguments:
    - `{string} selector`
    - `{string} componentKey`
    - `{Object} options` Component options
    - `{Function} complete` A function to call once the shortcut is complete
- Returns: `{Element}` Instance element

#### # this.$$html()

Shortcut of setting `this.$renderComponent()` into `this.$$find()` element

- Arguments:
    - `{string | jQuery | Element} selectorOrElement`
    - `{string} componentKey`
    - `{Object} options` Component options
    - `{Function} complete` A function to call once the shortcut is complete
- Returns: `{jQuery}` jQuery Instance element
