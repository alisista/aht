import React, { Component } from 'react'
import Helmet from 'react-helmet'

import url from 'url'
import querystring from 'querystring'

import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

import Layout from './layout'
import Footer from './footer'
import Loading from './loading'
import Header_Home from './header_home'
import image_404 from '../assets/images/404.jpg'
import alis_ico from '../assets/images/alis.ico'
moment.locale('ja')

class Home extends Component {
  constructor(props) {
    super(props)
    let tag
    let map_id = process.env.MAP_ID_ALIS_DAILY
    let map_name = 'alis_daily'
    let redirectedUrl = props.location.href || ''
    let target = props.location.pathname.toLowerCase().split('/')[2]
    const parsedUrl = url.parse(redirectedUrl, true) || { query: {} }
    let conf = {
      name: 'ALIS',
    }
    if (target === 'note') {
      if (parsedUrl.query.tag != undefined) {
        map_id = process.env.MAP_ID_NOTE_TAGS
        tag = parsedUrl.query.tag.toLowerCase()
        map_name = tag
      } else {
        map_name = 'note_daily'
        map_id = process.env.MAP_ID_NOTE_DAILY
      }
      conf = {
        name: 'note',
      }
    }
    let topic = null
    if (parsedUrl.query.topic != undefined) {
      topic = parsedUrl.query.topic.toLowerCase()
    }
    let type = null
    if (parsedUrl.query.type != undefined) {
      type = parsedUrl.query.type.toLowerCase()
    }
    let size = null
    if (parsedUrl.query.size != undefined) {
      size = parsedUrl.query.size.toLowerCase()
    }

    this.state = {
      size: size,
      type: type,
      conf: conf,
      map_id: map_id,
      map_name: map_name,
      latest: null,
      target: target,
      tag: tag,
      topic: topic,
      date: parsedUrl.query.daily,
      existing_dates: [],
    }
  }
  getRanking(map, tag) {
    let ranking_url = `https://dl.dropboxusercontent.com/s/${
      map[tag]
    }/${tag}.json`
    window.$.getJSON(ranking_url, json => {
      this.setState({ articles: json.a })
    })
  }
  getMap() {
    let map_url = `https://dl.dropboxusercontent.com/s/${this.state.map_id}/${
      this.state.map_name
    }.json`
    window.$.getJSON(map_url, json => {
      let tag = this.state.date || this.state.tag
      if (this.state.topic != undefined && this.state.target == 'note') {
        tag += `_${this.state.topic}`
      }
      if (tag == undefined || json[tag] == undefined) {
        if (this.state.target === 'note' && this.state.tag != undefined) {
          window.location.href = `/rankings/note/?tag=alis`
        } else {
          const latest = _(json)
            .chain()
            .keys()
            .sortBy(v => {
              return (
                v
                  .split('_')[0]
                  .split('-')
                  .join('') * -1
              )
            })
            .value()[0]
          if (latest !== undefined) {
            window.location.href = `/rankings/${
              this.state.target
            }/?daily=${latest}`
          }
        }
      } else {
        const latest = _(json)
          .chain()
          .keys()
          .sortBy(v => {
            return (
              v
                .split('_')[0]
                .split('-')
                .join('') * -1
            )
          })
          .value()[0]
        this.setState(
          { existing_dates: _(json).keys(), latest: latest },
          () => {
            this.getRanking(json, tag)
          }
        )
      }
    })
  }
  componentDidMount() {
    this.getMap()
  }
  componentDidUpdate() {}
  makeSectionName() {
    if (this.state.target === 'note' && this.state.tag == 'alis') {
      return (
        <span>
          <a href="https://note.mu/hashtag/alis" target="_blank">
            #ALIS
          </a>{' '}
          <a href="https://alis.to/wine/articles/3k9JOmRnPNE6" target="_blank">
            企画
          </a>{' '}
          <a href="https://alis.to/mammy/articles/a1ZpmeJ1p6gV" target="_blank">
            賞品総額 <b>1500ALIS</b>
          </a>
        </span>
      )
    } else {
      const topic_names = {
        all: '総合',
        crypto: 'クリプト',
        ['illustration-comic']: 'マンガ・イラスト',
        gourmet: 'グルメ',
        gosyuin: '御朱印',
        manga: 'マンガ',
        column: 'コラム',
        novel: '小説',
        photo: '写真',
        music: 'サウンド',
        business: 'ビジネス',
        lifestyle: 'ライフスタイル',
        tech: 'テクノロジー',
        entertainment: 'エンタメ',
      }

      return `${topic_names[this.state.topic || 'all']}部門`
    }
  }
  render() {
    let site_title = 'ALISハッカー部'
    if (process.env.WAVES_NETWORK === 'TESTNET') {
      site_title = 'AHT TESTNET'
    }
    let conf = this.state.conf || {}
    let alerts = this.state.alerts || []
    const date = this.state.date
    let body =
      this.state.articles === undefined ? <Loading /> : this.render_rankings()

    const nav_links = [
      { name: 'ホーム', href: '/home/' },
      { name: 'トークン', href: '/token/supply/' },
      { name: 'whoami', href: '/whoami/' },
      { name: 'ランキング', href: '/rankings/alis/' },
      { name: 'マガジン', href: '/magazines/' },
    ]
    let topics = [
      { key: null, name: '総合', icon: 'font' },
      { key: 'crypto', name: 'クリプト', icon: 'ethereum', fa_type: 'fab' },
      {
        key: 'illustration-comic',
        name: 'マンガ・イラスト',
        icon: 'smile',
      },
      { key: 'business', name: 'ビジネス', icon: 'user-tie' },
      { key: 'gourmet', name: 'グルメ', icon: 'birthday-cake' },
      { key: 'gosyuin', name: '御朱印', icon: 'cannabis' },
    ]
    if (this.state.target == 'note') {
      topics = [
        { key: null, name: '総合' },
        { key: 'manga', name: 'マンガ' },
        { key: 'column', name: 'コラム' },
        { key: 'novel', name: '小説' },
        { key: 'photo', name: '写真' },
        { key: 'music', name: 'サウンド' },
        { key: 'business', name: 'ビジネス' },
        {
          key: 'lifestyle',
          name: 'ライフスタイル',
        },
        {
          key: 'tech',
          name: 'テクノロジー',
        },
        { key: 'entertainment', name: 'エンタメ' },
        { key: 'alis', name: '#ALIS', tag: true },
      ]
    }
    let topics_html = []
    if (this.state.date != undefined || this.state.tag === 'alis') {
      for (let v of topics) {
        let active = ''
        if (this.state.topic == v.key) {
          active = 'active'
        }
        let topic = ''
        if (v.key != null) {
          topic = '&topic=' + v.key
        }
        let topic_icon
        if (v.icon != undefined) {
          topic_icon = <i className={`${v.fa_type || 'fa'} fa-${v.icon}`} />
        }
        let href = `/rankings/${this.state.target}/?daily=${this.state.date ||
          '2018-09-14'}${topic}`
        if (v.tag === true) {
          href = `/rankings/${this.state.target}/?tag=${v.key}`
        }
        topics_html.push(
          <li className="nav-item" key={`topic-${v.key || 'all'}`}>
            <a href={href} className={`nav-link ${active}`}>
              {topic_icon} {v.name}
            </a>
          </li>
        )
      }
    }
    let navigation_btns = []
    const day_before = moment(this.state.date)
      .add(-1, 'day')
      .format('YYYY-MM-DD')
    const day_after = moment(this.state.date)
      .add(1, 'day')
      .format('YYYY-MM-DD')
    if (this.state.target === 'note' && this.state.tag != undefined) {
      navigation_btns.push(<div />)
    } else if (this.state.existing_dates.includes(day_before)) {
      navigation_btns.push(
        <a
          className="btn btn-primary text-light"
          href={`/rankings/${this.state.target}/?daily=${day_before}`}
        >
          <i className="fa fa-arrow-circle-left mr-2" />
          {moment(this.state.date)
            .add(-1, 'day')
            .format('M月D日')}
        </a>
      )
    } else {
      navigation_btns.push(
        <a className="btn btn-gray" style={{ cursor: 'default' }}>
          <i className="fa fa-arrow-circle-left mr-2" />
          {moment(this.state.date)
            .add(-1, 'day')
            .format('M月D日')}
        </a>
      )
    }

    navigation_btns.push(
      <h1
        className="d-none d-md-inline-block page-title"
        style={{ fontSize: '18px' }}
      >
        {conf.name}
        ランキング
        <i className="fa fa-angle-double-right ml-3 mr-3" />
        {this.makeSectionName()}
      </h1>
    )
    if (this.state.target === 'note' && this.state.tag != undefined) {
      navigation_btns.push(<div />)
    } else if (this.state.existing_dates.includes(day_after)) {
      navigation_btns.push(
        <a
          className="btn btn-primary text-light"
          href={`/rankings/${this.state.target}/?daily=${day_after}`}
        >
          {moment(this.state.date)
            .add(1, 'day')
            .format('M月D日')}
          <i className="fa fa-arrow-circle-right ml-2" />
        </a>
      )
    } else {
      navigation_btns.push(
        <a className="btn btn-gray" style={{ cursor: 'default' }}>
          {moment(this.state.date)
            .add(1, 'day')
            .format('M月D日')}
          <i className="fa fa-arrow-circle-right ml-2" />
        </a>
      )
    }
    let meta = []
    const title = `${conf.name}デイリーランキング ${moment(
      this.state.date
    ).format('M月D日（ddd）')}| ${site_title}`
    const desc = `${moment(this.state.ndate).format(
      'YYYY年 MM月DD日 （ddd）'
    )}にTwitterで話題になった${conf.name}記事のランキングです。`

    if (this.state.img != undefined) {
      meta.push({ name: 'twitter:card', content: 'summary_large_image' })
      meta.push({ name: 'twitter:site', content: '@alishackers' })
      meta.push({
        name: 'twitter:image',
        content: image_404,
      })
      meta.push({ name: 'twitter:description', content: desc })
      meta.push({ name: 'twitter:title', content: title })
    }

    return (
      <Layout>
        <Helmet
          meta={meta}
          title={title}
          link={[
            {
              rel: 'stylesheet',
              type: 'text/css',
              href: '/tabler/css/tabler.min.css',
            },
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
        <Header_Home links={nav_links} />
        <div className="header collapse d-lg-flex p-0" id="headerMenuCollapse">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg order-lg-first">
                <ul className="nav nav-tabs border-0 flex-column flex-lg-row">
                  {topics_html}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="my-3 my-md-5">
          <div className="container">
            <div className="page-header">
              <div className="d-block d-md-none" style={{ width: '100%' }}>
                <h1 className="page-title" style={{ fontSize: '18px' }}>
                  {conf.name}
                  ランキング
                  <i className="fa fa-angle-double-right ml-3 mr-3" />
                  {this.makeSectionName()}
                </h1>
              </div>
              <div
                className="d-flex justify-content-between mt-2"
                style={{ width: '100%' }}
              >
                {navigation_btns}
              </div>
            </div>
            {body}
            <div
              className="d-flex justify-content-between mt-2 mb-6"
              style={{ width: '100%' }}
            >
              {navigation_btns}
            </div>
          </div>
        </div>
        <Footer />
      </Layout>
    )
  }
  makeProfileImageURL(article) {
    if (this.state.target === 'note') {
      return article.p
    } else {
      if (article.p == undefined || article.p == '') {
        return `https://alis.to/d/nuxt/dist/img/icon_user_noimg.d5f3940.png`
      } else {
        return `https://alis.to/d/api/info_icon/${article.u}/icon/${article.p}`
      }
    }
  }
  makeArticleURL(article) {
    if (this.state.target === 'note') {
      return `https://note.mu/${article.u}/n/${article.i}`
    } else {
      return `https://alis.to/${article.u}/articles/${article.i}`
    }
  }
  makeUserURL(article) {
    if (this.state.target === 'note') {
      return `https://note.mu/${article.u}`
    } else {
      return `https://alis.to/users/${article.u}`
    }
  }
  makePeriod() {
    if (this.state.target === 'note' && this.state.tag != undefined) {
      return `9/8 - 9/19 最終結果！`
    } else {
      return moment(this.state.date).format('M月D日 （ddd）')
    }
  }

  render_rankings() {
    let articles = this.state.articles
    if (this.state.topic != undefined && this.state.target == 'alis') {
      articles = _(articles).filter(v => {
        return v.g == this.state.topic
      })
      let last_rank = null
      let pool = 0
      let rank = 0
      for (const article of articles) {
        if (last_rank == null || last_rank != article.r) {
          rank += 1 + pool
          pool = 0
        } else {
          pool += 1
        }
        last_rank = article.r
        article.r = rank
      }
    }
    if (this.state.type === 'image') {
      return this.drawImage(articles)
    } else {
      return this.drawArticles(articles)
    }
  }

  drawPrice(articles) {
    let ranking_table = []
    let rankers = {}
    let runnerups = []
    let index = 0
    let prizes = [200, 150, 120, 80, 80]
    for (let article of articles) {
      if (this.state.tag === 'alis' && this.state.target === 'note') {
        if (rankers[article.u] == undefined) {
          rankers[article.u] = {
            prizes: [],
            prize_total: 0,
            length: 0,
            points: 0,
            name: article.n,
            user_id: article.u,
            photo: article.p,
            n: article.n,
            u: article.u,
            p: article.p,
          }
        }
        rankers[article.u].points += article.cp
        rankers[article.u].length += 1
        if (index < 5) {
          rankers[article.u].prize_total += prizes[index]
          rankers[article.u].prizes.push({
            amount: prizes[index],
            title: `単体${index + 1}位`,
          })
        }
      }
      let points_color = 'blue'
      if (article.cp === 0) {
        points_color = 'gray'
      } else if (article.cp >= 100) {
        points_color = 'red'
      } else if (article.cp >= 100) {
        points_color = 'orange'
      } else if (article.cp >= 10) {
        points_color = 'green'
      }
      let rank_color = `dark`
      if (article.r == 1) {
        rank_color = `green`
      } else if (article.r == 2) {
        rank_color = `pink`
      } else if (article.r == 3) {
        rank_color = `orange`
      } else if (article.r == 4) {
        rank_color = `purple`
      } else if (article.r <= 5) {
        rank_color = `azure`
      }
      let topic, topic_small, price, date
      if (this.state.tag != undefined) {
        date = (
          <span className="d-inline-block mr-2">
            <i className="far fa-calendar mr-1 text-muted" />
            {moment(article.d).format('MM/DD')}
          </span>
        )
      }
      if (article.m != undefined) {
        price = (
          <div className="d-none d-md-inline-block" style={{ width: '80px' }}>
            <span className={`badge badge-default bg-teal text-light`}>
              {article.m} 円
            </span>
          </div>
        )
      }
      if (index < 5) {
        ranking_table.push(
          <tr>
            <td className="text-center w-1">
              <a
                href={this.makeArticleURL(article)}
                target="_blank"
                className="avatar d-md-none d-inline-block"
                title={this.makeArticleURL(article)}
                style={{
                  backgroundImage: `url(${this.makeProfileImageURL(article)})`,
                }}
              />

              <span
                className={`d-none d-md-inline-block text-center avatar avatar-${rank_color}`}
              >
                {article.r}
              </span>
              {topic}
            </td>
            <td style={{ paddingLeft: '20px', paddingRight: '20px' }}>
              <div className="mb-1">
                <b className="text-warning d-inline-block d-md-none mr-2">
                  {article.r}.
                </b>
                <a
                  href={this.makeArticleURL(article)}
                  className="font-weight-bold"
                  target="_blank"
                  style={{ color: '#858dda' }}
                >
                  {article.t}
                </a>
              </div>
            </td>
            <td className="d-none d-md-table-cell text-center">
              <a
                href={this.makeUserURL(article)}
                target="_blank"
                className="avatar d-block"
                title={article.n}
                style={{
                  backgroundImage: `url(${this.makeProfileImageURL(article)})`,
                }}
              />
            </td>
            <td className="d-none d-md-table-cell">
              <div>
                <a
                  href={this.makeUserURL(article)}
                  target="_blank"
                  className="text-dark"
                >
                  {article.n}
                </a>
              </div>
              <div className="small text-muted">
                <a
                  href={this.makeUserURL(article)}
                  target="_blank"
                  className="text-muted"
                >
                  {article.u}
                </a>
              </div>
            </td>
            <td className="d-none d-md-table-cell">
              <div>
                <span
                  className={`stamp stamp-sm`}
                  style={{ width: '100%', backgroundColor: '#41C9B3' }}
                >
                  {article.cp}
                </span>
              </div>
            </td>
          </tr>
        )
      } else if (index < 20) {
        runnerups.push(
          <a
            href={this.makeUserURL(article)}
            target="_blank"
            className="avatar d-inline-block m-2"
            title={article.n}
            style={{
              border: '1px solid #ccc',
              backgroundImage: `url(${this.makeProfileImageURL(article)})`,
            }}
          />
        )
      }
      index++
    }
    const top_rankers = this.drawRankersImage(rankers)
    const prize_holders = this.drawPrizeHolders(rankers)
    let size = 900
    let desc =
      'ポイントはツイッターの 『リンク付ツイート数 + リツイート数 + いいね数』 の合計で計算しています'
    if (this.state.size === 'small') {
      size = 640
      desc =
        'ツイッターの 『リンク付ツイート数 + リツイート数 + いいね数』 の合計で計算'
    }
    return (
      <div className="text-center pb-5">
        <div
          id="ranking-image"
          className="card text-left d-inline-block m-0"
          style={{
            borderRadius: 0,
            border: 'none',
            width: `${size}px`,
            backgroundColor: '#41C9B3',
            color: 'white',
          }}
        >
          <div
            className="card-header text-center mt-2"
            style={{ display: 'block' }}
          >
            <h1
              className="card-title d-inline-block"
              style={{ fontSize: '28px' }}
            >
              <img
                src={alis_ico}
                style={{
                  marginRight: '15px',
                  height: '40px',
                  marginBottom: '4px',
                  verticalAlign: 'middle',
                }}
              />
              ALIS x note 企画
              <i className="fa fa-angle-double-right ml-3 mr-3" />
              最終結果！
            </h1>
            <div className="mt-2 mb-2" style={{ color: '#333' }}>
              {desc}
            </div>
          </div>
          <div
            className="table-responsive"
            style={{ backgroundColor: 'white' }}
          >
            <table className="table table-sm table-hover table-outline table-vcenter card-table">
              <thead
                style={{
                  backgroundColor: '#05051E',
                  textAlign: 'center',
                  borderBottom: '20px solid white',
                }}
              >
                <tr>
                  <th
                    style={{
                      backgroundColor: '#858dda',
                      color: 'white',
                      fontSize: '20px',
                    }}
                    colSpan="1000"
                  >
                    単体記事 部門 トップ５
                  </th>
                </tr>
              </thead>
              <tbody>{ranking_table}</tbody>
              <thead
                style={{
                  backgroundColor: '#05051E',
                  textAlign: 'center',
                  borderBottom: '20px solid white',
                  borderTop: '20px solid white',
                }}
              >
                <tr>
                  <th
                    style={{
                      backgroundColor: '#858dda',
                      color: 'white',
                      fontSize: '20px',
                    }}
                    colSpan="1000"
                  >
                    総合ポイント 部門 トップ５
                  </th>
                </tr>
              </thead>
              <tbody>{top_rankers}</tbody>
              <thead
                style={{
                  backgroundColor: '#05051E',
                  textAlign: 'center',
                  borderBottom: '20px solid white',
                  borderTop: '20px solid white',
                }}
              >
                <tr>
                  <th
                    style={{
                      backgroundColor: '#858dda',
                      color: 'white',
                      fontSize: '20px',
                    }}
                    colSpan="1000"
                  >
                    <i className="fa fa-medal" /> 獲得賞品{' '}
                    <i className="fa fa-angle-double-right ml-3 mr-3" /> 総額
                    1500 ALIS + AHT + 副賞
                  </th>
                </tr>
              </thead>
              <tbody>{prize_holders}</tbody>
            </table>
          </div>
          <div
            className="card-footer text-center"
            style={{
              display: 'block',
              borderTop: '20px solid white',
              backgroundColor: '#41C9B3',
            }}
          >
            <div style={{ fontSize: '28px', color: 'white' }}>
              <b>9月8日 19:00　～　9月18日 24:00</b>
            </div>
            <div style={{ color: '#333' }}>
              ワインさん発案 / ALISグロースハッキング部主催
            </div>
          </div>
        </div>
      </div>
    )
  }
  drawImage(articles) {
    if (this.state.target === 'note' && this.state.tag === 'alis') {
      return this.drawPrice(articles)
    } else {
      return this.drawRankingImage(articles)
    }
  }
  drawRankingImage(articles) {
    let ranking_table = []
    let topics = {
      crypto: { name: 'クリプト', color: `success` },
      gourmet: { name: 'グルメ', color: `primary` },
      gosyuin: { name: '御朱印', color: `danger` },
      manga: { name: 'マンガ', color: `success` },
      column: { name: 'コラム', color: `primary` },
      novel: { name: '小説', color: `warning` },
      photo: { name: '写真', color: `info` },
      music: { name: 'サウンド', color: `success` },
      business: { name: 'ビジネス', color: `primary` },
      lifestyle: { name: 'ライフスタイル', color: `info` },
      tech: { name: 'テクノロジー', color: `danger` },
      entertainment: { name: 'エンタメ', color: `success` },
    }
    let rankers = {}
    let runnerups = []
    let index = 0
    for (let article of articles) {
      if (article.g != undefined && topics[article.g] == undefined) {
        topics[article.g] = { name: article.g, color: `info` }
      }
      if (this.state.tag === 'alis' && this.state.target === 'note') {
        if (rankers[article.u] == undefined) {
          rankers[article.u] = {
            length: 0,
            points: 0,
            name: article.n,
            user_id: article.u,
            photo: article.p,
          }
        }
        rankers[article.u].points += article.cp
        rankers[article.u].length += 1
      }
      let points_color = 'blue'
      if (article.cp === 0) {
        points_color = 'gray'
      } else if (article.cp >= 100) {
        points_color = 'red'
      } else if (article.cp >= 100) {
        points_color = 'orange'
      } else if (article.cp >= 10) {
        points_color = 'green'
      }
      let rank_color = `dark`
      if (article.r == 1) {
        rank_color = `green`
      } else if (article.r == 2) {
        rank_color = `pink`
      } else if (article.r == 3) {
        rank_color = `orange`
      } else if (article.r == 4) {
        rank_color = `purple`
      } else if (article.r <= 5) {
        rank_color = `azure`
      }
      let topic, topic_small, price, date
      if (this.state.tag != undefined) {
        date = (
          <span className="d-inline-block mr-2">
            <i className="far fa-calendar mr-1 text-muted" />
            {moment(article.d).format('MM/DD')}
          </span>
        )
      }
      if (article.m != undefined) {
        price = (
          <div className="d-none d-md-inline-block" style={{ width: '80px' }}>
            <span className={`badge badge-default bg-teal text-light`}>
              {article.m} 円
            </span>
          </div>
        )
      }
      if (this.state.tag !== 'alis' && article.g != undefined) {
        topic = (
          <div className="d-none mt-2">
            <span className={`badge badge-${topics[article.g].color}`}>
              {topics[article.g].name}
            </span>
          </div>
        )
      }
      if (index < 5) {
        ranking_table.push(
          <tr>
            <td className="text-center w-1">
              <a
                href={this.makeArticleURL(article)}
                target="_blank"
                className="avatar d-md-none d-inline-block"
                title={this.makeArticleURL(article)}
                style={{
                  backgroundImage: `url(${this.makeProfileImageURL(article)})`,
                }}
              />

              <span
                className={`d-none d-md-inline-block text-center avatar avatar-${rank_color}`}
              >
                {article.r}
              </span>
              {topic}
            </td>
            <td>
              <div className="mb-1">
                <b className="text-warning d-inline-block d-md-none mr-2">
                  {article.r}.
                </b>
                <a
                  href={this.makeArticleURL(article)}
                  className="text-info font-weight-bold"
                  target="_blank"
                >
                  {article.t}
                </a>
              </div>
            </td>
            <td className="d-none d-md-table-cell text-center">
              <a
                href={this.makeUserURL(article)}
                target="_blank"
                className="avatar d-block"
                title={article.n}
                style={{
                  backgroundImage: `url(${this.makeProfileImageURL(article)})`,
                }}
              />
            </td>
            <td className="d-none d-md-table-cell">
              <div>
                <a
                  href={this.makeUserURL(article)}
                  target="_blank"
                  className="text-dark"
                >
                  {article.n}
                </a>
              </div>
              <div className="small text-muted">
                <a
                  href={this.makeUserURL(article)}
                  target="_blank"
                  className="text-muted"
                >
                  {article.u}
                </a>
              </div>
            </td>
            <td className="d-none d-md-table-cell w-1">
              <div>
                <span
                  className={`stamp stamp-sm bg-${points_color}`}
                  style={{ width: '60px' }}
                >
                  {article.cp}
                </span>
              </div>
            </td>
          </tr>
        )
      } else if (index < 20) {
        runnerups.push(
          <a
            href={this.makeUserURL(article)}
            target="_blank"
            className="avatar d-inline-block m-2"
            title={article.n}
            style={{
              border: '1px solid #ccc',
              backgroundImage: `url(${this.makeProfileImageURL(article)})`,
            }}
          />
        )
      }
      index++
    }
    ranking_table.push(
      <tr>
        <td />
        <td colSpan="3" className="text-center pt-3 pb-3 pl-0 pr-5">
          <div className="d-inline-block">{runnerups}</div>
        </td>
        <td className="d-none d-md-table-cell w-1">
          <div>
            <span
              className={`stamp stamp-sm bg-orange`}
              style={{ width: '60px' }}
            >
              次点
            </span>
          </div>
        </td>
      </tr>
    )
    let type = 'ALIS'
    if (this.state.target == 'note') {
      type = 'note'
    }
    const topic_names = {
      all: '総合',
      crypto: 'クリプト',
      gourmet: 'グルメ',
      gosyuin: '御朱印',
      manga: 'マンガ',
      column: 'コラム',
      novel: '小説',
      photo: '写真',
      music: 'サウンド',
      business: 'ビジネス',
      lifestyle: 'ライフスタイル',
      tech: 'テクノロジー',
      entertainment: 'エンタメ',
    }

    let topic = topic_names[this.state.topic || 'all']
    let colors = {
      subheader: 'crimson',
      footer_text: '#333',
      header: '#41C9B3',
    }
    if (this.state.target !== 'note') {
      colors = {
        subheader: '#f1c40f',
        footer_text: '#9aa0ac',
        header: '#333',
      }
    }
    return (
      <div className="text-center pb-5">
        <div
          id="ranking-image"
          className="card text-left d-inline-block m-0"
          style={{
            borderRadius: 0,
            border: 'none',
            width: '900px',
            backgroundColor: colors.header,
            color: 'white',
          }}
        >
          <div
            className="card-header text-center mt-2"
            style={{ display: 'block', borderBottom: '15px solid white' }}
          >
            <h1
              className="card-title d-inline-block"
              style={{ fontSize: '28px' }}
            >
              デイリー
              {type}
              ランキング
              <i className="fa fa-angle-double-right ml-3 mr-3" />
              {topic}
              部門
            </h1>
            <div className="mt-2 mb-2" style={{ color: colors.subheader }}>
              『リンク付ツイート数 + リツイート数 + いいね数』
              をポイントにしたランキングです
            </div>
          </div>
          <div
            className="table-responsive"
            style={{ backgroundColor: 'white' }}
          >
            <table className="table table-sm table-hover table-outline table-vcenter card-table">
              <tbody>{ranking_table}</tbody>
            </table>
          </div>
          <div className="card-footer text-center" style={{ display: 'block' }}>
            <div style={{ fontSize: '28px', color: 'white' }}>
              <b>{moment(this.state.date).format('YYYY年 M月D日 (ddd)')}</b>
            </div>
            <div style={{ color: colors.footer_text }}>
              presented by ALISハッカー部
            </div>
          </div>
        </div>
      </div>
    )
  }

  drawArticles(articles) {
    let ranking_table = []
    let topics = {
      crypto: { name: 'クリプト', color: `success` },
      gourmet: { name: 'グルメ', color: `primary` },
      gosyuin: { name: '御朱印', color: `danger` },
      manga: { name: 'マンガ', color: `success` },
      column: { name: 'コラム', color: `primary` },
      [`illustration-comic`]: { name: `イラスト・マンガ`, color: 'warning' },
      novel: { name: '小説', color: `warning` },
      photo: { name: '写真', color: `info` },
      music: { name: 'サウンド', color: `success` },
      business: { name: 'ビジネス', color: `info` },
      lifestyle: { name: 'ライフスタイル', color: `primary` },
      tech: { name: 'テクノロジー', color: `danger` },
      entertainment: { name: 'エンタメ', color: `success` },
    }
    let rankers = {}
    for (let article of articles) {
      if (article.g != undefined && topics[article.g] == undefined) {
        topics[article.g] = { name: article.g, color: `info` }
      }

      if (this.state.tag === 'alis' && this.state.target === 'note') {
        if (rankers[article.u] == undefined) {
          rankers[article.u] = {
            length: 0,
            points: 0,
            name: article.n,
            user_id: article.u,
            photo: article.p,
          }
        }
        rankers[article.u].points += article.cp
        rankers[article.u].length += 1
      }
      let points_color = 'blue'
      if (article.cp === 0) {
        points_color = 'gray'
      } else if (article.cp >= 100) {
        points_color = 'red'
      } else if (article.cp >= 100) {
        points_color = 'orange'
      } else if (article.cp >= 10) {
        points_color = 'green'
      }
      let rank_color = `dark`
      if (article.r == 1) {
        rank_color = `green`
      } else if (article.r == 2) {
        rank_color = `pink`
      } else if (article.r == 3) {
        rank_color = `orange`
      } else if (article.r <= 5) {
        rank_color = `azure`
      }
      let topic, topic_small, price, date
      if (this.state.tag != undefined) {
        date = (
          <span className="d-inline-block mr-2">
            <i className="far fa-calendar mr-1 text-muted" />
            {moment(article.d).format('MM/DD')}
          </span>
        )
      }
      if (article.m != undefined) {
        price = (
          <div className="d-none d-md-inline-block" style={{ width: '80px' }}>
            <span className={`badge badge-default bg-teal text-light`}>
              {article.m} 円
            </span>
          </div>
        )
      }
      if (this.state.tag !== 'alis' && article.g != undefined) {
        topic = (
          <div className="d-block d-md-none mt-2">
            <span className={`badge badge-${topics[article.g].color}`}>
              {topics[article.g].name}
            </span>
          </div>
        )
        topic_small = (
          <div className="d-none d-md-inline-block" style={{ width: '80px' }}>
            <span className={`badge badge-${topics[article.g].color}`}>
              {topics[article.g].name}
            </span>
          </div>
        )
      }
      ranking_table.push(
        <tr>
          <td className="text-center w-1">
            <a
              href={this.makeArticleURL(article)}
              target="_blank"
              className="avatar d-md-none d-inline-block"
              title={this.makeArticleURL(article)}
              style={{
                backgroundImage: `url(${this.makeProfileImageURL(article)})`,
              }}
            />

            <span
              className={`d-none d-md-inline-block text-center avatar avatar-${rank_color}`}
            >
              {article.r}
            </span>
            {topic}
          </td>
          <td>
            <div className="mb-1">
              <b className="text-warning d-inline-block d-md-none mr-2">
                {article.r}.
              </b>
              <a
                href={this.makeArticleURL(article)}
                className="text-info font-weight-bold"
                target="_blank"
              >
                {article.t}
              </a>
            </div>
            <div className="small text-muted">
              {topic_small}
              <div className="d-inline-block" style={{ width: '200px' }}>
                <span className="d-inline-block mr-2">
                  <i className="fa fa-comment mr-1 text-primary" />
                  {article.ct}
                </span>
                <span className="d-inline-block mr-2">
                  <i className="fa fa-retweet mr-1 text-success" />
                  {article.cr}
                </span>
                <span className="d-inline-block mr-2">
                  <i className="fa fa-heart mr-1 text-danger" />
                  {article.cl}
                </span>
                <span className="d-inline-block d-md-none ml-5">
                  <i className="fa fa-fire mr-1 text-warning" />
                  {article.cp}
                </span>
                {price}
                {date}
              </div>
            </div>
          </td>
          <td className="d-none d-md-table-cell text-center">
            <a
              href={this.makeUserURL(article)}
              target="_blank"
              className="avatar d-block"
              title={article.n}
              style={{
                backgroundImage: `url(${this.makeProfileImageURL(article)})`,
              }}
            />
          </td>
          <td className="d-none d-md-table-cell">
            <div>
              <a
                href={this.makeUserURL(article)}
                target="_blank"
                className="text-dark"
              >
                {article.n}
              </a>
            </div>
            <div className="small text-muted">
              <a
                href={this.makeUserURL(article)}
                target="_blank"
                className="text-muted"
              >
                {article.u}
              </a>
            </div>
          </td>
          <td className="d-none d-md-table-cell w-1">
            <div>
              <span
                className={`stamp stamp-sm bg-${points_color}`}
                style={{ width: '60px' }}
              >
                {article.cp}
              </span>
            </div>
          </td>
        </tr>
      )
    }
    const top_rankers = this.drawRankers(rankers)
    return [
      top_rankers,
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover table-outline table-vcenter card-table">
            <thead>
              <th className="text-center" style={{ paddingLeft: '1.5rem' }} />
              <th className="text-danger">
                {this.makePeriod()}{' '}
                <span className="ml-2">{articles.length} 記事</span>
              </th>
              <th className="d-none d-md-table-cell" />
              <th className="d-none d-md-table-cell">ユーザー</th>
              <th
                className="d-none d-md-table-cell text-center"
                style={{ paddingRight: '1.5rem' }}
              >
                ポイント
              </th>
            </thead>
            <tbody>{ranking_table}</tbody>
          </table>
        </div>
      </div>,
    ]
  }
  drawRankers(rankers) {
    let top_rankers
    if (this.state.tag === 'alis' && this.state.target === 'note') {
      let rankers_array = []
      for (let k in rankers) {
        rankers_array.push(rankers[k])
      }
      rankers_array = _(rankers_array).sortBy(v => {
        return v.points * -1
      })
      let rankers_html = []
      let rank = 0
      for (let v of rankers_array) {
        rank += 1
        rankers_html.push(
          <div className="col-sm-6 col-lg-3">
            <div className="card p-3">
              <div className="d-flex align-items-center">
                <a
                  href={`https://note.mu/${v.user_id}`}
                  target="_blank"
                  className="avatar d-block mr-3"
                  title={v.name}
                  style={{
                    backgroundImage: `url(${v.photo})`,
                  }}
                />
                <div>
                  <h4 className="m-0">
                    <span className="text-muted">
                      {`{`}
                      {rank}
                      {`}`}
                    </span>{' '}
                    <span>
                      <span className="text-success">{v.points}</span> 点
                    </span>
                  </h4>
                  <small className="text-muted">{v.name}</small>
                </div>
              </div>
            </div>
          </div>
        )
      }
      top_rankers = <div className="row">{rankers_html}</div>
    }
    return top_rankers
  }
  drawRankersImage(rankers) {
    let top_rankers
    if (this.state.tag === 'alis' && this.state.target === 'note') {
      let rankers_array = []
      for (let k in rankers) {
        rankers_array.push(rankers[k])
      }
      rankers_array = _(rankers_array).sortBy(v => {
        return v.points * -1
      })
      let rankers_html = []
      let rank = 0
      let prizes = [200, 150, 120, 80, 80]
      for (let v of rankers_array) {
        if (rank >= 5) {
          continue
        }
        if (rank < 5) {
          rankers[v.u].prize_total += prizes[rank]
          rankers[v.u].prizes.push({
            amount: prizes[rank],
            title: `総合${rank + 1}位`,
          })
        }
        rank += 1
        let points_color = 'blue'
        if (v.points === 0) {
          points_color = 'gray'
        } else if (v.points >= 100) {
          points_color = 'red'
        } else if (v.points >= 100) {
          points_color = 'orange'
        } else if (v.points >= 10) {
          points_color = 'green'
        }
        let rank_color = `dark`
        if (rank == 1) {
          rank_color = `green`
        } else if (rank == 2) {
          rank_color = `pink`
        } else if (rank == 3) {
          rank_color = `orange`
        } else if (rank == 4) {
          rank_color = `purple`
        } else if (rank <= 5) {
          rank_color = `azure`
        }
        let user_width = 250
        let average = (
          <span>
            <b
              style={{
                color: '#858dda',

                fontSize: '20px',
                display: 'inline-block',
                width: '50px',
                textAlign: 'right',
                marginRight: '20px',
              }}
            >
              {Math.round(v.points / v.length)}
            </b>{' '}
            平均ポイント / 記事
          </span>
        )
        let avr_margin = '30px'
        let avr_margin2 = '20px'
        if (this.state.size === 'small') {
          avr_margin = '5px'
          avr_margin2 = '5px'
          user_width = 155
          average = (
            <span>
              <b
                style={{
                  color: '#858dda',
                  fontSize: '20px',
                  display: 'inline-block',
                  width: '50px',
                  textAlign: 'right',
                  marginRight: '5px',
                }}
              >
                {Math.round(v.points / v.length)}
              </b>{' '}
              平均 pt.
            </span>
          )
        }
        rankers_html.push(
          <tr>
            <td className="text-center w-1">
              <a
                href={this.makeArticleURL(v)}
                target="_blank"
                className="avatar d-md-none d-inline-block"
                title={this.makeArticleURL(v)}
                style={{
                  backgroundImage: `url(${this.makeProfileImageURL(v)})`,
                }}
              />

              <span
                className={`d-none d-md-inline-block text-center avatar avatar-${rank_color}`}
              >
                {rank}
              </span>
            </td>
            <td style={{ paddingLeft: '20px', paddingLeft: '20px' }}>
              <div className="mb-1">
                <a className="text-muted">
                  <span
                    style={{
                      marginRight: avr_margin,
                      width: '100px',
                      display: 'inline-block',
                    }}
                  >
                    <b
                      style={{
                        color: '#858dda',
                        fontSize: '20px',
                        display: 'inline-block',
                        width: '40px',
                        textAlign: 'right',
                        marginRight: avr_margin2,
                      }}
                    >
                      {v.length}
                    </b>
                    記事
                  </span>
                  {average}
                </a>
              </div>
            </td>
            <td className="d-none d-md-table-cell text-center">
              <a
                target="_blank"
                className="avatar d-block"
                title={v.n}
                style={{
                  backgroundImage: `url(${this.makeProfileImageURL(v)})`,
                }}
              />
            </td>
            <td
              className="d-none d-md-table-cell"
              style={{ width: `${user_width}px` }}
            >
              <div>
                <a
                  href={this.makeUserURL(v)}
                  target="_blank"
                  className="text-dark"
                >
                  {v.n}
                </a>
              </div>
              <div className="small text-muted">
                <a
                  href={this.makeUserURL(v)}
                  target="_blank"
                  className="text-muted"
                >
                  {v.u}
                </a>
              </div>
            </td>
            <td className="d-none d-md-table-cell">
              <div>
                <span
                  className={`stamp stamp-sm`}
                  style={{ width: '100%', backgroundColor: '#41C9B3' }}
                >
                  {v.points}
                </span>
              </div>
            </td>
          </tr>
        )
      }
      top_rankers = rankers_html
    }
    return top_rankers
  }
  drawPrizeHolders(rankers) {
    let top_rankers
    if (this.state.tag === 'alis' && this.state.target === 'note') {
      let rankers_array = []
      for (let k in rankers) {
        if (rankers[k].prize_total == 0) {
          rankers[k].prizes.push({
            amount: 40,
            title: `参加賞`,
          })
          rankers[k].prize_total += 40
        }
        rankers_array.push(rankers[k])
        rankers[k].prizes.push({
          amount: rankers[k].points / 2,
          title: `AHT`,
          color: '#41c983',
        })
        if (k === 'kazalis') {
          rankers[k].prizes.push({
            amount: '副賞',
            title: `ハッカー部賞`,
            color: 'tomato',
          })
        }
      }
      rankers_array = _(rankers_array).sortBy(v => {
        return (v.prize_total * 1000 + v.points) * -1
      })
      let rankers_html = []
      let rank = 0

      for (let v of rankers_array) {
        rank += 1
        let points_color = 'blue'
        if (v.prize_total === 0) {
          points_color = 'gray'
        } else if (v.prize_total >= 100) {
          points_color = 'red'
        } else if (v.prize_total >= 100) {
          points_color = 'orange'
        } else if (v.prize_total >= 10) {
          points_color = 'green'
        }
        let rank_color = `dark`
        if (rank == 1) {
          rank_color = `green`
        } else if (rank == 2) {
          rank_color = `pink`
        } else if (rank == 3) {
          rank_color = `orange`
        } else if (rank == 4) {
          rank_color = `purple`
        } else if (rank <= 5) {
          rank_color = `azure`
        }
        let user_width = 250
        let rank_margin = '10px'
        let rank_width = '130px'
        if (this.state.size === 'small') {
          user_width = 155
          rank_width = '110px'
        }

        let prizes = []
        let rindex = 0
        for (let p of v.prizes) {
          rindex += 1
          let rwidth = rank_width
          if (rindex === 3) {
            rwidth = ''
          }
          prizes.push(
            <span
              style={{
                marginRight: rank_margin,
                width: rwidth,
                display: 'inline-block',
              }}
            >
              <b
                style={{
                  color: p.color || '#858dda',
                  fontSize: '20px',
                  display: 'inline-block',
                  width: '50px',
                  textAlign: 'right',
                  marginRight: '7px',
                }}
              >
                {p.amount}
              </b>
              <span style={{ fontSize: '13px' }}>{p.title}</span>
            </span>
          )
        }

        rankers_html.push(
          <tr>
            <td className="text-center w-1">
              <a
                href={this.makeArticleURL(v)}
                target="_blank"
                className="avatar d-md-none d-inline-block"
                title={this.makeArticleURL(v)}
                style={{
                  backgroundImage: `url(${this.makeProfileImageURL(v)})`,
                }}
              />

              <span
                className={`d-none d-md-inline-block text-center avatar avatar-${rank_color}`}
              >
                {rank}
              </span>
            </td>
            <td style={{ paddingLeft: '20px', paddingLeft: '20px' }}>
              <div className="mb-1">
                <a className="text-muted">{prizes}</a>
              </div>
            </td>
            <td className="d-none d-md-table-cell text-center">
              <a
                target="_blank"
                className="avatar d-block"
                title={v.n}
                style={{
                  backgroundImage: `url(${this.makeProfileImageURL(v)})`,
                }}
              />
            </td>
            <td
              className="d-none d-md-table-cell"
              style={{ width: `${user_width}px` }}
            >
              <div>
                <a
                  href={this.makeUserURL(v)}
                  target="_blank"
                  className="text-dark"
                >
                  {v.n}
                </a>
              </div>
              <div className="small text-muted">
                <a
                  href={this.makeUserURL(v)}
                  target="_blank"
                  className="text-muted"
                >
                  {v.u}
                </a>
              </div>
            </td>
            <td
              className="d-none d-md-table-cell"
              style={{
                verticalAlign: 'middle',
                whiteSpace: 'nowrap',
                width: '100px',
              }}
            >
              <div style={{ verticalAlign: 'middle' }}>
                <img
                  src={alis_ico}
                  style={{ height: '23px', width: '23px' }}
                  className="d-inline-block mr-2"
                />
                <span
                  style={{
                    fontSize: '20px',
                    verticalAlign: 'middle',
                    color: '#858dda',
                    fontWeight: 'bold',
                    width: '60px',
                    paddingTop: 0,
                    paddingBottom: 0,
                  }}
                >
                  {v.prize_total}
                </span>
              </div>
            </td>
          </tr>
        )
      }
      top_rankers = rankers_html
    }
    return top_rankers
  }
}

export default Home
