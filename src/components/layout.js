import * as React from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'

import { Box, Container, BaseStyles } from 'theme-ui'

const menu = (lang) => {
  const enUS = [{
    title: "pt-br",
    path: "/pt-br",
  }, {
    title: "tags",
    path: "/tags",
  }, {
    title: "about",
    path: "/about",
  }, {
    title: "contact",
    path: "/contact",
  }]

  const ptBR = [{
    title: "en-us",
    path: "/",
  }]

  if (lang === "pt-br") {
    return ptBR
  }

  return enUS
}

export default ({ children, lang }) => {
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
              {menu(lang).map(({ title, path }) => {
                return <Box as={Link} to={path} pr="4">{title}</Box>
              })}
            </Box>
          </header>
          {children}
        </BaseStyles>
      </Container>
    </>
  )
}
