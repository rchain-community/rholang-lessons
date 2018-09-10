import axios from 'axios'

const sourceUrl = 'https://raw.githubusercontent.com/JoshOrndorff/LearnRholangByExample/master/1-SendingAndStandardOut/index.md'
const editUrl = 'https://github.com/JoshOrndorff/LearnRholangByExample/blob/master/1-SendingAndStandardOut/index.md'
const baseUrl = 'https://raw.githubusercontent.com/JoshOrndorff/LearnRholangByExample/master/1-SendingAndStandardOut/'

// noinspection JSUnusedGlobalSymbols
export default {
  basePath: '/tutorial-dev/',
  getSiteData: () => ({
    title: 'Rholang Tutorial',
    sourceUrl,
    editUrl
  }),
  getRoutes: async () => {
    const {data: content} = await axios.get(sourceUrl)

    return [
      {
        path: '/',
        component: 'src/containers/Home',
        getData: () => ({content, baseUrl})
      },
      {
        path: '/tutorial-dev',
        component: 'src/containers/Home',
        getData: () => ({content, baseUrl})
      }
    ]
  }
}
