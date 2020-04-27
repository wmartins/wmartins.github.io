import * as React from 'react'

import { Box, Divider } from 'theme-ui'

import kebabCase from 'lodash/kebabCase'
import { Link } from 'gatsby'

const Tags = ({ tags }) => {
  if (!tags || !tags.length) {
    return null
  }

  return (
    <>
      <Divider />
      <Box as="span" pr="2">
        Tags:
      </Box>
      {tags.map(tag =>
        <Box
          as={Link}
          key={tag}
          to={`/tags/${kebabCase(tag)}`}
          pr="2"
        >
          {tag}
        </Box>
      )}
    </>
  )
}

Tags.defaultProps = {
  tags: []
}

export default Tags
