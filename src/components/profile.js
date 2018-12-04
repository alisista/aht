import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

import fa_alis from '../assets/images/fa-alis.png'

moment.locale('ja')
class Profile extends Component {
  constructor(props) {
    super(props)
  }
  async reservePayment() {
    let { amount_aht, unpaid_aht, last_payment } = this.getAmounts()
    const available_tokens = this.props.tip.getTokenStatus()
    let address
    for (let k in this.props.userInfo.waves_addresses || {}) {
      if (
        address == undefined ||
        this.props.userInfo.waves_addresses[k].receiver == true
      ) {
        address = k
      }
    }
    if (
      process.env.WAVES_NETWORK !== 'TESTNET' &&
      Date.now() - last_payment < 1000 * 60 * 60 * 24 * 7
    ) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            引き出し申請不可期間！
          </div>
        ),
        body: <p>トークンの引き出しができるのは一週間に一度だけです。</p>,
        cancel_text: '確認',
      })
    } else if (address == undefined) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            Wavesアドレスが登録されていません！
          </div>
        ),
        body: <p>Wavesのアドレスを登録してから、もう一度お試し下さい。</p>,
        cancel_text: '確認',
      })
    } else if (available_tokens.length === 0) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            残高がありません！
          </div>
        ),
        body: <p>未払いのトークンはありません。</p>,
        cancel_text: '確認',
      })
    } else {
      this.props.tip.tip(true, address)
      /*
      this.props.showModal({
        title: (
          <div>
            <i className="text-danger fas fa-exclamation-triangle" />{' '}
            トークン引き出し確認！
          </div>
        ),
        body: (
          <p>
            <b className="text-danger">{unpaid_aht}</b>
            AHTを
            <b className="text-danger">{address}</b>
            に送信してよろしいですか？
          </p>
        ),
        exec_text: '実行',
        exec: () => {
          this.props.auth.registerPayment(unpaid_aht, address)
        },
      })
      */
    }
  }
  getAmounts() {
    let amount_aht = 0
    let unpaid_aht = 0
    let last_payment = 0
    if (
      this.props.serverInfo.amount != undefined &&
      this.props.serverInfo.amount.aht != undefined
    ) {
      const AHT = this.props.serverInfo.amount.aht
      const divider = 10000000000
      amount_aht = AHT.earned
      let earned = AHT.earned + (AHT.tipped || 0)
      let paid = AHT.paid + (AHT.tip || 0)
      unpaid_aht = Math.round((earned - paid) * divider) / divider
    }
    let payment = this.props.payment || []
    for (let v of payment) {
      if (v != undefined && v.status == 'requested') {
        if (
          v.asset == undefined ||
          v.asset.assetId === undefined ||
          v.asset.assetId === 'aht'
        ) {
          unpaid_aht -= v.amount
        }
      }
    }
    if (payment[0] != undefined) {
      last_payment = payment[0].date
    }
    const divider = 100000000
    amount_aht = Math.round(amount_aht * divider) / divider
    unpaid_aht = Math.round(unpaid_aht * divider) / divider
    return {
      amount_aht: amount_aht,
      unpaid_aht: unpaid_aht,
      last_payment: last_payment,
    }
  }
  render() {
    let { amount_aht, unpaid_aht } = this.getAmounts()
    const available_tokens = this.props.tip.getTokenStatus()
    console.log(available_tokens)
    let other_tokens = []
    for (let v of available_tokens || []) {
      if (v.token !== 'aht') {
        other_tokens.push(
          <p className="mb-1">
            <b className="text-primary">{v.amount.currentAHT}</b>{' '}
            <span style={{ color: '#ttt', fontSize: '12px' }}>{v.name}</span>
          </p>
        )
      }
    }
    return [
      <div className="card card-profile">
        <div
          className="card-header"
          style={{ backgroundImage: 'url(/img/bg-showcase-4.jpg)' }}
        />
        <div className="card-body text-center">
          <img
            className="card-profile-img"
            style={{ width: '96px' }}
            src={this.props.user.photoURL.replace(/_normal/, '')}
          />
          <h3 className="mb-3">{this.props.user.displayName}</h3>
          <p className="mb-1">
            <b className="text-primary">{unpaid_aht}</b>{' '}
            <span style={{ color: '#ttt', fontSize: '12px' }}>AHT保有</span> /{' '}
            <b className="text-success">{amount_aht}</b>{' '}
            <span style={{ color: '#ttt', fontSize: '12px' }}>AHT獲得</span>
          </p>
          {other_tokens}
          <button
            className="btn btn-outline-primary btn-sm mt-3"
            onClick={async () => {
              await this.reservePayment()
            }}
          >
            トークン引き出し
          </button>
        </div>
      </div>,
    ]
  }
}

export default Profile
