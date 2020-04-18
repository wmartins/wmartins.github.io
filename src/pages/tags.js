import * as React from 'react'
import { Link, graphql } from 'gatsby'

import { Heading } from 'theme-ui'

import kebabCase from 'lodash/kebabCase'

import Layout from '../components/layout'
import SEO from '../components/seo'

export default ({
  data: {
    allMarkdownRemark: { group },
  }
}) => {
  return (
    <Layout>
      <Heading as="h1">All tags</Heading>
      <SEO title="All tags" />
      <ul>
        {group.map(tag => (
          <li key={tag.fieldValue}>
            <Link to={`/tags/${kebabCase(tag.fieldValue)}`}>
              {tag.fieldValue} ({tag.totalCount})
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`
