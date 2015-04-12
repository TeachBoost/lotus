# README #


## Contents ##
* Overview
* Configuration
* Dependencies
* CSS/SASS Management
* JS Management
* Deployment Instructions


## Overview ##
This forked Falcon repository (falcon2) contains Observation Process Improvements (colloquially, *Sketch v2*). The editor portion of the observation process uses Redactor.js (version 10); IE8 is not supported.


## Configuration ##
Falcon v2 requires that you work with the [**opi** branch of **titan**](https://bitbucket.org/teachboost/titan/commits/branch/opi).

1. Pull the **titan/opi** branch as well as the **falcon2** repository.
2. In your **titan/opi** branch, change your *app.local.php* settings so that **walk_form_url** points to the **falcon2** instance on your computer.
3. In the **falcon2** repo, create a *default.php* file based off one of the examples, making sure you point the **path** and **asset_path** to the **falcon2** instance on your computer.
4. In a terminal window, navigate the top level of your falcon2 clone. Run `bower install`. This will install all the vendor dependencies into the **falcon2/vendor** folder.
5. Access your local Titan instance via the browser (this should be accessible via the 'base_url' value in your *app.local.php* file in your titan repo). Create a new form to view the Sketch updates.
6. Databases: if you already had the Titan app running locally, you shouldn't need to update anything to work with the existing databases.
7. If you plan to edit SASS, you will need node installed. Once installed, navigate to the top level of your falcon2 clone and run `npm install`. (You may need to run this as sudo.)


## Dependencies ##
All required JS libraries are in the repo. All dependencies are installed by running `bower install`.

For development purposes, you will need to have node installed and you will need to have run `npm install`. This project uses SASS, and you will need to install the compiler if you want to edit any CSS. A Gruntfile is include to automate compiling for both dev and build purposes. Note that you should not need to build the CSS if you have not made any edits - pulling down **falcon2** will include the lastest build of *app.css*.

### Installing Grunt and SASS compilers ###
1. If you do not already have npm, [install it](https://github.com/npm/npm).
2. From a terminal, navigate to your falcon2 directory and run `npm install`. (The package.json file included in the repo lists all the packages required to run Grunt and the associated SASS tasks.)
3. Once your installation is complete, in the same window run `grunt`. This will run the default grunt task, which watches for any edits to .sass files. Upon save of a .sass file, grunt compiles all the sass


## CSS/SASS Management ##

### Development ###
Prior to editing any SASS files, in a terminal, navigate to the **falcon2** directory in your terminal and run `grunt`. A grunt task will then watch for any changes to SASS files, and compile them into *css/app.css*. A sourcemap file will also be created (*app.css.map*), which allows you to see the original file source of CSS rules in your web browser's Developer Tools. That is, when you inspect an element and view its CSS, you will see that the rule is located in *base.sass* rather than in *app.css*.
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
The `grunt build` task will create *build.css*. It will include all of the vendor CSS as well as our application CSS. It is generated in compressed mode. To run the task, open a new Terminal window and run `grunt build` from the **falcon2** directory.


## JS Management ##

### Development ###
All base JS libraries are located in *js/sys/lib*. These are loaded by *app.js*, which is located at the top level of the *js* folder.

App-specific libraries are located in *js/app/web/lib*. These are loaded from *index.php* and initialized by *js/app/web/home.js*.

#### Key Files in app/web/lib ####
In general, files are named for the DOM area they pertain to. User interaction may involve multiple DOM areas, so, functions in one file will call function in another. For example, when the user is giving feedback, they must interact with the Framework. Their click events are handled by *framework.js*, but those events will call some functions in *feedback.js* to properly display the Feedback form.

**form.js**

- Makes a request to titan for the current form data and saves data to local storage.
- Adds data to the DOM after a response is received (e.g., loading the comment bank).
- Includes functions for:
    + Autosaving data to local storage

**editor.js**

- Initilizes the redactor editor (loading custom toolbar buttons in *redactor-plugins.js*)
- Includes functions for:
    + Generating timestamps as the user types
    + Saving editor text to local storage
    + Handling custom redator button functions, such as inserting a Teacher-Student conversation and toggling the highlight state of tagged text

**framework.js**

- Builds the framework HTML for insertion into the DOM.
- Handles click events for the framework competencies
- Includes functions for:
    + Inserting HTML to mark competencies in the framework as tagged, based on the tagged text in the editor (happens on page load)
    + Updating a tag count when a user tags text to a competency
    + Getting competency data from storage based on a competency id ( key-value store )

**feedback.js**

- Displays a feedback form for the clicked/tapped competency, and loads it with relevant data (including previously saved user-entered data).
- Includes functions for:
    + Building evidence text (based on tagged text in the editor DOM element) and inserting it into the Feedback form
    + Generating a comment bank and handling filtering (by rating) and insertion of comments into Feedback form
    + Handling rubric (rating) events
    + Handling save event of the feedback form (writing form data to a local storage statement)

**upload.js**

- Builds the upload modal and adds it to the DOM.
- Handles click events within the modal.
- Handles upload of file, and insertion of uploaded file DOM element into the editor.

**navigation.js**

- Handles user movement through the feedback process, via navigation elements.
- Moves the editor, elevator, and feedback DOM elements and hides/shows elements as relevant to navigational context.

**text.js**

- Text munging functions, including:
    + Changing competency ids to be JS-friendly (no periods in names), and vice-versa

#### Key Files in app/web/config ####
**templates.js**


### Production ###
*to come*


## Deployment Instructions ##
*to come*