import * as React from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'

import { Box, Container, BaseStyles } from 'theme-ui'

export default ({ children }) => {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )

  return (
    <>
      <Container p="4">
        <BaseStyles>
          <header>
            <Box as="nav" pb="4">
              <Box as={Link} to="/" pr="4">
                {data.site.siteMetadata.title}
              </Box>
              <Box as={Link} to="/tags" pr="4">
                tags
              </Box>
              <Box as={Link} to="/about" pr="4">
                about
              </Box>
              <Box as={Link} to="/contact" pr="4">
                contact
              </Box>
            </Box>
          </header>
          {children}
        </BaseStyles>
      </Container>
    </>
  )
}
