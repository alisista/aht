import React, { Component } from 'react'

class Header_Home extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let user
    if (this.props.user != undefined) {
      let aht = '0.00000000'
      if (
        this.props.serverInfo != undefined &&
        this.props.serverInfo.amount != undefined &&
        this.props.serverInfo.amount.aht != undefined
      ) {
        aht = `${this.props.serverInfo.amount.aht.earned}.00000000`
      }
      user = (
        <a
          href="#"
          className="nav-link pr-0 leading-none"
          data-toggle="dropdown"
        >
          <span
            className="avatar"
            style={{
              backgroundImage: `url(${this.props.user.photoURL})`,
            }}
          />
          <span className="ml-2 d-none d-lg-block">
            <span className="text-default">{this.props.user.displayName}</span>
            <small className="text-muted d-block mt-1">{aht} AHT</small>
          </span>
        </a>
      )
    }
    return (
      <div className="page">
        <div className="flax-fill">
          <div className="header py-4">
            <div className="container">
              <div className="d-flex">
                <a className="header-brand" href="/">
                  ALIS HackerToken
                </a>
                <div className="d-flex order-lg-2 ml-auto">
                  <div className="dropdown">
                    {user}
                    <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                      <a
                        className="dropdown-item"
                        onClick={() => {
                          this.props.auth.logout()
                        }}
                      >
                        <i className="dropdown-icon fe fe-log-out" /> ログアウト
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Header_Home
