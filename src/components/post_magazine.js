import React, { Component } from 'react'
import url from 'url'
import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'
moment.locale('ja')

class Post_Magazine extends Component {
  constructor(props) {
    super(props)
  }
  unpublishArticle(article) {
    let magazine = this.props.magazine || { file_id: 'admin' }
    this.props.showModal({
      title: (
        <div>
          <i className="text-danger fas fa-exclamation-triangle" />{' '}
          取り下げ確認！
        </div>
      ),
      body: (
        <p>
          本当に
          <span className="text-capitalize">『{article.title}』</span>
          を取り下げてよろしいですか？
        </p>
      ),
      cancel_text: 'キャンセル',
      exec_text: '実行',
      exec: () => {
        this.props.auth.unpublishArticle(article, magazine.file_id)
      },
    })
  }
  publishArticle(article) {
    let magazine = this.props.magazine || { file_id: 'admin' }
    this.props.showModal({
      title: (
        <div>
          <i className="text-danger fas fa-exclamation-triangle" /> 投稿確認！
        </div>
      ),
      body: (
        <p>
          本当に
          <span className="text-capitalize">『{article.title}』</span>
          を投稿してよろしいですか？
        </p>
      ),
      cancel_text: 'キャンセル',
      exec_text: '実行',
      exec: () => {
        this.props.auth.publishArticle(article, magazine.file_id)
      },
    })
  }
  isArticleOwner(article, articles_map) {
    return (
      articles_map[article.article_id] != undefined &&
      this.props.serverInfo != undefined &&
      this.props.serverInfo.alis != undefined &&
      article.user_id === this.props.serverInfo.alis.user_id
    )
  }
  isArticleUpdater(article, articles_map) {
    return (
      this.props.user != undefined &&
      articles_map[article.article_id] != undefined &&
      this.props.user.uid === articles_map[article.article_id].uid
    )
  }
  isMagazineOwner() {
    let magazine = this.props.magazine || { file_id: 'admin' }
    return (
      this.props.user != undefined &&
      magazine == undefined &&
      magazine.owner == this.props.user.uid
    )
  }
  render() {
    let magazine = this.props.magazine || { file_id: 'admin' }
    let articles_map = {}
    for (let v of this.props.all_articles || []) {
      articles_map[v.article_id] = v
    }
    let more_btn
    if (this.props.nomore_articles != true) {
      more_btn = (
        <button
          style={{ borderRadius: 0 }}
          className="btn btn-primary"
          onClick={() => {
            this.props.auth.listArticles(this.props.articles_page)
          }}
        >
          さらに読み込み
        </button>
      )
    }
    let articles_html = []
    let articles = []
    for (let article of this.props.magazineArticles || []) {
      let uploadButton
      if (
        (this.props.userArticles != undefined &&
          this.props.userArticles[article.article_id] != undefined &&
          this.props.userArticles[article.article_id][magazine.file_id] !=
            undefined) ||
        (articles_map[article.article_id] != undefined &&
          (articles_map[article.article_id].removed == undefined ||
            articles_map[article.article_id].removed === false))
      ) {
        if (
          magazine.file_id == 'admin' ||
          this.isArticleOwner(article, articles_map) ||
          this.isArticleUpdater(article, articles_map) ||
          this.isMagazineOwner()
        ) {
          uploadButton = (
            <button
              className="btn btn-danger"
              onClick={() => {
                this.unpublishArticle(article)
              }}
            >
              却下
            </button>
          )
        }
      } else {
        uploadButton = (
          <button
            className="btn btn-success"
            onClick={() => {
              this.publishArticle(article)
            }}
          >
            投稿
          </button>
        )
      }
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
              <a
                className="text-muted ml-3"
                href={`https://alis.to/users/${article.user_id}`}
                target="_blank"
              >
                {article.user_id}
              </a>
              <span className="ml-6">
                <b className="text-orange">{article.alis_token}</b>
              </span>
            </div>
          </td>
          <td className="text-center">{uploadButton}</td>
        </tr>
      )
      articles_html = [
        <div className="table-responsive">
          <table className="table card-table table-striped table-vcenter">
            <thead>
              <th>ALIS記事</th>
              <th className="text-center" />
            </thead>
            <tbody>{articles}</tbody>
          </table>
        </div>,
        more_btn,
      ]
    }

    return articles_html
  }
}

export default Post_Magazine
