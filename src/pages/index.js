import * as React from 'react'
import { graphql } from 'gatsby'

import Layout from '../components/layout'
import Post from '../components/post'
import SEO from '../components/seo'

export default ({
  data: {
    allMarkdownRemark: {
      edges
    }
  }
}) => (
  <Layout>
    <SEO title="All posts" />

    {edges.map(({ node }) => (
      <Post
        key={node.fields.slug}
        slug={node.fields.slug}
        title={node.frontmatter.title}
        date={node.frontmatter.date}
      >
        {node.excerpt}
      </Post>
    ))}
  </Layout>
)

export const query = graphql` 
  query {
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: {
          regex: "/post/"
        }
      }

      sort: {
        fields: frontmatter___date
        order: ASC
      }
    ) {
      edges {
        node {
          excerpt

          fields {
            slug
          }

          frontmatter {
            date(formatString: "MMM DD[,] YYYY")
            title
          }
        }
      }
    }
  }
`
