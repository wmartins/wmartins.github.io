import * as React from 'react'
import { graphql } from 'gatsby'

import { Heading } from 'theme-ui'

import Layout from '../components/layout'
import SEO from '../components/seo'
import Tags from '../components/tags'

export default ({ data }) => {
  const post = data.markdownRemark

  return (
    <Layout>
      <SEO title={post.frontmatter.title} />
      {post.frontmatter.title ?
        <Heading as="h1">{post.frontmatter.title}</Heading> :
        null
      }
      <div
        dangerouslySetInnerHTML={{
          __html: post.html
        }}
      >
      </div>
      <Tags tags={post.frontmatter.tags} />
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: {
      slug: {
        eq: $slug
      }
    }) {
      html
      frontmatter {
        title
        tags
      }
    }
  }
`
