import React, { Component } from 'react'
import ComponentP from '../components/component_promise'
import Helmet from '../components/helmet'
import Tip from '../lib/tip'
import url from 'url'
import querystring from 'querystring'

import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

import Layout from '../components/layout'
import Footer from '../components/footer'
import Modal from '../components/modal'
import Loading from '../components/loading'
import Header_Home from '../components/header_home'
import Subheader from '../components/subheader'
import Post_Magazine from '../components/post_magazine'
import Issue_Magazine from '../components/issue_magazine'
import Alert from '../components/alert'
import auth from '../lib/auth'
import alerts from '../lib/alerts'
import alis_hackers from '../assets/images/alis_hackers.png'

moment.locale('ja')

class Magazine extends ComponentP {
  constructor(props) {
    super(props)
    let page = (this.params.page || 1) * 1
    let magazine_id = this.params.id || 'top'
    this.state = {
      selected_token: 'aht',
      search_key: '',
      search: 'self',
      tab: 'articles',
      tip: 0,
      page: page,
      magazine_id: magazine_id,
      serverInfo: {},
      userInfo: {},
      modal: {},
      alerts: [],
    }
    this.alerts = new alerts(this, { magazine: true })
    this.tip = new Tip(this)
  }
  is_editor() {
    return (
      this.state.serverInfo != undefined &&
      this.state.serverInfo.alis != undefined &&
      (this.is_admin() ||
        ((this.state.magazine_id !== 'admin' &&
          (this.state.magazine != undefined &&
            this.state.magazine.editors === 'anyone' &&
            this.state.serverInfo != undefined &&
            this.state.serverInfo.alis != undefined)) ||
          (this.state.userInfo != undefined &&
            this.state.userInfo.missions != undefined &&
            this.state.userInfo.missions.join != undefined &&
            this.state.userInfo.missions.join.confirmed != undefined &&
            this.state.userInfo.missions.join.confirmed != false)))
    )
  }
  is_admin() {
    return (
      this.state.magazine_id !== 'admin' &&
      this.state.magazine != undefined &&
      this.state.user != undefined &&
      this.state.magazine.owner === this.state.user.uid
    )
  }
  async getMagazines() {
    let magazine_id = process.env.MAP_ID_MAGAZINES_TOP
    try {
      let map = await this.getJSOND(magazine_id, 'magazines')
      if (map.maps != undefined && map.maps[this.state.page] != undefined) {
        let json = await this.getJSOND(
          map.maps[this.state.page],
          this.state.page
        )
        await this.set({
          magazine_articles: json.magazines,
          len: json.len,
        })
      } else {
        await this.set({ noMagazine: true })
      }
    } catch (e) {
      await this.set({ noMagazine: true })
    }
  }
  async getMagazine_Articles() {
    let magazine_id = process.env.MAP_ID_MAGAZINES
    if (this.state.magazine_id !== 'admin') {
      magazine_id = this.state.magazine_id
    }
    let map
    try {
      map = await this.getJSOND(magazine_id, 'magazines')
      if (
        this.state.magazine_id === 'admin' &&
        map.maps[this.state.magazine_id][this.state.page] != undefined
      ) {
        let json = await this.getJSOND(
          map.maps[this.state.magazine_id][this.state.page],
          this.state.page
        )
        await this.set({ magazine_articles: json.articles, len: json.len })
      } else if (
        map.maps != undefined &&
        map.maps.map[this.state.page] != undefined
      ) {
        let json = await this.getJSOND(
          map.maps.map[this.state.page],
          this.state.page
        )
        await this.set({
          magazine: map.maps,
          magazine_articles: json.articles,
          len: json.len,
        })
        this.checkMagazine()
      } else {
        await this.set({ magazine: map, magazine_articles: [] })
        this.checkMagazine()
      }
    } catch (e) {
      console.log(e)
      await this.set({ noMagazine: true })
    }
  }
  async componentDidMount() {
    this.auth = new auth(this, {})
    if (this.state.magazine_id === 'top') {
      await this.getMagazines()
    } else {
      await this.getMagazine_Articles()
    }
  }
  checkMagazine() {
    if (this.state.user == undefined) {
      setTimeout(() => {
        this.checkMagazine()
      }, 500)
    } else {
      if (this.is_admin()) {
        this.auth.getMagazine()
      }
    }
  }
  componentDidUpdate() {
    window
      .$('.waves-receiver')
      .tooltip({ boundary: 'window', placement: 'right' })
  }

