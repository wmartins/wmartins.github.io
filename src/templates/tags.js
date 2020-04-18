import * as React from 'react'

import { Link, graphql } from 'gatsby'

import { Heading } from 'theme-ui'

import Layout from '../components/layout'
import SEO from '../components/seo'

export default ({
  data: {
    allMarkdownRemark: {
      edges
    }
  },
  pageContext
}) => {
  return (
    <Layout>
      <SEO title={pageContext.tag} />
      <Heading as="h1">{pageContext.tag}</Heading>
      <ul>
        {edges.map(({ node }) => (
          <li key={node.fields.slug}>
            <Link to={node.fields.slug}>
              {node.frontmatter.title}
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export const query = graphql`
  query($tag: String) {
    allMarkdownRemark(
      filter: {
        frontmatter: {
          tags: {
            in: [$tag]
          }
        }
      }
    ) {
      edges {
        node {
          fields {
            slug
          }

          frontmatter {
            title
          }
        }
      }
    }
  }
`
