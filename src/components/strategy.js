import React, { Component } from 'react'
import { withPrefix } from 'gatsby-link'

class Strategy extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let strategy_items = []
    this.props.items.forEach((v, i) => {
      strategy_items.push(
        <div className="col-md-4 col-sm-6 strategy-item">
          <a className="strategy-link">
            <div className="strategy-hover">
              <div className="strategy-hover-content">
                <i className="fa fa-plus fa-3x" />
              </div>
            </div>
            <img className="img-fluid" src={withPrefix(v.image)} alt="" />
          </a>
          <div className="strategy-caption">
            <h4>{v.title}</h4>
            <p className="text-muted">{v.subheading}</p>
          </div>
        </div>
      )
    })
    return (
      <section className="bg-light" id="strategy">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h2 className="section-heading text-uppercase">
                トークン価値創造戦略
              </h2>
              <h3 className="section-subheading text-muted">
                価値を創造できる人・団体と連携しトークンを循環させる
              </h3>
            </div>
          </div>
          <div className="row">{strategy_items}</div>
        </div>
      </section>
    )
  }
}

export default Strategy
