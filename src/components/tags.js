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
      Tags:
      {tags.map(tag =>
        <Box
          as={Link}
          key={tag}
          to={`/tags/${kebabCase(tag)}`}
          pl="2"
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
