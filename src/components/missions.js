import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'
let prefix = process.env.FIREBASE_PROJECT_NAME
const modals = {
  error_too_short: {
    title: (
      <div>
        <i className="text-danger fas fa-ban" /> 連続で申請はできません！
      </div>
    ),
    body: '１時間以上空けてからもう一度申請して下さい。',
    cancel_text: '確認',
  },
  error_general: {
    title: (
      <div>
        <i className="text-danger fas fa-ban" /> エラーが発生しました！
      </div>
    ),
    body: '時間を置いてからもう一度申請して下さい。',
    cancel_text: '確認',
  },
}

class Missions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checking: false,
    }
  }
  isChecking(index, cb) {
    if (this.props.checking == null) {
      this.setState({ checking: index }, () => {
        cb()
      })
    }
  }

  clearChecking() {
    this.setState({ checking: null })
  }

  checkGithub() {
    if (this.props.social_links['github.com'] == undefined) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-danger fas fa-ban" />{' '}
            Githubアカウントが登録されていません！
          </div>
        ),
        body:
          'オーガニゼーション登録のチェックをする前にGithubアカウントを登録して下さい。',
        exec_text: '登録',
        exec: () => {
          this.props.auth.link_github()
        },
      })
    } else {
      this.isChecking(2, () => {
        fetch(
          `https://api.github.com/user/${
            this.props.social_links['github.com'].uid
          }`
        )
          .then(d => d.json())
          .then(json => {
            this.clearChecking()
            if (json.error != undefined) {
              if (json.error == 3) {
                this.props.showModal(modals.error_too_short)
              } else {
                this.props.showModal(modals.error_general)
              }
            } else {
              let username = json.login
              return fetch(
                `https://api.github.com/orgs/alisista/members/${username}`
              )
            }
          })
          .then(d => {
            let status = d.status
            if (status === 204) {
              this.props.showModal({
                title: (
                  <div>
                    <i className="text-success fas fa-check" />{' '}
                    メンバーシップ確認完了
                  </div>
                ),
                body: 'どうもありがとうございます！',
                cancel_text: '確認',
              })
              this.props.auth.completeTask('join', 4)
            } else {
              this.props.showModal({
                title: (
                  <div>
                    <i className="text-danger fas fa-ban" />{' '}
                    メンバーシップが確認できません！
                  </div>
                ),
                body:
                  '参加申請、招待承認、メンバーシップ公開をしてからもう一度申請しなおして下さい。',
                cancel_text: '確認',
              })
            }
          })
          .catch(() => {
            this.props.showModal(modals.error_general)
            this.clearChecking()
          })
      })
    }
  }

  checkDiscord() {
    if (
      this.props.serverInfo == undefined ||
      this.props.serverInfo.discord == undefined
    ) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-danger fas fa-ban" />{' '}
            Discordアカウントが登録されていません！
          </div>
        ),
        body:
          'Discord参加のチェックをする前にDiscordアカウントを登録して下さい。',
        exec_text: '登録',
        exec: () => {
          this.props.auth.link_discord()
        },
      })
    } else {
      this.isChecking(3, () => {
        fetch(
          `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/check/discord/${
            this.props.user.uid
          }/${this.props.serverInfo.discord.id}`
        )
          .then(d => d.json())
          .then(json => {
            this.clearChecking()
            if (json.error != undefined) {
              if (json.error == 3) {
                this.props.showModal(modals.error_too_short)
              } else {
                this.props.showModal(modals.error_general)
              }
            } else {
              let isMember = json.isMember
              if (isMember) {
                this.props.showModal({
                  title: (
                    <div>
                      <i className="text-success fas fa-check" />{' '}
                      Discord参加確認完了
                    </div>
                  ),
                  body: 'どうもありがとうございます！',
                  cancel_text: '確認',
                })
                this.props.auth.completeTask('join', 3)
              } else {
                this.props.showModal({
                  title: (
                    <div>
                      <i className="text-danger fas fa-ban" />{' '}
                      Discord参加が確認できません！
                    </div>
                  ),
                  body:
                    'ALISハッカー部のDiscordに参加してからもう一度申請しなおして下さい。',
                  cancel_text: '確認',
                })
              }
            }
          })
      })
    }
  }

  checkFollowing() {
    this.isChecking(2, () => {
      fetch(
        `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/check/following/` +
          this.props.user.id
      )
        .then(d => d.json())
        .then(json => {
          this.clearChecking()
          if (json.error != undefined) {
            if (json.error == 3) {
              this.props.showModal(modals.error_too_short)
            } else {
              this.props.showModal(modals.error_general)
            }
          } else {
            let isfollowing = json.following
            if (isfollowing) {
              this.props.showModal({
                title: (
                  <div>
                    <i className="text-success fas fa-check" /> フォロー確認完了
                  </div>
                ),
                body: 'どうもありがとうございます！',
                cancel_text: '確認',
              })
              this.props.auth.completeTask('join', 2)
            } else {
              this.props.showModal({
                title: (
                  <div>
                    <i className="text-danger fas fa-ban" />{' '}
                    フォローが完了していません！
                  </div>
                ),
                body:
                  'ツイッターアカウントをフォローしてからもう一度申請しなおして下さい。',
                cancel_text: '確認',
              })
            }
          }
        })
        .catch(() => {
          this.props.showModal(modals.error_general)
          this.clearChecking()
        })
    })
  }
  render() {
    let completed_tasks =
      (((this.props.userInfo || {}).missions || {}).join || {}).tasks || {}
    let waves_address_added_at, waves_done
    if (_.isEmpty((this.props.userInfo || {}).waves_addresses || {}) == false) {
      waves_done = true
      for (let k in this.props.userInfo.waves_addresses) {
        if (
          waves_address_added_at == undefined ||
          waves_address_added_at >
            this.props.userInfo.waves_addresses[k].added_at
        ) {
          waves_address_added_at = this.props.userInfo.waves_addresses[k]
            .added_at
        }
      }
    }
    let revoke = (((this.props.userInfo || {}).missions || {}).join || {})
      .revoke
    let tasks = [
      {
        id: '1',
        task_id: 'task-1',
        task: 'ハッカー部ウェブサイトにツイッターでログイン',
        done: true,
        date: moment(this.props.user.created_at).format('x') * 1,
      },
      {
        id: '2',
        task_id: 'task-2',
        task: 'Wavesアドレスを登録',
        btn_txt: '登録',
        done: waves_done,
        date: waves_address_added_at,
        btn_func: 'addWaves',
      },
      {
        id: '3',
        task_id: 'task-3',
        task: (
          <div>
            ハッカー部ツイッターアカウント
            <a
              className="ml-2 mr-2"
              href="https://twitter.com/alishackers"
              target="_blank"
            >
              <i className="fab fa-twitter" /> alishackers
            </a>
            をフォロー
          </div>
        ),
        btn_func: 'checkFollowing',
        done: completed_tasks[2] != undefined,
        date: completed_tasks[2],
      },
      {
        id: '4',
        task_id: 'task-4',
        task: (
          <div>
            ハッカー部
            <a
              href="https://discordapp.com/invite/TyKbbrT"
              target="blank"
              className="ml-2 mr-2"
            >
              <i className="fab fa-discord" /> DISCORD
            </a>
            に参加
          </div>
        ),
        btn_func: 'checkDiscord',
        done: completed_tasks[3] != undefined,
        date: completed_tasks[3],
      },
      {
        id: '5',
        task_id: 'task-5',
        task: (
          <div>
            ハッカー部
            <a
              href="https://github.com/alisista"
              target="blank"
              className="ml-2 mr-2"
            >
              <i className="fab fa-github" /> Githubオーガニゼーション
            </a>
            に参加申請
            <br />
            申請方法
            <i className="fa fa-arrow-circle-right ml-2 mr-2" />
            <b className="text-orange">#アリスハッカートークン</b>
            チャンネルで自分が開発したいものやどういった活動をしたいかをコメント
            <br />
            招待が来たら承認し、
            <a
              href="https://help.github.com/articles/publicizing-or-hiding-organization-membership/"
              target="_blank"
            >
              メンバーシップを公開
            </a>
            する
          </div>
        ),
        btn_func: 'checkGithub',
        done: completed_tasks[4] != undefined,
        date: completed_tasks[4],
      },
    ]
    let dones = _(tasks).filter(v => {
      return v.done
    }).length
    let progress = Math.floor((dones / 5) * 100)
    let progress_colors = ['gray', 'red', 'orange', 'teal', 'blue', 'green']
    let progress_color = progress_colors[dones]
    let tasks_html = []
    tasks.forEach((v, i) => {
      let index = i + 1
      let index_color = 'gray'
      let task = v.task
      let btn_txt = v.btn_txt || 'チェック'
      if (this.props.checking === i) {
        btn_txt = <i className="fas fa-cog fa-spin" />
      }
      let date = (
        <button
          className="btn btn-primary"
          onClick={() => {
            this[v.btn_func]()
          }}
          style={{ minWidth: '60px' }}
        >
          {btn_txt}
        </button>
      )
      if (v.done == true) {
        index = <i className="fa fa-check" />
        index_color = 'success'
        task = <del>{v.task}</del>
        date = moment(v.date).fromNow()
      }
      let tr_class = ''
      if (revoke != undefined && revoke.includes(v.task_id)) {
        index = <i className="fa fa-ban" />
        index_color = 'danger'
        tr_class = 'table-danger'
      }
      tasks_html.push(
        <tr className={tr_class}>
          <td>
            <span className={`stamp stamp-sm bg-${index_color}`}>{index}</span>
          </td>
          <td>{task}</td>
          <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{date}</td>
        </tr>
      )
    })
    let completed_icon, completed_html
    if (progress == 100) {
      completed_icon = <i className="text-success fa fa-check-circle mr-3" />
      if (this.props.userInfo.missions.join.confirmed != undefined) {
        let isConfirmed = false
        for (let v of this.props.history || []) {
          if (v.mission_id == 'join') {
            isConfirmed = true
            break
          }
        }
        if (revoke != undefined) {
          completed_html = (
            <tr style={{ backgroundColor: '#ddd' }}>
              <td>
                {' '}
                <span className={`stamp stamp-sm bg-danger`}>
                  <i className="fa fa-ban" />
                </span>
              </td>
              <td className="text-danger">
                いくつかのタスクでソーシャルアカウントの重複使用があったため、認証に失敗しました。以前に別のユーザーに使われていないソーシャルアカウントで再トライして下さい。
              </td>
              <td>
                {' '}
                <button
                  className="btn btn-warning"
                  onClick={() => {
                    this.props.auth.retry()
                  }}
                  style={{ minWidth: '60px', cursor: 'pointer' }}
                >
                  再トライ
                </button>
              </td>
            </tr>
          )
        } else if (isConfirmed == true) {
          completed_html = (
            <tr style={{ backgroundColor: '#ddd' }}>
              <td>
                {' '}
                <span className={`stamp stamp-sm bg-danger`}>
                  <i className="fa fa-award" />
                </span>
              </td>
              <td className="text-danger">
                おめでとうございます！トークンが配布されました。トークン獲得履歴をお確かめ下さい。
              </td>
              <td>
                {' '}
                <button
                  className="btn btn-success"
                  style={{ minWidth: '60px', cursor: 'default' }}
                >
                  確定済
                </button>
              </td>
            </tr>
          )
        } else {
          completed_html = (
            <tr style={{ backgroundColor: '#ddd' }}>
              <td>
                {' '}
                <span className={`stamp stamp-sm bg-danger`}>
                  <i className="fa fa-award" />
                </span>
              </td>
              <td className="text-danger">
                おめでとうございます！ミッション達成を認証中です。２４時間以内に認証されトークン配布が確定されますので少々お待ち下さい。
              </td>
              <td>
                {' '}
                <button
                  className="btn btn-success"
                  style={{ minWidth: '60px', cursor: 'default' }}
                >
                  認証中
                </button>
              </td>
            </tr>
          )
        }
      } else {
        completed_html = (
          <tr style={{ backgroundColor: '#ddd' }}>
            <td>
              {' '}
              <span className={`stamp stamp-sm bg-danger`}>
                <i className="fa fa-award" />
              </span>
            </td>
            <td className="text-danger">
              おめでとうございます！ミッション達成を認証してトークン配布手続きを開始するために確定ボタンをクリックして下さい。一度確定したミッションは取り消せなくなり、そのタスクで使用したソーシャルアカウントは別のユーザーで同一タスク遂行には使用できません。
            </td>
            <td>
              {' '}
              <button
                className="btn btn-primary"
                onClick={() => {
                  this.props.auth.confirmMission('join')
                }}
                style={{ minWidth: '60px' }}
              >
                確定
              </button>
            </td>
          </tr>
        )
      }
    }
    return (
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">
            <span className={`stamp stamp-sm bg-primary mr-3`}>
              <i className="fa fa-award" />
            </span>
            ALISハッカー部入部で
            <b className="text-blue ml-2 mr-2">100AHT</b>
            獲得！
          </h4>
        </div>
        <div className="card-body text-center">
          <div className="h5">
            タスク進捗 （{dones}
            /5）
          </div>
          <div className="display-4 font-weight-bold mb-4">
            {completed_icon}
            {progress}%
          </div>
          <div className="progress progress-sm">
            <div
              className={`progress-bar bg-${progress_color}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table card-table table-striped table-vcenter">
            <thead>
              <tr>
                <th>#</th>
                <th>タスク</th>
                <th style={{ whiteSpace: 'nowrap' }}>完了日</th>
              </tr>
            </thead>
            <tbody>
              {tasks_html}
              {completed_html}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Missions
