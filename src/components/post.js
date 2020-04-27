import * as React from 'react'

import { Divider, Box, Heading, Text } from 'theme-ui'
import { Link } from 'gatsby'

export default ({
  slug,
  title,
  date,
  children
}) => (
  <Box
    as="section"
    pb="3"
    borderStyle="solid"
  >
    <Divider mb="4"/>
    <Link to={slug}>
      <Heading as="h3" pb="1">{title}</Heading>
    </Link>
    <div>
      <time>{date}</time>
    </div>
    <Text py="2">{children}</Text>
  </Box>
)
