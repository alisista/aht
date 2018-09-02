import React, { Component } from 'react'
import Helmet from 'react-helmet'
import Layout from '../components/layout'
import Footer from '../components/footer'

import url from 'url'

class HTML extends Component {
  constructor(props) {
    super(props)
    console.log(props)
    let redirectedUrl = props.location.href || ''
    const parsedUrl = url.parse(redirectedUrl, true)
    let redirect = null
    let noredirect = false
    if (parsedUrl.query.noredirect == '1') {
      noredirect = true
    }
    if (
      parsedUrl.query.a != undefined &&
      parsedUrl.query.s != undefined &&
      parsedUrl.query.d != undefined &&
      parsedUrl.query.p != undefined
    ) {
      redirect = props.location.origin + '/home/' + props.location.search
    }
    this.state = {
      noredirect: noredirect,
      redirect: redirect,
    }
  }
  componentDidMount() {
    if (this.state.noredirect !== true) {
      setTimeout(() => {
        this.redirect()
      }, 5000)
    }
  }
  render() {
    let user
    let redirect_url = this.state.redirect
    let body
    if (redirect_url === undefined) {
      body = this.render_wrongPage()
    } else {
      body = this.render_oauth(redirect_url)
    }
    let footer_links = [
      { key: 'twitter', href: 'https://twitter.com/alishackers' },
      { key: 'github', href: 'https://github.com/alisista' },
      { key: 'discord', href: 'https://discord.gg/TyKbbrT' },
    ]
    return (
      <Layout>
        <Helmet
          link={[
            {
              rel: 'stylesheet',
              type: 'text/css',
              href: '/tabler/css/tabler.min.css',
            },
            {
              rel: 'stylesheet',
              type: 'text/css',
              href: '/css/common.css',
            },
          ]}
        />

        <div className="page">
          <div className="flax-fill">
            <div className="header py-4">
              <div className="container">
                <div className="d-flex">
                  <a className="header-brand" href="/">
                    ALIS HackerToken
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="my-3 my-md-5">{body}</div>
        <Footer items={footer_links} />
      </Layout>
    )
  }
  render_wrongPage() {
    return (
      <div className="page">
        <div className="page-content">
          <div className="container text-center">
            <div className="display-1 text-muted mb-5">
              <i className="si si-exclamation" /> 404
            </div>

            <h1 className="h2 mb-3">お探しのページは見つかりませんでした。</h1>
            <p className="h4 text-muted font-weight-normal mb-7">
              法定通貨に依存しない完全独自経済圏で好きなことを追求して生きていこう！
            </p>

            <a className="btn btn-primary" href="/">
              <i className="fe fe-arrow-left mr-2" />
              トップページへ戻る
            </a>
          </div>
        </div>
      </div>
    )
  }
  redirect() {
    window.location.href = this.state.redirect
  }
  render_oauth(redirect_url) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="container text-center">
            <div className="display-1 text-muted mb-5">
              <i className="si si-exclamation" /> 認証中
            </div>

            <h1 className="h2 mb-3">
              リダイレクト待ちです。少々お待ち下さい。
            </h1>
            <p className="h4 text-muted font-weight-normal mb-7">
              自動的にリダイレクトされない場合は、下のボタンをクリックして手動で移動して下さい。
            </p>
            <a
              className="btn btn-primary"
              onClick={() => {
                this.redirect()
              }}
              style={{ color: 'white' }}
            >
              <i className="fe fe-arrow-left mr-2" />
              認証を続ける
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default HTML
