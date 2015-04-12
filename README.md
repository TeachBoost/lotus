# README #

## Contents ##
* Overview
* Dependencies
* CSS/SASS Management
* JS Management
* Deployment Instructions

## Overview ##
This respository contains the skeleton for a new TeachBoost front-end application.

## Dependencies ##
All required JS and CSS libraries are in the repo. All dependencies are installed by running `bower install`.

For development purposes, you will need to have node installed and you will need to have run `npm install`. This project uses SASS, and you will need to install the compiler if you want to edit any CSS. A Gruntfile is include to automate compiling for both dev and build purposes.

### Installing Grunt and SASS compilers ###
1. If you do not already have npm, [install it](https://github.com/npm/npm).
2. From a terminal, navigate to your root directory and run `npm install`. (The package.json file included in the repo lists all the packages required to run Grunt and the associated SASS tasks.)
3. Once your installation is complete, in the same window run `grunt`. This will run the default grunt task, which watches for any edits to .sass files. Upon save of a .sass file, grunt compiles all the sass

## CSS/SASS Management ##

### Development ###
Prior to editing any SASS files, in a terminal, navigate to the root directory in your terminal and run `grunt`. A grunt task will then watch for any changes to SASS files, and compile them into *css/app.css*. A sourcemap file will also be created (*app.css.map*), which allows you to see the original file source of CSS rules in your web browser's Developer Tools. That is, when you inspect an element and view its CSS, you will see that the rule is located in *base.sass* rather than in *app.css*.
[More about CSS sourcemaps.](http://thesassway.com/intermediate/using-source-maps-with-sass)

#### File Organization
All SASS files are located in the *sass* folder. If you add or remove a sass file, make sure to update index.sass by adding or removing the given filename. Order matters, so place the new file after any other stylesheet which it should override. In general, CSS rules are contained in a file named for the DOM element they pertain to (e.g., framework layout rules are in *framework.sass*).

Built CSS files are located in the *css* folder.

#### Syntax
We are using SASS' [Indented Syntax](http://sass-lang.com/documentation/file.INDENTED_SYNTAX.html). Indent using 4 spaces. Indentation must be consistent. However, don't rely too heavily on indentation to organize your rules, as you can end up with overly specific selector rules in the final CSS. [Try to keep nested indentation to 3 levels or less](http://thesassway.com/beginner/the-inception-rule). As with CSS, it should never be necessary to nest ID selectors.

Comments in SASS come in two flavors, those prepended with a double slash `//`, and those surrounded by `/* */`. The former will never render in compiled CSS and so are best for *@TODO* and other explanatory notes, as well as for commenting out rules that will not be used (but that you're not ready to delete for some reason). The latter are better for organizational headers.

```
#!css
// This comment will never appear in my CSS
/* This comment will appear in my CSS */
```

#### SASS Compilation Errors
If you have improperly written SASS, your default `grunt` task will inform you (in the Terminal where you are running `grunt`). Additionally, your CSS will contain an actual error dump, and your webpage will render incorrectly. This is a great way to catch errors at the outset, but can be confusing if you aren't paying attention to your Terminal.

### Production ###
The `grunt build` task will create *build.css*. It will include all of the vendor CSS as well as our application CSS. It is generated in compressed mode. To run the task, open a new Terminal window and run `grunt build` from the root directory.

## JS Management ##

### Development ###
All JS application files are located in *js/app/*. The structure is to arrange data in controllers (`pages/`), html views, and any language files. During development, you should run `grunt watch` to concatenate (with sourcemaps) the JS files into `js/dist/build.js` which your application should reference and load.