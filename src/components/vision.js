import React, { Component } from 'react'
import backgroundImage from '../assets/images/linedpaper.png'
class Vision extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let vision_groups = []
    let vision_items = []
    this.props.items.forEach((v, i) => {
      if (i % 3 == 0) {
        vision_groups.push([])
      }
      vision_groups[vision_groups.length - 1].push(
        <div className="col-md-4">
          <span className="fa-stack fa-4x">
            <i className="fa fa-circle fa-stack-2x text-primary" />
            <i className={`fa fa-${v.icon} fa-stack-1x fa-inverse`} />
          </span>
          <h4 className="service-heading">{v.title}</h4>
          <p className="text-muted">{v.description}</p>
        </div>
      )
    })
    vision_groups.forEach(v => {
      vision_items.push(<div className="row text-center">{v}</div>)
    })
    return (
      <section id="vision" style={{ background: `url(${backgroundImage})` }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h2 className="section-heading text-uppercase">
                ビジョン / 共同幻想
              </h2>
              <h3 className="section-subheading text-muted">
                好きなことを追求するだけで生きていける完全独自経済圏の創造
              </h3>
            </div>
          </div>
          {vision_items}
        </div>
      </section>
    )
  }
}

export default Vision
