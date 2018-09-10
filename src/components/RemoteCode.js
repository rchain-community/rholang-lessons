import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import Code from './Code'

export default class RemoteCode extends React.PureComponent {
  static propTypes = {
    href: PropTypes.string
  }

  state = {
    code: null
  }

  async componentDidMount() {
    const {data} = await axios.get(this.props.href)
    this.setState({
      code: data.trim()
    })
  }

  render () {
    const {code} = this.state

    if (!code) {
      return null
    }

    return <Code key={this.props.href}>{code}</Code>
  }
}
