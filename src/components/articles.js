import React, { Component } from 'react'
import url from 'url'
import _ from 'underscore'

import moment from 'moment-timezone'
import 'moment/locale/ja'

import waves_icon from '../assets/images/waves.png'
import Post_Articles from '../components/post_articles'
import Post_Magazine from '../components/post_magazine'
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
      <a className={`btn m-3 btn-orange`} href="/magazines/?id=admin">
        <i className="fa fa-book-open" />
      </a>
    )
    return tabs_html
  }
  render() {
    let articles_html = []
    let tabs_html = this.getTabs()
    if (this.state.tab === 'magazin') {
      articles_html = (
        <Post_Magazine
          articles_page={this.props.articles_page}
          nomore_articles={this.props.nomore_articles}
          magazine_id="admin"
          magazineArticles={this.props.magazineArticles}
          userArticles={this.props.userArticles}
          showModal={this.props.showModal}
          auth={this.props.auth}
        />
      )
    } else {
      articles_html = (
        <Post_Articles
          page={this.props.articles_page}
          articles={this.props.articles}
          showModal={this.props.showModal}
          auth={this.props.auth}
        />
      )
    }
    return [
      <div className="text-center">{tabs_html}</div>,
      <div className="card">{articles_html}</div>,
    ]
  }
}

export default Articles
