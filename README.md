# Overview #

Jive is a MVC-ish web framework that runs completely in the browser.  Like
other MVC frameworks, it employs the use of models, controllers, and views
(templates).

Jive uses jQuery to make DOM work less painful.  If you don't know jQuery,
you should.  In fact, go there now and play with it.  It's fun.

Jive is currently pretty alpha stuff.  It's also developed by someone who
does not claim expert status in Javascript, so be gentle on the pedantic
stuff.  Suggestions welcome, though.


# Why Another Framework? #

Jive is special because it exists wholly in Javascript.  Most web
frameworks are mostly server-side.  Jive runs entirely within a single
HTML file and still manages to provide an MVC-ish environment for the
discerning programmer.

For data storage, Jive can make use of HTML5 DOM storage.  If you need
something more centralized/secure, you can make AJAX calls to a
server-side backend of your choice.  Since the backend only has to
facilitate data management, it can be as simple as a data model with a
thin RESTful dispatch layer.

You can also integrate Jive in pretty much any other server-side framework
out there.  Use Jive inside a view within your existing framework, and it
can act as the governing framework for a complex web interface.  Since it
can run entirely within an HTML file, it doesn't get in the way of your
boring server-side framework.

Jive tries to stay lightweight.  It is easy to mix in other libraries to
add functionality.


# Contrived Examples #

To view examples, look in the surprisingly-named "examples" directory.

- Example 1: Hello World
	- Very simple while still illustrating the use of a Jive controller.
	- Renders content to the browser using basic template variable substitution.
- Example 2
	- Shows use of the request object to retrieve action arguments.
	- Renders a template from an external URL.
- Example 3
	- Shows how to submit a form through Jive and process the data.
- Example 4
	- After running ex3, you saw that clicking the back button didn't work when
		you wanted to get back to the form.
	- Use history breadcrumbs (@ prefix) in front of controller/action calls when
		you want to be able to use the Back button to return to it later.
- Example 5
	- Shows use of the base controller/model classes provided by Jive
	- Uses the base model's data validation routine.
	- Shows how multiple controllers coexist.


# Real Life Examples #

These programs are fully-functional, but not necessarily "production-grade."
The user interfaces are probably a bit rough, but the apps illustrate the
flexibility of Jive.

View the source code of these sites to see how Jive can be used.

- [Javascript Reference](http://www.zeroflux.org/jive/jsref/index.html)
	- A basic programmer's reference tool for the Javascript core language.
	- Uses a single XML file as the data source.
	- Note: The reference is useful, albeit incomplete.  You won't find
		XMLHttpRequest in there, for example.
- [Twilight](http://www.zeroflux.org/jive/twilight/index.html)
	- A very simple Twitter client.
	- Lets you categorize all the people you're following, placing them into
		specific lists or "panels".  This lets you manage the flow of information
		more easily, so infrequent twitterers' tweets are not drowned out by the
		more proflific ones.
	- Currently uses DOM storage, so there is no backend at all.  This means
		your settings may be lost if your DOM storage goes bye-bye.
- Coming Soon: Fiasco
	- A simple bug tracker with additional collab features.


# Doc TODO #

- Waits

- Base controller and model; validation, etc

- Jive.store

- Hooks

- Idioms

