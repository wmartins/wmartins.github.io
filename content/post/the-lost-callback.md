---
title: "The Lost Callback"
author: "William Martins"
date: 2019-01-03T00:19:19-02:00
tags: ["react", "async javascript"]
---

In the past few days I was investigating a really tricky issue in one of our
React components. I decided to cover it here because I've found the problem
interesting and, surprisingly, easy to fix after finding out the root cause.

# The Component

First, it's nice to outline a little bit about the component itself. It's a
really simple react component that does the following things:

1. When the component mounts, inserts a `<script>` tag on the page to load an
external dependency
2. When this script is loaded, instantiate a new instance of this external
   dependency
3. Renders correctly both when script is loaded and when it isn't
4. When removing the component, destroys the external dependency instance

So, that said, lets jump into the parts that make it happen.

First, we have the script loader function, which is pretty straightforward:

```js
function addScriptToPage(callback, src) {
    const script = document.createElement('script');

    script.defer = true;
    script.onload = callback;
    script.src = src;

    document.body.appendChild(script);
}
```

The component itself is also pretty straightforward:

```jsx
class TheComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            externalDependency: null,
        };
    }

    componentWillMount() {
        addScriptToPage(() => {
            const externalDependency = new ExternalDependency();
            externalDependency.create();

            this.setState({
                externalDependency,
            });
        }, 'external.js');
    }

    componentWillUnmount() {
        const { externalDependency } = this.state;

        externalDependency && externalDependency.destroy();
    }

    render() {
        const { externalDependency } = this.state;
        const value = externalDependency
            ?  externalDependency.doStuff()
            : 'NOT LOADED YET';

        return <h1>External value: {value}</h1>;
    }
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hide: false,
        };
    }

    componentWillMount() {
        setTimeout(() => {
            this.setState(() => ({
                hide: true,
            }));
        }, 0);
    }

    render() {
        if (this.state.hide) {
            return null;
        }

        return <TheComponent />;
    }
}
```

The external dependency, for all the purposes, is just a library. In our case,
the real one listens to some events and some other stuff. For this post,
consider the following external dependency:

```js
function ExternalDependency() {
    return {
        create: () => {
            window.EXTERNAL = 'EXTERNAL';
        },

        doStuff: () => {
            return 10;
        },

        destroy: () => {
            delete window.EXTERNAL;
        },
    };
}
```

# The Problem

The problem given was the following:

> When we include the component on the page and, right afterwards remove it from
> the page, the component throws an error and the page stops working.

Alongside with the error description, we also had the following log:

```
TypeError: this.state.externalDependency is null
```

# The Test Setup

So, in order to test this problem, we need to simulate this "right afterwards"
behavior. To do so, we'll render the component on the page, set a timeout (a
short one) and remove the component from the screen.

Consider the following code:

```jsx
class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hide: false,
        };
    }

    componentWillMount() {
        setTimeout(() => {
            this.setState(() => ({
                hide: true,
            }));
        }, 0);
    }

    render() {
        if (this.state.hide) {
            return null;
        }

        return <TheComponent />;
    }
}
```

# The Investigation

**Disclaimer:** now that I'm explaining this in a blog post, the problem seems
obvious to me. I think this is because the code shown here is really simplified. The real code has some messy parts, some reducers and lots of code that only
made the investigation progress harder.

Looking at the code, we can see that the only place where
`this.state.externalDependency` can cause this error is inside
`componentWillUnmount`, because it starts as `null`. So, what happens is that
the script hasn't finished loading and we're trying to destroy the instance
(that doesn't exist yet).

So, it might be tempting to do the following:

```js
const { externalDependency } = this.state;

if (externalDependency) {
    externalDependency.destroy();
}
```

It will make the page stop breaking, as now we don't have a `TypeError`,
however, we will start having this error:

```
Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.
```

You might think that it's only a `Warning` and we're good to go, however, that's
not how things work. Now, we **never** call `externalDependency.destroy()`, so,
we never clear the changes done by `externalDependency`. In fact, if we now
check `window.EXTERNAL`, we'll have it with the value `"EXTERNAL"`.

```js
window.EXTERNAL; // "EXTERNAL"
```

## Making It Clear

So, let's recap what's going on, before exploring the solution:

1. The component is rendered on the page
2. The script pointing to `external.js` is created on the page, a callback is
   registered to, when the script loads, instantiate an instance of
   `ExternalDependency`
3. The component is removed
4. The `componentWillUnmount` is triggered (not calling
   `externalDependency.destroy()`, as it wasn't instantiated so far)
5. The component is removed from the DOM
6. The script finishes loading
7. The callback defined in `2.` is executed
8. The external dependency is instantiated
9. The component tries to `setState` in an unmounted component, which explains
   the error before

# The Solution

While it can be tempting to put something on `componentWillUnmount`, like a
`setState` or so, it is not correct and also doesn't make sense.
`componentWillUnmount` is called when the component is just about to be removed,
there's no "hey React, wait a little bit so I can make some stuff here
and I let you know when you can remove me". Also, setting a state on a component
to be unmounted doesn't make sense, as this component is being removed, it will
not render again nor go to any other `lifecycle` methods.

## Solution 1: Know When Unmounted

One solution that I particularly **don't like** is to have an instance property in
your component that allows you to know if the component is being unmounted.
Something like that:

```js
componentWillUnmount() {
    this.isUnmounted = true;
    /* ... remaining code ... */
}
```

Then, add a guard condition in your code to avoid the callback to run in this
case:

```js
addScriptToPage(() => {
    if (this.isUnmounted) return
    /* ... remaining code ... */
})
```

This works, however, imagine that in some new update, the React team decides to
clear all instance properties (our `isUnmounted` included). We now have our
memory leak again. Basically, with this solution, we're relying on React to set
a property for us and set it in the correct moment, which gives us less control
of our code flow.

## Solution 2: Control When to Execute the `onload` Callback

Our final solution and, in my opinion, a most elegant one, is to have an option
to cancel the execution of our script loader. Our problem is that the `onload`
callback is being called after the component is unmounted, so, if we never call
this callback, we'll not have this problem.

In this case, we can do something like that:

```js
function addScriptToPage(callback, src) {
    const script = document.createElement('script');

    script.src = src;
    script.defer = true;
    script.onload = callback;

    document.body.appendChild(script);

    return {
        cancelOnLoad: () => script.onload = null,
    };
}
```

Now, in our component, we need to hold a reference to this returned object when
calling `addScriptToPage`:

```js
componentWillMount() {
    const scriptLoader = addScriptToPage(() => {/* remaining code */});
    this.setState({ scriptLoader });
}
```

Then, when unmounting, we just call `cancelOnLoad`:

```js
componentWillUnmount() {
    /* remaining code */
    this.state.scriptLoader.cancelOnLoad();
}
```

This is a lot better, as now we manage this flow. For example, it's also
possible to remove the previously defined script (and save some bytes of our
users data):

```js
return {
    cancelOnLoad: () => {
        script.onload = null;
        document.body.removeChild(script);
    },
};
```

# Finishing

I think this problem was really interesting to show me how a simple script
loader can become a hard problem to debug if we don't think correctly in the
flow which our code is executed.

Also, always remember to cancel/clear stuff, specially the async ones, to avoid
having those kind of problems.
