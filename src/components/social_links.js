import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

import fa_alis from '../assets/images/fa-alis.png'

moment.locale('ja')
class Social_Links extends Component {
  constructor(props) {
    super(props)
  }
  link_discord() {
    this.props.auth.link_discord()
  }

  link_github() {
    this.props.auth.link_github()
  }
  link_alis() {
    this.props.showModal({
      title: (
        <div>
          <i className="text-warning fas fa-exclamation-triangle" />{' '}
          トークン入力
        </div>
      ),
      body: (
        <div>
          <p>
            ALISのユーザーアカウントを認証するためにご自分でAPIから『id_token』を入手して以下のボックスに入力して下さい。
          </p>
          <textarea
            placeholder="アクセストークン"
            id="access_token"
            className="form-control"
          />
        </div>
      ),
      exec_text: '確認',
      exec: () => {
        let token = window.$('#access_token').val()
        this.props.auth.authenticateAlisUser(token)
      },
    })
  }
  unlink_twitter() {
    this.props.showModal({
      title: (
        <div>
          <i className="text-warning fas fa-exclamation-triangle" />{' '}
          取り消し不可！
        </div>
      ),
      body:
        'ツイッターのアカウントはウェブサイトのログインで使用しているので取り消せません。',
      cancel_text: '確認',
    })
  }
  unlink_github() {
    this.unlink_social({ key: 'github', mission_no: '4' })
  }
  unlink_alis() {
    this.props.showModal({
      title: (
        <div>
          <i className="text-danger fas fa-exclamation-triangle" />{' '}
          取り消し確認！
        </div>
      ),
      body: (
        <p>
          本当に
          <span className="text-capitalize">ALIS</span>
          アカウントを取り消してよろしいですか？今後ALIS記事に対してAHTが支給されなくなります。
        </p>
      ),
      cancel_text: 'キャンセル',
      exec_text: '実行',
      exec: () => {
        this.props.auth.unlink_alis()
      },
    })
  }
  unlink_social(opts = {}) {
    this.props.showModal({
      title: (
        <div>
          <i className="text-danger fas fa-exclamation-triangle" />{' '}
          取り消し確認！
        </div>
      ),
      body: (
        <p>
          本当に
          <span className="text-capitalize">{opts.key}</span>
          アカウントを取り消してよろしいですか？このアカウントを使って完了したタスクも無効になります。
        </p>
      ),
      exec_text: '実行',
      exec: () => {
        if (
          this.props.userInfo.missions != undefined &&
          this.props.userInfo.missions.join != undefined &&
          this.props.userInfo.missions.join.tasks != undefined &&
          this.props.userInfo.missions.join.tasks[opts.mission_no] !=
            undefined &&
          this.props.userInfo.missions.join.confirmed == undefined
        ) {
          delete this.props.userInfo.missions.join.tasks[opts.mission_no]
          this.props.auth.updateData(
            { missions: this.props.userInfo.missions },
            () => {
              this.props.auth.setUserInfo(
                'missions',
                this.props.userInfo.missions,
                () => {
                  this.props.auth[`unlink_${opts.key}`]()
                }
              )
            }
          )
        } else {
          this.props.auth[`unlink_${opts.key}`]()
        }
      },
    })
  }

  unlink_discord() {
    this.unlink_social({ key: 'discord', mission_no: '3' })
  }

  render() {
    const social_links = [
      {
        type: 'twitter',
        name: 'Twitter',
        color: 'blue',
        id: 'twitter.com',
        func_unlink: 'unlink_twitter',
      },
      {
        type: 'discord',
        name: 'Discord',
        color: 'green',
        func_link: 'link_discord',
        func_unlink: 'unlink_discord',
      },
      {
        type: 'github',
        name: 'Github',
        color: 'red',
        id: 'github.com',
        func_link: 'link_github',
        func_unlink: 'unlink_github',
      },
      {
        type: 'alis',
        name: 'ALIS',
        color: 'purple',
        func_link: 'link_alis',
        func_unlink: 'unlink_alis',
      },
    ]
    let social_links_html = []
    social_links.forEach(v => {
      if (this.props.social_links[v.id] != undefined) {
        v.displayName = this.props.social_links[v.id].uid
      } else if (
        this.props.serverInfo != undefined &&
        this.props.serverInfo[v.type] != undefined
      ) {
        v.displayName =
          this.props.serverInfo[v.type].id ||
          this.props.serverInfo[v.type].user_id
      }
      let icon
      if (v.type === 'alis') {
        icon = (
          <img
            src={fa_alis}
            style={{
              height: '30px',
              width: '30px',
              border: 'none',
              marginBottom: '2px',
            }}
          />
        )
      } else {
        icon = <i className={`fab fa-${v.type}`} />
      }
      let className = 'social-linked'
      let link_func = () => {}
      if (v.displayName == undefined) {
        v.displayName = <div>アカウントをリンクする</div>
        link_func = this[v.func_link]
        className = 'social-unlinked'
        v.color = 'gray'
      } else if (v.func_unlink != undefined) {
        link_func = this[v.func_unlink]
      }
      social_links_html.push(
        <div className="col-12 col-sm-6 col-lg-12">
          <div
            className={`card p-3 ${className}`}
            onClick={() => {
              link_func.apply(this)
            }}
          >
            <div className="d-flex align-items-center">
              <span className={`stamp stamp-md bg-${v.color} mr-3`}>
                {icon}
              </span>
              <div>
                <h4 className="m-0">
                  <span>{v.name}</span>
                </h4>
                <small className="text-muted">{v.displayName}</small>
              </div>
            </div>
          </div>
        </div>
      )
    })
    return <div className="row">{social_links_html}</div>
  }
}

export default Social_Links
