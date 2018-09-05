import React, { Component } from 'react'

class Footer extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let link_items = []
    let items = this.props.items || [
      { key: 'twitter', href: 'https://twitter.com/alishackers' },
      { key: 'github', href: 'https://github.com/alisista' },
      { key: 'discord', href: 'https://discord.gg/TyKbbrT' },
    ]

    for (let v of items) {
      link_items.push(
        <li className="list-inline-item">
          <a href={v.href} target="_blank">
            <i className={`fab fa-${v.key}`} />
          </a>
        </li>
      )
    }
    return (
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <span className="copyright">
                Copyright &copy; ALISハッカー部 2018
              </span>
            </div>
            <div className="col-md-4">
              <ul className="list-inline social-buttons">{link_items}</ul>
            </div>
            <div className="col-md-4">
              <ul className="list-inline quicklinks" />
            </div>
          </div>
        </div>
      </footer>
    )
  }
}

export default Footer
