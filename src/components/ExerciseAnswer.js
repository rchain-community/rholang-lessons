import React from 'react'
import PropTypes from 'prop-types'

export default class ExerciseAnswer extends React.PureComponent {
  static currentlySelected = {}

  static propTypes = {
    correct: PropTypes.bool,
    value: PropTypes.any,
    questionId: PropTypes.string
  }

  state = {
    selected: false
  }

  deselect () {
    this.setState({selected: false})
  }

  selectAnswer () {
    const {questionId} = this.props
    if (questionId in ExerciseAnswer.currentlySelected) {
      ExerciseAnswer.currentlySelected[questionId].deselect()
    }

    ExerciseAnswer.currentlySelected[questionId] = this
    this.setState({selected: true})
  }

  render () {
    const {correct, value} = this.props

    const classes = ['exercise-answer']
    if (this.state.selected) {
      classes.push('exercise-answer-selected')
      if (correct) {
        classes.push('correct')
      } else {
        classes.push('incorrect')
      }
    }

    return (
      <a className={classes.join(' ')} onClick={() => this.selectAnswer()}>
        {value}
      </a>
    )
  }
}
