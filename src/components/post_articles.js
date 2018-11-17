import React, { Component } from 'react'
import url from 'url'
import _ from 'underscore'

import moment from 'moment-timezone'
import 'moment/locale/ja'
moment.locale('ja')

class Post_Articles extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let articles_html = []
    let articles = []
    for (let article of this.props.articles || []) {
      articles.push(
        <tr>
          <td>
            <div>
              <a
                href={`https://alis.to/${article.user_id}/articles/${
                  article.article_id
                }`}
                target="_blank"
              >
                <b>{article.title}</b>
              </a>
            </div>
            <div className="text-muted small">
              {moment(article.published_at * 1000).format('YYYY MM/DD HH:mm')}
              <span className="ml-6">
                <b className="text-orange">{article.alis_token}</b> ALIS
              </span>
            </div>
          </td>
          <td className="text-center">
            <div className="text-orange">
              <b>{article.aht}</b>
            </div>
            <div className="text-muted small">AHT</div>
          </td>
        </tr>
      )
    }
    articles_html = (
      <div>
        <div className="table-responsive">
          <table className="table card-table table-striped table-vcenter">
            <thead>
              <th>ALIS記事</th>
              <th className="text-center">AHT</th>
            </thead>
            <tbody>{articles}</tbody>
          </table>
        </div>
      </div>
    )
    return articles_html
  }
}

export default Post_Articles
