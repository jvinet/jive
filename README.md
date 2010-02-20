# Overview #

Jive is a MVC-ish web framework that runs completely in the browser.  Like
other MVC frameworks, it employs the use of models, controllers, and views
(templates).

Jive uses jQuery to make DOM work less painful.  If you don't know jQuery,
you should.  In fact, go there now and play with it.  It's fun.


# Why Another Framework? #

Jive is special because it exists wholly in Javascript.  Most web
frameworks are mostly server-side.  Jive runs entirely within a single
HTML file and still manages to provide an MVC-ish environment for the
discerning coder.

For data storage, Jive can make use of HTML5 DOM storage.  If you need
something more centralized/secure, you can make AJAX calls to a
server-side backend of your choice.  Since the backend only has to
facility data management, it can be as simple as a data model with an API
dispatch layer.

You can also integrate Jive in pretty much any other server-side framework
out there.  Use Jive inside a view within your existing framework, and it
can act as the governing framework for a complex web interface.  Since it
can run entirely within an HTML file, it doesn't get in the way of your
boring server-side framework.


# Examples #

To view examples, look in the surprisingly-named "examples" directory.

- Example 1: Hello World
	- Very simple while still illustrating the user of a Jive controller.
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


# Doc TODO #

- Waits

- Base controller and model; validation, etc

- Jive.store

- Hooks

- Idioms

- Real Life App: JS Ref

- Real Life App: Fiasco

- Real Life App: Twilight

