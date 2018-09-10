import React from 'react'
import { withRouteData } from 'react-static'

import Markdown from '../components/Markdown'

export default withRouteData(({content, baseUrl, onTOC = () => {}}) => (
  <Markdown
    onTOC={(toc) => onTOC(toc)}
    baseUrl={baseUrl}
    source={content} />
))
