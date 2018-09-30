import React, { Component } from 'react'
import url from 'url'
import _ from 'underscore'

import moment from 'moment-timezone'
import 'moment/locale/ja'

import waves_icon from '../assets/images/waves.png'

moment.locale('ja')

class Articles extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tab: 'reward',
    }
  }
  getTabs() {
    let tabs = {
      reward: { name: 'AHT報酬' },
    }
    if (
      this.props.serverInfo != undefined &&
      this.props.serverInfo.alis != undefined &&
      this.props.userInfo != undefined &&
      this.props.userInfo.missions != undefined &&
      this.props.userInfo.missions.join != undefined &&
      this.props.userInfo.missions.join.confirmed != undefined &&
      this.props.userInfo.missions.join.confirmed != false
    ) {
      tabs['magazin'] = { name: 'ハッカー部マガジンに投稿' }
    }
    let tabs_html = []
    for (let k in tabs) {
      let btn_color = 'secondary'
      if (k === this.state.tab) {
        btn_color = 'primary'
      }
      tabs_html.push(
        <button
          className={`btn m-3 btn-${btn_color}`}
          onClick={() => {
            this.setState({ tab: k }, () => {
              if (k == 'magazin') {
                if (this.props.magazinArticles == undefined) {
                  this.props.auth.listArticles()
                }
              }
            })
          }}
        >
          {tabs[k].name}
        </button>
      )
    }
    tabs_html.push(
      <a className={`btn m-3 btn-orange`} href="/magazines/">
        <i className="fa fa-book-open" />
      </a>
    )
    return tabs_html
  }
  unpublishArticle(article) {
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
        this.props.auth.unpublishArticle(article)
      },
    })
  }
  publishArticle(article) {
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
        this.props.auth.publishArticle(article)
      },
    })
  }

  render() {
    let articles = []
    let articles_html = []
    let tabs_html = this.getTabs()

    if (this.state.tab === 'magazin') {
      for (let article of this.props.magazinArticles || []) {
        let uploadButton
        if (
          this.props.userArticles != undefined &&
          this.props.userArticles[article.article_id] != undefined &&
          this.props.userArticles[article.article_id].admin != undefined
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
                <span className="ml-6">
                  <b className="text-orange">{article.alis_token}</b>
                </span>
              </div>
            </td>
            <td className="text-center">{uploadButton}</td>
          </tr>
        )
        articles_html = (
          <div className="table-responsive">
            <table className="table card-table table-striped table-vcenter">
              <thead>
                <th>ALIS記事</th>
                <th className="text-center" />
              </thead>
              <tbody>{articles}</tbody>
            </table>
          </div>
        )
      }
    } else {
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
        <div className="table-responsive">
          <table className="table card-table table-striped table-vcenter">
            <thead>
              <th>ALIS記事</th>
              <th className="text-center">AHT</th>
            </thead>
            <tbody>{articles}</tbody>
          </table>
        </div>
      )
    }
    return [
      <div className="text-center">{tabs_html}</div>,
      <div className="card">{articles_html}</div>,
    ]
  }
}

export default Articles
