import React from 'react'
class Tip {
  constructor(component) {
    this.component = component
    console.log(this)
  }
  // indie
  async increaseTipAmount(amount) {
    let tip = Math.round((this.component.state.tip + amount) * 10) / 10
    let { currentAHT, afterAHT } = this.getCurrentAHT(
      this.component.state.selected_token
    )
    if (currentAHT - tip >= 0) {
      await this.component.set({ tip: tip })
      let { currentAHT, afterAHT } = this.getCurrentAHT(
        this.component.state.selected_token
      )
      window.$('#tip_amount').text(this.component.state.tip)
      window.$('#currentAHT').text(currentAHT)
      window.$('#afterAHT').text(afterAHT)
      window.$('#modal_exec_btn').removeClass('btn-gray')
      window.$('#modal_exec_btn').addClass('btn-danger')
    }
  }
  async resetTipAmount() {
    await this.component.set({ tip: 0 })
    let { currentAHT, afterAHT } = this.getCurrentAHT(
      this.component.state.selected_token
    )
    window.$('#selected_token_name').text(this.getSelectedTokenName())
    window.$('#tip_amount').text(this.component.state.tip)
    window.$('#currentAHT').text(currentAHT)
    window.$('#afterAHT').text(afterAHT)
    window.$('#modal_exec_btn').removeClass('btn-danger')
    window.$('#modal_exec_btn').addClass('btn-gray')
  }
  async allIn() {
    let { currentAHT, afterAHT } = this.getCurrentAHT(
      this.component.state.selected_token
    )
    await this.component.set({ tip: currentAHT })
    window.$('#selected_token_name').text(this.getSelectedTokenName())
    window.$('#tip_amount').text(this.component.state.tip)
    window.$('#currentAHT').text(currentAHT)
    window.$('#afterAHT').text(0)
    window.$('#modal_exec_btn').removeClass('btn-gray')
    window.$('#modal_exec_btn').addClass('btn-danger')
  }

