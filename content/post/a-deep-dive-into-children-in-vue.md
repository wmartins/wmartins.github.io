---
title: "A deep dive into children in Vue"
author: "William Martins"
date: 2019-05-16T22:53:40-03:00
tags: ["vue", "funcional components", "vue children"]
---

I got myself inspired by Max Stoiber in his [**A deep dive into children in
React**](https://mxstbr.blog/2017/02/react-children-deepdive/) to create this
post about Vue children. So, credits on the title to him. If you're into React,
check out his post, it has lots of nice information on React children.

## Motivation

I have started working with Vue a few months ago and it has been really nice.
After working with React for some years, it's nice to experience something new.

I'm writing this post because there are some patterns that I used in React and I
miss in Vue. In this case, this post will cover manipulating children elements
in Vue components.

This is really straightforward to do with React. So, I'll try to cover some
parts of Vue that enables us to do something similar as done in React.

The fantastic part is that Vue is really well thought (congratulations to all
maintainers for that) and really simple, so, we can manipulate Vue objects in an
easy way to achieve what we need.

### About React children

If you come from a non React background and want to know more about its children
concept, please refer to their documentation on that:

- [`React.Children`](https://reactjs.org/docs/react-api.html#reactchildren)

## What are children

First of all, to be on the same page, we'll call `children` elements all
elements rendered inside any given Vue component. Here are some examples:

```vue
<template>
    <Parent>
        <div>This is a child</div>
        <Child /> <!-- This is also a child -->
        <span>Another child</div>
    </Parent>
</template>
```

Every single element that is put inside another one can be considered a child
element. It doesn't matter if it is a custom component, a tag or some text.

There's only one detail to the statement above:
[`Vue Slots`](https://vuejs.org/v2/guide/components-slots.html) work in a
different manner based on whether a component is
[`functional`](https://vuejs.org/v2/guide/render-function.html#Functional-Components)
or not (we'll get to that later).

## Creating templates with children support

To create elements that have children support we can simply use the `<slot />`
tag in our components.

For example, imagine we're creating a dynamic `<Button>` component that receives
its children. We can define the component template like this:

```vue
<template>
    <button>
        <slot />
    </button>
</template>
```

And, use it like this:

```vue
<template>
    <Button>
        Content goes here
    </Button>
</template>
```

This will render a button with `Content goes here` content.

Please note that you can add anything "renderable" inside `<slot>`. In the
example above we rendered a simple text, but you can render a `<div>`, a
`<CustomComponent>` and so on.

## Vue render process

Before we continue, it's interesting to know a little bit how Vue render process
works. Basically, whenever you write a template, Vue compiles it to a
[render function](https://vuejs.org/v2/guide/render-function.html). As said in
[template
compilation](https://vuejs.org/v2/guide/render-function.html#Template-Compilation)
part:

> You may be interested to know that Vue’s templates actually compile to render
> functions. This is an implementation detail you usually don’t need to know
> about, but if you’d like to see how specific template features are compiled,
> you may find it interesting.

This knowledge will be useful from now on, as we can use this to manipulate our
children elements.

## Manipulating children elements

Sadly Vue doesn't provide a way to manipulate children using the `<template>`
tag. For example, using React one would do:

```jsx
const Component = ({ children }) => (
    <div>
        {React.Children.map(children, (child, i) => {
            // do whatever I want with `child`

            return child
        })}
    </div>
)
```

In Vue, we can leverage the use of
[`createElement`](https://vuejs.org/v2/guide/render-function.html#createElement-Arguments)
and render functions. So, we will **not** write a `<template>` for our
components, as now we'll render the template manually.

As a minimal boilerplate, if you want to manipulate children with Vue, you
should do:

```vue
<script>
export default {
    functional: true,

    render(createElement, context) {
        const $children = context.children

        const children = $children.map((child, i) => {
            // do whatever I want with `child`

            return child
        })

        return createElement('div', children)
    }
}
</script>
```

Please note that, as we're using [functional
components](https://vuejs.org/v2/guide/render-function.html#Functional-Components),
in this case `context.children` contains all given children, no matter if user
specified `slots`. For example, imagine that we're rendering the following
children inside our component:

```vue
<template>
    <Component>
        <div>Child 1</div>
        <div slot="slot1">Child 2</div>
    </Component>
</template>
```

In this case, `context.children` contains both `Child 1` and `Child 2`. If you
want to have all slots separated, you can use `context.slots()` function. This
will return an object like:

```js
{
    default: Array[VNode],
    slot1: Array[VNode]
}
```

### When not using functional components

I don't see why not use functional components in those cases, however, if you
really need to, it becomes a little bit harder and _unstable_ to access children
components.

First of all, you'll rely on `this` to access data. Second, you'll need to
access some private properties of the Vue instance, which is not really good
(they're not documented in the "public api" -
https://vuejs.org/v2/api/#Instance-Properties), as if Vue core team decides to
change them, your code will break. Here's an example:

```vue
export default {
    render(createElement) {
        const children = this.$options._renderChildren // a "private" property

        return createElement('div', children)
    }
}
```

In the same way, you can also access `this.$slots` to get all slots.

## Working example

I created a simple example to illustrate those situations. Please go to
https://codesandbox.io/s/vue-template-ny5hg?fontsize=14 and check it out. There,
I'll have two components: one using `functional` components and other using
regular components.

## What can I do with that?

Well, mostly of those manipulations will be done in a higher level abstraction.
For example, imagine you need to filter out all `<Other>` component instances,
you can do something like that:

```vue
<script>
import Other from './Other.vue'
export default {
  functional: true,

  render(createElement, { children }) {
    return createElement("div", children.filter(child => {
      const { componentOptions = {} } = child
      console.log(child, componentOptions.Ctor, Other._Ctor[0])

      return componentOptions.Ctor !== Other._Ctor[0]
    }));
  }
};
</script>
```

(It's a little bit ugly, I know)

Another example is when you need to inject some properties. For example, take
the great Reach's Tabs component: https://ui.reach.tech/tabs/. It's a generic
Tab component that enables the user to place `<TabList>` (the tab navigation)
and `<TabPanels>` wherever user wants. But, to do that, we need to have a smart
wrapper component to do this for us.

For example, take this template:

```
<template>
    <div>
        <Tabs>
            <TabList>
                <Tab>Tab 1</Tab>
                <Tab>Tab 2</Tab>
            </TabList>

            <TabPanels>
                <TabPanel>Tab panel 1</TabPanel>
                <TabPanel>Tab panel 2</TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
```

In this case, `<Tabs>` can be "smart" and inject properties/callbacks to
children components, allowing `<TabList>` and `<TabPanels>` to know which tab is
currently active, handle tab change and so on.

## References

While browsing for help on that subject, I've found some relevant discussions
that you may find interesting on further readings:

- https://forum.vuejs.org/t/loop-through-elements-passed-into-slot/6558
- https://forum.vuejs.org/t/loop-with-v-for-slots-default/20646/2

There's also an abstraction that allows you to move this logic to your
`<template>`, however, I don't really know if I like that, but it might help
you:

- https://www.npmjs.com/package/vue-wrap
