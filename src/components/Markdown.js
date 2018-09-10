import React from 'react'
import ReactHtmlParser, { convertNodeToElement, processNodes } from 'react-html-parser'
import generatePropsFromAttributes from 'react-html-parser/lib/utils/generatePropsFromAttributes'
import compiler from 'react-smackdown/lib/compiler'
import uuid from 'uuid/v4'

import Code from './Code'
import RemoteCode from './RemoteCode'
import SubHeading from './SubHeading'
import ExerciseAnswer from './ExerciseAnswer'

const renderers = {
  'h2': (props) => (<SubHeading level={2} {...props} />),
  'h3': (props) => (<SubHeading level={3} {...props} />)
}

let setToc = false

export default function Markdown ({source, baseUrl, onTOC = () => {}}) {
  let toc = []
  let questionId = uuid()
  let answerCorrect = false
  let answerTitle = []
  const transformAnswer = (node) => {
    if (node.type === 'tag' && node.name === 'input' &&
      node.attribs && node.attribs.type === 'checkbox') {
      answerCorrect = node.attribs.checked !== undefined
      return
    }
    answerTitle.push(node)
  }
  const transform = (node, index) => {
    // Transform h2 and h2 to SubHeading, and add to TOC
    if (node.type === 'tag' && renderers[node.name]) {
      const Component = renderers[node.name]
      const props = generatePropsFromAttributes(node.attribs, index)
      const children = processNodes(node.children, transform)

      const flattenedChildren = node.children && node.children[0] && node.children[0].data
        ? node.children[0].data
        : null

      if (!setToc) {
        toc.push({type: node.name, id: props.id, value: flattenedChildren})
      }

      return React.createElement(Component, props, children)
    }

    // Fix images with relative URLs
    if (node.type === 'tag' && node.name === 'img') {
      if (node.attribs && node.attribs.src && node.attribs.src.indexOf('//') < 0) {
        const props = {
          ...generatePropsFromAttributes(node.attribs, index),
          src: baseUrl + node.attribs.src
        }
        return React.createElement('img', props, null)
      }
    }

    // Transform links to .rho files to code examples
    if (node.type === 'tag' && node.name === 'a') {
      if (node.attribs && node.attribs.href && node.attribs.href.indexOf('.rho') > 0) {
        return React.createElement(RemoteCode, {
          key: node.attribs.href,
          href: baseUrl + node.attribs.href
        }, null)
      }
    }

    // Transform any normal (``` ... ```) code examples
    if (node.type === 'tag' && node.name === 'pre') {
      if (node.children && node.children.length === 1 && node.children[0].name === 'code') {
        node = node.children[0]
        convertNodeToElement(node, index, transform)
        const props = {
          ...generatePropsFromAttributes(node.attribs, index),
          isInPre: node.parent && node.parent.name === 'pre'
        }
        const children = node.children && node.children[0] && node.children[0].data
          ? node.children[0].data : null

        return React.createElement(Code, props, children)
      }
    }

    // Exercises (outer  - ul)
    if (node.type === 'tag' && node.name === 'ul') {
      // Reset question ID to something unique, since we're starting
      // a list of (possibly) exercise answers
      questionId = uuid()
    }

    // Excercises (outer - li)
    if (node.type === 'tag' && node.name === 'li' &&
      node.attribs.class && node.attribs.class === 'task-list-item') {
      // This is a <li> tag containing a checkbox and a title
      // Get checkbox checked value and answer title.
      // We don't need to catch the output of this,
      // just let it run and it will set the correct vars.
      answerTitle = []
      processNodes(node.children, transformAnswer)
      // We got a title, so let's output ExerciseAnswer instance
      if (answerTitle && answerTitle.length) {
        return React.createElement(ExerciseAnswer, {
          correct: answerCorrect,
          value: processNodes(answerTitle, transform),
          questionId
        })
      }
    }
  }

  const component = ReactHtmlParser(compiler.makeHtml(source), {transform})

  if (onTOC && !setToc) {
    setToc = true
    setTimeout(() => {
      onTOC(toc)
    }, 10)
  }

  return component
}
