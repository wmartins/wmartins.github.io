const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const kebabCase = require('lodash/kebabCase')

function getSlug({ node, slug }) {
  if (!node.frontmatter.date) {
    return slug
  }

  const date = new Date(node.frontmatter.date)
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')

  return `/${year}/${month}${slug}`
}

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === 'MarkdownRemark') {
    const slug = getSlug({
      node,
      slug: createFilePath({ node, getNode, basePath: 'post' })
    })

    createNodeField({
      node,
      name: 'slug',
      value: slug
    })
  }
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }

            frontmatter {
              date
            }
          }
        }

        group(field: frontmatter___tags) {
          fieldValue
        }
      }
    }
  `)

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: path.resolve('./src/templates/blog-post.js'),
      context: {
        slug: node.fields.slug
      }
    })
  })

  result.data.allMarkdownRemark.group.forEach(({ fieldValue }) => {
    createPage({
      path: `/tags/${kebabCase(fieldValue)}`,
      component: path.resolve('./src/templates/tags.js'),
      context: {
        tag: fieldValue
      }
    })
  })
}
