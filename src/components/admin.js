import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'
moment.locale('ja')
let prefix = process.env.FIREBASE_PROJECT_NAME
class Admin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ordering: false,
      users: [],
    }
  }
  order() {
    fetch(`${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/users/list/`)
      .then(res => res.json())
      .then(json => {
        this.setState({ ordering: true, users: json.users })
      })
      .catch(e => {
        console.log(e)
      })
  }
  selectUser() {
    let user_id = window.$('#client').val()
    let user
    for (let v of this.state.users || []) {
      if (v.uid === user_id) {
        user = v
        break
      }
    }
    this.setState({ selectedUser: user })
  }
  makePayment() {
    let to = this.state.selectedUser
    let amount = window.$('#token_amount').val() * 1
    let what_for = window.$('#what_for').val()
    let type = window.$('#payment_type').val()
    if (to == undefined) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-danger fas fa-ban" /> 入力エラー！
          </div>
        ),
        body: '案件の依頼先を選択してください。',
        cancel_text: '確認',
      })
    } else if (type === 'faucet' && (0 >= amount || 100 < amount)) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-danger fas fa-ban" /> 入力エラー！
          </div>
        ),
        body: '100以下の数字を入力して下さい。',
        cancel_text: '確認',
      })
    } else if (_.isNaN(amount) == true || 0 >= amount || 10000 < amount) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-danger fas fa-ban" /> 入力エラー！
          </div>
        ),
        body: '10000以下の数字を入力して下さい。',
        cancel_text: '確認',
      })
    } else if (what_for.match(/^\s*$/) != null) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-danger fas fa-ban" /> 入力エラー！
          </div>
        ),
        body: '案件を入力して下さい。',
        cancel_text: '確認',
      })
    } else {
      this.props.showModal({
        title: (
          <div>
            <i className="text-danger fas fa-ban" /> 支払い確認！
          </div>
        ),
        body: `${
          to.displayName
        }さんに${amount}AHTを『${what_for}』についてお支払いしてよろしいですか？`,
        exec_text: '実行',
        exec: () => {
          this.props.auth.makePayment(to, amount, what_for, type)
        },
      })
    }
  }
  render() {
    if (
      this.props.user.id !== process.env.ADMIN_TWITTER_ID &&
      process.env.WAVES_NETWORK !== 'TESTNET'
    ) {
      return null
    } else {
      let disabled = ''
      let supply_title = 'お仕事発注履歴'
      let supply_label = '発注'
      let payment_label = '支払い'
      let token_amount = 'トークン額'
      let supply_options = []
      if (process.env.WAVES_NETWORK === 'TESTNET') {
        supply_options.push(<option value="faucet">フォーセット</option>)
        supply_title = 'フォーセット'
        supply_label = '供給'
        payment_label = '供給'
        if (this.props.user.id !== process.env.ADMIN_TWITTER_ID) {
          disabled = 'disabled'
          token_amount = '100AHTまで'
        }
      }
      if (this.props.user.id === process.env.ADMIN_TWITTER_ID) {
        supply_options.push(<option value="outsource">仕事発注</option>)
        supply_options.push(<option value="prize">企画賞品</option>)
      }

      let orderForm
      if (this.state.ordering === true) {
        let users = []
        for (let v of this.state.users) {
          if (
            process.env.WAVES_NETWORK !== 'TESTNET' ||
            this.props.user.id === process.env.ADMIN_TWITTER_ID ||
            v.uid === this.props.user.uid
          ) {
            users.push(<option value={v.uid}>{v.displayName}</option>)
          }
        }
        let supply_to = [users]
        supply_to.unshift(<option value="">供給先を選択してください</option>)
        let userImage
        let imgURL =
          'https://abs.twimg.com/sticky/default_profile_images/default_profile_200x200.png'
        if (
          this.state.selectedUser != undefined &&
          this.state.selectedUser.photoURL != undefined
        ) {
          imgURL = this.state.selectedUser.photoURL
        }
        userImage = (
          <img
            src={imgURL}
            style={{
              height: '36px',
              borderTopRightRadius: '3px',
              borderBottomRightRadius: '3px',
            }}
          />
        )
        orderForm = (
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">供給先</label>
                <div className="input-group">
                  <select
                    className="form-control"
                    id="client"
                    onChange={() => {
                      this.selectUser()
                    }}
                  >
                    {supply_to}
                  </select>
                  <span className="input-group-append">
                    <span className="input-group-text" style={{ padding: 0 }}>
                      {userImage}
                    </span>
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">供給額</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={token_amount}
                    id="token_amount"
                  />
                  <span className="input-group-append">
                    <span className="input-group-text">AHT</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12">
                <label className="form-label">供給タイプ</label>
                <select
                  disabled={disabled}
                  type="text"
                  className="form-control"
                  id="payment_type"
                >
                  {supply_options}
                </select>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <label className="form-label">案件</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="依頼案件"
                    id="what_for"
                  />
                  <span className="input-group-append">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => {
                        this.makePayment()
                      }}
                    >
                      {payment_label}
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      }
      let history_html = []

      this.props.history.forEach(v => {
        let profile_image
        if (v.photoURL != undefined) {
          profile_image = (
            <span
              className="avatar"
              style={{ backgroundImage: `url(${v.photoURL})` }}
            />
          )
        }
        history_html.push(
          <tr>
            <td style={{ whiteSpace: 'nowrap' }}>
              {moment(v.date).format('M/D')}
            </td>
            <td style={{ whiteSpace: 'nowrap' }}>
              <b className="text-primary">{v.amount}</b>{' '}
              <span className="text-muted" style={{ fontSize: '12px' }}>
                AHT
              </span>
            </td>
            <td>{v.reason || `ALISハッカー部に入部`}</td>
            <td style={{ width: '32px', paddingRight: '0px' }}>
              {profile_image}
            </td>
            <td>{v.displayName}</td>
          </tr>
        )
      })
      return (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <span className={`stamp stamp-sm bg-purple mr-3`}>
                <i className="fas fa-paper-plane" />
              </span>
              {supply_title}{' '}
              <button
                className="ml-3 btn btn-sm btn-purple"
                onClick={() => {
                  this.order()
                }}
              >
                {supply_label}
              </button>
            </h4>
          </div>
          {orderForm}
          <div className="table-responsive">
            <table className="table card-table table-striped table-vcenter">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>支払日</th>
                  <th style={{ whiteSpace: 'nowrap' }}>トークン額</th>
                  <th style={{ whiteSpace: 'nowrap' }}>案件</th>
                  <th style={{ whiteSpace: 'nowrap' }} colSpan="2">
                    依頼先
                  </th>
                </tr>
              </thead>
              <tbody>{history_html}</tbody>
            </table>
          </div>
        </div>
      )
    }
  }
}

export default Admin
