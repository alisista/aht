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
      invalid_ids: {},
      is_invalid: false,
      invalid_message: '',
      magazine_url_id: '',
    }
  }
  issueMagazine(is_edit) {
    let editors = window.$('[name="editors"]:checked').val()
    let title = window.$('#magazine_title').val()
    let description = window.$('#magazine_description').val()
    let url_id = window.$('#magazine_id').val() || this.props.magazine.url_id
    if (!is_edit && this.state.is_invalid !== false) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            無効なマガジンID！
          </div>
        ),
        body: (
          <p>英数字と_-からなる３０文字以内のマガジンIDを設定して下さい。</p>
        ),
        cancel_text: '確認',
      })
    } else if (!is_edit && url_id.length < 3) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            無効なマガジンID！
          </div>
        ),
        body: <p>マガジンIDは3文字以上で設定して下さい。</p>,
        cancel_text: '確認',
      })
    } else if (editors == undefined) {
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
      if (url_id.match(/^\s*$/) === null) {
        magazine.url_id = url_id
      }
      if (description.match(/^\s*$/) === null) {
        magazine.description = description
      }
      let set_id = false
      if (
        (this.props.magazine == undefined ||
          this.props.magazine.url_id == undefined) &&
        url_id.match(/^\s*$/) === null
      ) {
        set_id = true
      }
      magazine.set_id = set_id
      if (is_edit) {
        magazine.id = this.props.magazine.id
        magazine.file_id = this.props.magazine_id
      } else {
        magazine.id = shortid()
      }
      this.props.auth.issueMagazine(magazine, this, () => {
        this.setState({
          magazine_description: '',
          magazine_title: '',
          magazine_url_id: '',
        })
      })
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
  async checkMagazineID() {
    if (this.state.is_invalid === false) {
      if (this.state.magazine_url_id.length < 3) {
        this.props.showModal({
          title: (
            <div>
              <i className="text-warning fas fa-exclamation-triangle" />{' '}
              IDが短すぎます！
            </div>
          ),
          body: <p>IDは少なくとも３文字以上で入力して下さい。</p>,
          cancel_text: '確認',
        })
      } else {
        this.props.auth.checkMagazineID(this.state.magazine_url_id, this)
      }
    }
  }
  render() {
    let action_word = '発刊'
    let action_btn_word = '発刊'
    let delete_btn
    if (this.props.magazine != undefined) {
      action_word = '編集'
      action_btn_word = '保存'
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
    let magazine_url_id = ''
    let magazine_url_disabled = ''
    let magazine_editors = {
      me: '',
      anyone: '',
    }
    if (
      this.props.magazine != undefined &&
      this.props.magazine.url_id != undefined
    ) {
      magazine_url_disabled = 'disabled'
      magazine_url_id =
        this.state.magazine_url_id || this.props.magazine.url_id || ''
    }
    if (this.props.magazine != undefined) {
      original_title = this.state.magazine_title || this.props.magazine.title
      original_description =
        this.state.magazine_description || this.props.magazine.description
      magazine_editors[
        this.state.magazine_editors || this.props.magazine.editors
      ] = 'checked'
      if (this.props.magazine.url_id == undefined) {
        magazine_url_id = this.state.magazine_url_id || ''
      }
    } else {
      magazine_url_id = this.state.magazine_url_id || ''
      original_title = this.state.magazine_title
      original_description = this.state.magazine_description
      magazine_editors[this.state.magazine_editors] = 'checked'
    }
    let check_btn = 'primary'
    let check_btn_disabled = ''
    let invalid_state = ''
    let invalid_color = 'danger'
    let invalid_cursor = 'pointer'
    if (this.state.is_invalid === 'is-invalid') {
      check_btn = 'dark'
      check_btn_disabled = 'disabled'
      invalid_cursor = 'default'
    } else if (
      this.state.is_invalid === 'is-valid' ||
      (this.props.magazine != undefined &&
        this.props.magazine.url_id != undefined)
    ) {
      check_btn_disabled = 'disabled'
      check_btn = 'dark'
      invalid_state = 'state-valid'
      invalid_color = 'success'
      invalid_cursor = 'default'
    }
    let id_check_btn_input = (
      <input
        onChange={e => {
          let id = e.target.value
          let is_invalid = false
          let invalid_message = ''
          if (this.state.invalid_ids[id.toLowerCase()] != undefined) {
            is_invalid = 'is-invalid'
            invalid_message = '既に使われているIDです。'
          } else if (id.match(/[^a-z0-9_-]+/i) != null || id.length > 30) {
            is_invalid = 'is-invalid'
            invalid_message =
              '無効な文字列です。３０文字以内の英数と_-のみ利用可能です。'
          }
          this.setState({
            magazine_url_id: id,
            is_invalid: is_invalid,
            invalid_message: invalid_message,
          })
        }}
        value={magazine_url_id}
        id="magazine_id"
        type="text"
        className={`form-control ${this.state.is_invalid}  ${invalid_state}`}
        disabled={magazine_url_disabled}
        name="example-text-input"
        placeholder="マガジンID"
      />
    )
    let id_check_btn = (
      <div className="input-group">
        {id_check_btn_input}
        <span className="input-group-append">
          <button
            className={`btn btn-${check_btn} ${check_btn_disabled}`}
            style={{ cursor: invalid_cursor }}
            type="button"
            onClick={async () => {
              await this.checkMagazineID()
            }}
          >
            チェック
          </button>
        </span>
      </div>
    )
    if (
      this.props.magazine != undefined &&
      this.props.magazine.url_id != undefined
    ) {
      id_check_btn = id_check_btn_input
    }

    let invalid_message, magazine_id_edit
    if (
      this.props.magazine != undefined &&
      this.props.magazine.url_id != undefined
    ) {
      let magazine_url = `https://${process.env.MAGAZINE_DOMAIN}/${
        this.props.magazine.url_id
      }/`
      invalid_message = (
        <b>
          <a href={magazine_url} target="_blank">
            {magazine_url}{' '}
          </a>
        </b>
      )
      magazine_id_edit = (
        <div className="form-group">
          <label className="form-label">
            マガジン公式URL（反映に最大1時間かかります）
          </label>
          <div
            className={`alert alert-success mt-1`}
            style={{ textAlign: 'center', fontSize: '20px' }}
          >
            {invalid_message}
          </div>
        </div>
      )
    } else {
      magazine_id_edit = (
        <div className="form-group">
          <label className="form-label">
            マガジンID(英数_- ３０文字以内、変更不可)
          </label>
          {id_check_btn}
          <div className={`text-${invalid_color} mt-1`}>
            {invalid_message || this.state.invalid_message}
          </div>
        </div>
      )
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
              {action_btn_word}
            </a>
            {delete_btn}
          </div>
        </div>
        <div className="card-body">
          {magazine_id_edit}
          <div className="form-group">
            <label className="form-label">マガジン名</label>
            <input
              onChange={e => {
                this.setState({ magazine_title: e.target.value })
              }}
              value={original_title}
              id="magazine_title"
              type="text"
              className={`form-control`}
              name="example-text-input"
              placeholder="マガジン名"
            />
          </div>
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
    )
  }
}

export default Articles
