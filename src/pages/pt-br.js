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
  <Layout lang="pt-br">
    <SEO title="Todas as postagens" />

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
          regex: "/post/pt-br/"
        }
      }

      sort: {
        fields: frontmatter___date
        order: DESC
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