  showModal = config => {
    this.setState({ modal: config }, () => {
      window.$('#pageModal').modal({})
    })
  }
  getMagazineTitle(is_html) {
    let magazine_title = `HACKER's CLUB MAGAZINE`
    if (this.state.magazine_id == 'top') {
      magazine_title = '共同マガジン一覧'
    }
    let img = (
      <img
        src={alis_hackers}
        style={{
          borderRadius: '50%',
          marginRight: '10px',
          height: '35px',
          marginBottom: '6px',
        }}
      />
    )
    if (this.state.magazine != undefined) {
      img = null
      magazine_title = this.state.magazine.title
    }
    if (is_html) {
      magazine_title = [img, <b>{magazine_title}</b>]
    }
    return magazine_title
  }
  getMagazineDescription() {
    let description
    if (this.state.magazine_id == 'top') {
      description = 'ALISISTAの皆さんが発刊した共同マガジンのリストです。'
    } else if (this.state.magazine == undefined) {
      description = 'ハッカー部の公式マガジンです。'
    } else if (this.state.magazine.description != undefined) {
      description = this.state.magazine.description
    }
    return <div className="text-center mb-4">{description}</div>
  }
  async loadArticles() {
    await this.auth.getAllArticles(this.state.magazine_id)
    await this.set({ magazineArticles: [], articles_page: null })
    this.auth.listArticles(this.state.search)
  }
  render() {
    let updated = this.state.updated
    let site_title = 'ALISハッカー部'
    if (process.env.WAVES_NETWORK === 'TESTNET') {
      site_title = 'AHT TESTNET'
    }
    let alerts = this.state.alerts || []
    let alert_html = []
    alerts.forEach((v, i) => {
      alert_html.push(
        <div
          role="alert"
          className={`alert alert-${v.type} ml-3 mr-3`}
          style={{ width: '100%' }}
        >
          <button
            type="button"
            className="close"
            onClick={() => {
              this.alerts.dissmissAlert(i)
            }}
          />
          {v.text}
        </div>
      )
    })
    let nav_links = [
      { name: 'ホーム', href: '/home/' },
      { name: 'トークン', href: '/token/supply/' },
      { name: 'whoami', href: '/whoami/' },
      { name: 'ランキング', href: '/rankings/alis/' },
      { name: 'マガジン', href: '/magazines/' },
    ]
    const nav_links_sub = [{ name: '記事', key: 'articles', icon: 'bookmark' }]
    let subheader
    if (
      this.state.magazine_id != 'top' &&
      !(
        this.state.magazine != undefined &&
        this.state.magazine.deleted != undefined
      ) &&
      (this.is_editor() || this.is_admin())
    ) {
      if (this.is_editor()) {
        nav_links_sub.push({
          name: '投稿',
          key: 'post',
          icon: 'upload',
          func: () => {
            this.loadArticles()
          },
        })
      }
      if (this.is_admin()) {
        nav_links_sub.push({ name: '設定', key: 'settings', icon: 'cogs' })
      }
      subheader = <Subheader items={nav_links_sub} component={this} />
    }

    let body

    if (
      this.state.noMagazine === true ||
      (this.state.magazine != undefined &&
        this.state.magazine.deleted != undefined)
    ) {
      subheader = null
      body = (
        <Loading
          title="マガジンが見つかりませんでした。"
          subtitle="idをお確かめ下さい..."
          btn_text="ハッカー部公式マガジンへ"
          btn_link="/magazines/"
        />
      )
    } else if (this.state.magazine_articles === undefined) {
      body = <Loading />
    } else if (
      this.state.magazine_articles.length === 0 &&
      this.state.tab === 'articles'
    ) {
      body = (
        <Loading
          title={this.state.magazine.title}
          subtitle="このマガジンに記事を投稿してみましょう！"
          btn_text="ハッカー部公式マガジンへ"
          btn_link="/magazines/"
          message={this.state.magazine.description}
          no_message={
            this.state.magazine.description == undefined ||
            this.state.magazine.description === ''
          }
        />
      )
    } else {
      body = this.render_dashboard()
    }
    return (
      <Layout>
        <Helmet title={`${this.getMagazineTitle()} | ${site_title}`} desc="" />
        <Header_Home
          payment={this.state.payment}
          links={nav_links}
          auth={this.auth}
          user={this.state.user}
          serverInfo={this.state.serverInfo}
        />
        {subheader}
        <div className="my-3 my-md-5">
          <div className="container">
            <Alert items={this.state.alerts} alerts={this.alerts} />
            {body}
          </div>
        </div>
        <Modal modal={this.state.modal} />
        <Footer />
      </Layout>
    )
  }
  render_dashboard() {
    if (this.state.tab === 'articles') {
      return this.render_dashboard_articles()
    } else if (this.state.tab === 'post') {
      return this.render_dashboard_post()
    } else {
      return this.render_dashboard_settings()
    }
  }
  render_dashboard_post() {
    let search_targets = [
      { key: `self`, name: `自分`, placeholder: '' },
      { key: `others`, name: `他人`, placeholder: 'ALISユーザーID' },
      { key: `id`, name: `記事ID`, placeholder: '記事ID/URL' },
      { key: `tag`, name: `タグ`, placeholder: 'タグ' },
      { key: `search`, name: `検索`, placeholder: '検索キーワード' },
    ]
    let search_placeholder = {}
    for (let v of search_targets) {
      search_placeholder[v.key] = v
    }
    let search_box
    if (this.state.search !== 'self') {
      search_box = (
        <div style={{ textAlign: 'center' }} className="mb-2">
          <div style={{ maxWidth: '400px', display: 'inline-block' }}>
            <div className="input-group mt-3">
              <input
                type="text"
                className="form-control"
                placeholder={search_placeholder[this.state.search].placeholder}
                value={this.state.search_key}
                onChange={e => {
                  this.setState({ search_key: e.target.value })
                }}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  onClick={() => {
                    this.set({ magazineArticles: [] })
                    this.auth.listArticles()
                  }}
                >
                  検索
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    let search_html = []
    for (let v of search_targets) {
      let btn_color = 'secondary'
      if (this.state.search === v.key) {
        btn_color = 'success'
      }
      search_html.push(
        <button
          type="button"
          className={`btn btn-${btn_color}`}
          onClick={() => {
            this.setState(
              {
                search_key: '',
                magazineArticles: [],
                search: v.key,
                articles_page: null,
              },
              () => {
                if (this.state.search === 'self') {
                  this.auth.listArticles()
                }
              }
            )
          }}
        >
          {v.name}
        </button>
      )
    }
    let card
    if ((this.state.magazineArticles || []).length !== 0) {
      card = (
        <div className="card">
          <Post_Magazine
            user={this.state.user}
            magazine={this.state.magazine}
            all_articles={this.state.all_articles}
            articles_page={this.state.articles_page}
            nomore_articles={this.state.nomore_articles}
            magazine_id={this.state.magazine_id}
            magazineArticles={this.state.magazineArticles}
            userArticles={this.state.userArticles}
            serverInfo={this.state.serverInfo}
            showModal={this.showModal}
            auth={this.auth}
          />
        </div>
      )
    }
    return (
      <div>
        <div className="mb-3" style={{ textAlign: 'center', width: '100%' }}>
          <div
            className="btn-group"
            role="group"
            aria-label="Basic example"
            style={{
              textAlign: 'center',
              width: '100%',
              display: 'inline-block',
            }}
          >
            {search_html}
            {search_box}
          </div>
        </div>
        {card}
      </div>
    )
  }
  render_dashboard_settings() {
    return (
      <Issue_Magazine
        magazine_id={this.state.magazine_id}
        magazine={this.state.magazine}
        user={this.state.user}
        userInfo={this.state.userInfo}
        showModal={this.showModal}
        userMagazines={this.state.userMagazines}
        auth={this.auth}
      />
    )
  }
  drawMagazine(article) {
    let magazine_articles = []
    for (let v of article.articles) {
      console.log(v)
      magazine_articles.push(
        <tr>
          <td className="w-1">
            <a
              target="_blank"
              href={`https://alis.to/users/${v.user_id}`}
              className="avatar"
              style={{ backgroundImage: `url(${v.icon_image_url})` }}
            />
          </td>
          <td className="small">
            <a
              className="text-dark"
              href={`https://alis.to/${v.user_id}/articles/${v.article_id}`}
              target="_blank"
            >
              {v.title}
            </a>
          </td>
        </tr>
      )
    }
    let html = (
      <div className="col-md-6 col-xl-4">
        <div className="card">
          <a
            href={`/magazines/?id=${article.file_id}`}
            style={{
              height: '150px',
              backgroundImage: `url(${article.cover_image ||
                '/img/bg-showcase-4.jpg'})`,
              backgroundSize: 'cover',
            }}
          />
          <div className="card-body d-flex flex-column">
            <h4 style={{ lineHeight: '150%' }}>
              <a href={`/magazines/?id=${article.file_id}`}>{article.title}</a>
            </h4>
            <div className="text-muted" style={{ fontSize: '12px' }}>
              {article.description}
            </div>
          </div>
          <div className="table-responsive">
            <table
              className="table card-table table-sm table-striped table-vcenter"
              style={{ borderTop: '1px solid #dee2e6' }}
            >
              <tbody>{magazine_articles}</tbody>
            </table>
          </div>
        </div>
      </div>
    )
    return html
  }
  deepClone(obj) {
    let cloned = {}
    for (let k in obj) {
      cloned[k] = {}
      for (let k2 in obj[k]) {
        cloned[k][k2] = obj[k][k2]
      }
    }
    return cloned
  }
  drawArticle(article) {
    let tip_others = this.deepClone(article.tip_others || {})
    let last_tip = article.last_tip || 0
    let tip = article.tip || 0
    for (let v of this.state.tip_history || []) {
      if (
        v.article.article_id === article.article_id &&
        last_tip < v.date &&
        this.state.magazine.file_id === (v.magazine_id || 'admin')
      ) {
        if (v.asset == undefined || v.asset === 'aht') {
          tip += v.amount
        } else {
          if (tip_others[v.asset] == undefined) {
            tip_others[v.asset] = { amount: 0, name: v.asset_name || 'unknown' }
          }
          tip_others[v.asset].amount += v.amount
        }
      }
    }
    tip = Math.round(tip * 10) / 10
    let others_html = []
    for (let k in tip_others) {
      let token = tip_others[k]
      let amount = Math.round(token.amount * 10) / 10
      others_html.push(
        <span className="small ml-2 mt-3">
          <span className="text-primary">{amount}</span> {token.name}
        </span>
      )
    }
    let tip_btn
    if (article.notip !== true) {
      tip_btn = (
        <div className="ml-auto text-danger">
          <a
            onClick={() => {
              this.tip.tip(article)
            }}
            className="icon d-inline-block ml-3"
            style={{ fontSize: '20px' }}
          >
            <i className="fa fa-donate mr-1" />{' '}
            <b className="text-primary">{tip}</b>{' '}
            <span style={{ fontSize: '12px' }}>AHT</span>
          </a>
        </div>
      )
    }
    let html = (
      <div className="col-md-6 col-xl-4">
        <div className="card">
          <a
            target="_blank"
            href={`https://alis.to/${article.user_id}/articles/${
              article.article_id
            }/`}
            style={{
              height: '150px',
              backgroundImage: `url(${article.eye_catch_url})`,
              backgroundSize: 'cover',
            }}
          />
          <div className="card-body d-flex flex-column">
            <h4 style={{ lineHeight: '150%' }}>
              <a
                target="_blank"
                href={`https://alis.to/${article.user_id}/articles/${
                  article.article_id
                }/`}
              >
                {article.title}
              </a>
            </h4>
            <div className="text-muted" style={{ fontSize: '12px' }}>
              {article.overview}
              ...
            </div>
            <div className="d-flex align-items-center pt-5 mt-auto">
              <div
                className="avatar avatar-md mr-3"
                style={{ backgroundImage: `url(${article.icon_image_url})` }}
              />
              <div>
                <a
                  target="_blank"
                  href={`https://alis.to/users/${article.user_id}`}
                  className="text-default"
                >
                  {article.user_display_name}
                </a>
                <small className="d-block text-muted">
                  {moment(article.published_at * 1000).format('YYYY MM/DD')}
                </small>
              </div>
              {tip_btn}
            </div>
            <div className="text-muted" style={{ textAlign: 'right' }}>
              {others_html}
            </div>
          </div>
        </div>
      </div>
    )
    return html
  }

  render_dashboard_articles() {
    let pages_html
    let pages = []
    for (let p = 1; p <= Math.ceil(this.state.len / 6); p++) {
      let active = ''
      if (this.state.page === p) {
        pages.push(
          <li className={`page-item active`} style={{ cursor: 'default' }}>
            <span className="page-link" style={{ cursor: 'default' }}>
              {p}
            </span>
          </li>
        )
      } else {
        let id = ''
        if (this.state.magazine_id != undefined) {
          id = `&id=${this.state.magazine_id}`
        }
        pages.push(
          <li className={`page-item`}>
            <a className="page-link" href={`/magazines/?page=${p}${id}`}>
              {p}
            </a>
          </li>
        )
      }
    }
    pages_html = (
      <div className="pt-2 text-center">
        <div className="d-inline-block">
          <ul className="pagination">{pages}</ul>
        </div>
      </div>
    )

    let articles_html = []
    for (let article of this.state.magazine_articles) {
      if (this.state.magazine_id === 'top') {
        articles_html.push(this.drawMagazine(article))
      } else {
        articles_html.push(this.drawArticle(article))
      }
    }
    return (
      <div>
        <h1
          className="page-title"
          style={{
            textAlign: 'center',
            fontFamily: `'Rounded Mplus 1c', 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
          }}
        >
          {this.getMagazineTitle(true)}
        </h1>
        {this.getMagazineDescription()}
        <div className="row row-cards row-deck">{articles_html}</div>
        {pages_html}
      </div>
    )
  }
}

export default Magazine
