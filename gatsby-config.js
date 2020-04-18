module.exports = {
  siteMetadata: {
    title: 'wwwhmartins',
    description: 'William Martins on the web, I guess'
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'src',
        path: `${__dirname}/content`
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: ['gatsby-remark-prismjs']
      }
    },
    'gatsby-plugin-theme-ui',
    'gatsby-plugin-react-helmet'
  ],
}