  getSelectedTokenName() {
    let token = this.component.state.selected_token
    if (token === 'aht') {
      return 'AHT'
    } else {
      return this.component.state.serverInfo.amount[token].name
    }
  }
  round(num) {
    const divider = 100000000
    return Math.round(num * divider) / divider
  }
  getCurrentAHT(token = 'aht') {
    const divider = 100000000
    let amount = this.component.state.serverInfo.amount[token]
    if (amount == undefined) {
      return { currentAHT: 0, afterAHT: 0 }
    } else {
      let earned = amount.earned + (amount.tipped || 0)
      let paid = amount.paid + (amount.tip || 0)
      let currentAHT = Math.round((earned - paid) * divider) / divider
      let payment = this.component.state.payment || []
      for (let v of payment) {
        if (v != undefined && v.status == 'requested') {
          let asset = 'aht'
          if (v.asset.assetId != undefined) {
            asset = v.asset.assetId
          }
          if (asset === token) {
            currentAHT -= v.amount
            currentAHT = this.round(currentAHT)
          }
        }
      }
      let afterAHT =
        Math.round((currentAHT - this.component.state.tip) * divider) / divider
      return { currentAHT: currentAHT, afterAHT: afterAHT }
    }
  }
  async tip(article, address) {
    let action = '投げ銭'
    if (article === true) {
      action = '引き出し'
    }
    if (this.component.state.user == undefined && article !== true) {
      this.component.showModal({
        title: (
          <div>
            <i className="text-danger fa fa-donate" /> エラー！
          </div>
        ),
        body: (
          <p>
            {action}
            をするにはログインが必要です！
          </p>
        ),
        cancel_text: '確認',
      })
    } else if (
      this.component.state.serverInfo != undefined &&
      this.component.state.serverInfo.alis != undefined &&
      article.user_id === this.component.state.serverInfo.alis.user_id &&
      article !== true
    ) {
      this.component.showModal({
        title: (
          <div>
            <i className="text-danger fa fa-donate" /> エラー！
          </div>
        ),
        body: <p>自分の記事には投げ錢できません！</p>,
        cancel_text: '確認',
      })
    } else {
      const available_tokens = await this.getAvailableTokens()
      let { currentAHT, afterAHT } = this.getCurrentAHT(
        this.component.state.selected_token
      )
      if (available_tokens.length === 0) {
        let message = `${action}銭をするにはトークンを保有している必要があります！`
        this.component.showModal({
          title: (
            <div>
              <i className="text-danger fa fa-donate" /> 残高不足！
            </div>
          ),
          body: <p>{message}</p>,
          cancel_text: '確認',
        })
      } else {
        await this.component.set({ tip: 0 })
        let tips = [0.1, 1, 10, 100]
        let tips_html = []
        tips_html.push(
          <button
            className="btn btn-warning m-2"
            style={{ borderRadius: '50%', width: '55px', height: '55px' }}
            onClick={() => {
              this.resetTipAmount()
            }}
          >
            0
          </button>
        )
        for (let v of tips) {
          tips_html.push(
            <button
              className="btn btn-primary m-2"
              style={{ borderRadius: '50%', width: '55px', height: '55px' }}
              onClick={() => {
                this.increaseTipAmount(v)
              }}
            >
              {v}
            </button>
          )
        }
        tips_html.push(
          <button
            className="btn btn-danger m-2"
            style={{ borderRadius: '50%', width: '55px', height: '55px' }}
            onClick={() => {
              this.allIn()
            }}
          >
            ALL
          </button>
        )
        window.$('#tip_amount').text(0)
        window.$('#currentAHT').text(currentAHT)
        window.$('#afterAHT').text(currentAHT)
        window.$('#modal_exec_btn').removeClass('btn-danger')
        window.$('#modal_exec_btn').addClass('btn-gray')
        this.component.showModal({
          title: (
            <div>
              <i className="text-primary fa fa-donate" /> {action}
              額を選択してください！
            </div>
          ),
          body: (
            <div>
              <div className="text-center" style={{ fontSize: '30px' }}>
                <b id="tip_amount" className="text-primary">
                  0
                </b>{' '}
                <span
                  id="selected_token_name"
                  className="text-muted small"
                  style={{ fontSize: '12px' }}
                >
                  {this.getSelectedTokenName()}
                </span>
              </div>
              <div className="text-center">{tips_html}</div>
              <div className="text-center mt-2">
                保有:{' '}
                <b className="text-primary" id="currentAHT">
                  {currentAHT}
                </b>{' '}
                <i className="fa fa-angle-double-right" />{' '}
                <b className="text-danger" id="afterAHT">
                  {currentAHT}
                </b>{' '}
              </div>
            </div>
          ),
          extra_footer: (
            <select
              onChange={async e => {
                await this.component.set({ selected_token: e.target.value })
                this.resetTipAmount()
              }}
              className="form-control d-inline-block"
              style={{ width: '200px' }}
            >
              {available_tokens}
            </select>
          ),
          exec_color: 'gray',
          exec: () => {
            if (article === true) {
              let asset_name = 'AHT'
              let selected_token = this.component.state.selected_token
              if (selected_token != 'aht') {
                if (selected_token === 'WAVES') {
                  asset_name = 'WAVES'
                } else {
                  for (let k in this.component.state.serverInfo.amount || {}) {
                    if (k === selected_token) {
                      asset_name = this.component.state.serverInfo.amount[k]
                        .name
                    }
                  }
                }
              }
              this.component.auth.registerPayment(
                this.component.state.tip,
                address,
                this.component.state.selected_token,
                asset_name
              )
            } else {
              this.exec_tip(article)
            }
          },
        })
      }
    }
  }
  getTokenStatus() {
    let tokens = []
    if (this.component.state.serverInfo != undefined) {
      for (let k in this.component.state.serverInfo.amount) {
        let currentAmount = this.getCurrentAHT(k)
        if (currentAmount.currentAHT > 0) {
          let token = this.component.state.serverInfo.amount[k]
          let token_name = token.name
          if (k == 'WAVES') {
            token_name = 'WAVES'
          }
          tokens.push({
            token: k,
            amount: currentAmount,
            name: token_name || 'AHT',
          })
        }
      }
    }
    return tokens
  }
  async getAvailableTokens() {
    let tokens = []
    let firstToken = null
    let existsSelected = false
    if (this.component.state.serverInfo != undefined) {
      for (let k in this.component.state.serverInfo.amount) {
        let currentAmount = this.getCurrentAHT(k)
        if (currentAmount.currentAHT > 0) {
          if (firstToken === null) {
            firstToken = k
          }

          let token = this.component.state.serverInfo.amount[k]
          let selected = ''
          if (k === this.component.state.selected_token) {
            selected = 'selected'
            existsSelected = true
          }
          let token_name = token.name
          if (k == 'WAVES') {
            token_name = 'WAVES'
          }
          tokens.push(
            <option selected={selected} value={k}>
              {token_name || 'ALIS HackerToken'}
            </option>
          )
        }
      }
    }
    if (firstToken !== null && existsSelected === false) {
      await this.component.set({ selected_token: firstToken })
      return this.getAvailableTokens()
    } else {
      return tokens
    }
  }
  exec_tip(article) {
    if (this.component.state.tip > 0) {
      let selected_token = this.component.state.selected_token
      this.component.auth.tip(
        this.component.state.tip,
        article,
        this.component.state.magazine.file_id,
        selected_token
      )
    }
  }
}

export default Tip
