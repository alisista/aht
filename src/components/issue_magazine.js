import React, { Component } from 'react'
import url from 'url'
import _ from 'underscore'

import moment from 'moment-timezone'
import 'moment/locale/ja'

import shortid from 'shortid'

moment.locale('ja')

class Articles extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tab: 'reward',
    }
  }
  issueMagazine(is_edit) {
    let editors = window.$('[name="editors"]:checked').val()
    let title = window.$('#magazine_title').val()
    let description = window.$('#magazine_description').val()
    if (editors == undefined) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            編集者未選択！
          </div>
        ),
        body: <p>共同編集者を選択してください。</p>,
        cancel_text: '確認',
      })
    } else if (title.match(/^\s*$/) !== null) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            タイトル未入力
          </div>
        ),
        body: <p>マガジンのタイトルを入力してください。</p>,
        cancel_text: '確認',
      })
    } else if (title.length > 50) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            タイトルが長すぎます
          </div>
        ),
        body: <p>マガジンのタイトルは50文字以内で入力してください。</p>,
        cancel_text: '確認',
      })
    } else if (description != undefined && description.length > 200) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            説明文が長すぎます
          </div>
        ),
        body: <p>マガジンの概要は200文字以内で入力してください。</p>,
        cancel_text: '確認',
      })
    } else {
      let magazine = {
        is_edit: is_edit,
        title: title,
        editors: editors,
        owner: this.props.user.uid,
      }
      if (description.match(/^\s*$/) === null) {
        magazine.description = description
      }
      if (is_edit) {
        magazine.id = this.props.magazine.id
        magazine.file_id = this.props.magazine_id
      } else {
        magazine.id = shortid()
        window.$('#magazine_title').val('')
        window.$('#magazine_description').val('')
      }
      this.props.auth.issueMagazine(magazine)
    }
  }
  deleteMagazine() {
    this.props.showModal({
      title: (
        <div>
          <i className="text-danger fas fa-exclamation-triangle" />{' '}
          マガジン削除確認
        </div>
      ),
      body: (
        <p>
          『<b className="text-danger">{this.props.magazine.title}</b>』
          を本当に削除してよろしいですか？
        </p>
      ),
      exec_text: '実行',
      exec: () => {
        this.props.auth.deleteMagazine(this.props.magazine)
      },
    })
  }
  render() {
    let action_word = '発刊'
    let delete_btn
    if (this.props.magazine != undefined) {
      action_word = '保存'
      delete_btn = (
        <a
          onClick={() => {
            this.deleteMagazine()
          }}
          className="btn btn-red btn-sm text-white ml-5"
        >
          削除
        </a>
      )
    }
    let magazines = _(this.props.userMagazines || []).sortBy(v => {
      return (v.created_at || 0) * -1
    })
    let magazines_html = []
    for (let v of magazines) {
      magazines_html.push(
        <tr
          key={v.id}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            window.location.href = `/magazines/?id=${v.file_id}`
          }}
        >
          <td>
            <div>
              <b>{v.title}</b>
            </div>
            <div className="small text-muted">
              {moment(v.created_at).format('MM/DD 発刊')}
            </div>
          </td>
          <td>
            <div className="small">{v.description || ''}</div>
          </td>
        </tr>
      )
    }
    let original_title = ''
    let original_description = ''
    let magazine_editors = {
      me: '',
      anyone: '',
    }
    if (this.props.magazine != undefined) {
      original_title = this.state.magazine_title || this.props.magazine.title
      original_description =
        this.state.magazine_description || this.props.magazine.description
      magazine_editors[
        this.state.magazine_editors || this.props.magazine.editors
      ] = 'checked'
    } else {
      original_title = this.state.magazine_title
      original_description = this.state.magazine_description
      magazine_editors[this.state.magazine_editors] = 'checked'
    }
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="stamp stamp-sm bg-green mr-3">
              <i className="fa fa-book" />
            </span>
            共同マガジン
            {action_word}
          </h3>
          <div className="card-options">
            <a
              onClick={() => {
                this.issueMagazine(this.props.magazine != undefined)
              }}
              className="btn btn-green btn-sm text-white"
            >
              {action_word}
            </a>
            {delete_btn}
          </div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">マガジン名</label>
            <input
              onChange={e => {
                this.setState({ magazine_title: e.target.value })
              }}
              value={original_title}
              id="magazine_title"
              type="text"
              className="form-control"
              name="example-text-input"
              placeholder="マガジン名"
            />
            <div className="form-group mt-3">
              <label className="form-label">マガジン概要（省略可）</label>
              <textarea
                id="magazine_description"
                className="form-control"
                name="example-textarea-input"
                rows="2"
                placeholder="マガジン概要"
                onChange={e => {
                  this.setState({ description: e.target.value })
                }}
              >
                {original_description}
              </textarea>
            </div>
            <div className="form-group">
              <label className="form-label">
                共同編集者（後で個別追加・変更可能）
              </label>
              <div className="selectgroup w-100">
                <label className="selectgroup-item">
                  <input
                    onClick={() => {
                      this.setState({ magazine_editors: 'me' })
                    }}
                    checked={magazine_editors.me}
                    type="radio"
                    name="editors"
                    value="me"
                    className="selectgroup-input"
                  />
                  <span className="selectgroup-button">自分のみ</span>
                </label>
                <label className="selectgroup-item">
                  <input
                    onClick={() => {
                      this.setState({ magazine_editors: 'anyone' })
                    }}
                    checked={magazine_editors.anyone}
                    type="radio"
                    name="editors"
                    value="anyone"
                    className="selectgroup-input"
                  />
                  <span className="selectgroup-button">誰でも</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Articles
