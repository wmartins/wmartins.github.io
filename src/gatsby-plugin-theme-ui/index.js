const merge = require('lodash/merge')
const { base } = require('@theme-ui/presets')

export default merge({}, base, {
  sizes: {
    container: 1024
  },

  colors: {
    muted: '#eeeeee'
  },

  fonts: {
    body: 'Georgia, serif',
    heading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif'
  },

  styles: {
    root: {
      fontSize: 20
    },

    h1: {
      fontFamily: 'heading'
    },

    time: {
      color: 'gray',
      fontSize: 1
    },

    hr: {
      color: 'muted'
    },

    a: {
      display: 'inline-block'
    },

    nav: {
      fontSize: 18
    }
  },

  borders: [0, '1px solid'],
})
