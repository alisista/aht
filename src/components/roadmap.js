import React, { Component } from 'react'
import { withPrefix } from 'gatsby-link'
import backgroundImage from '../assets/images/linedpaper.png'
class Roadmap extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let roadmap_items = []
    this.props.items.forEach((v, i) => {
      let inverted = ''
      if (i % 2 == 1) {
        inverted = 'timeline-inverted'
      }
      roadmap_items.push(
        <li className={inverted}>
          <div className="timeline-image">
            <img
              className="rounded-circle img-fluid"
              src={withPrefix(v.image)}
              alt=""
            />
          </div>
          <div className="timeline-panel">
            <div className="timeline-heading">
              <h4>{v.due}</h4>
              <h4 className="subheading">{v.title}</h4>
            </div>
            <div className="timeline-body">
              <p className="text-muted">{v.description}</p>
            </div>
          </div>
        </li>
      )
    })
    return (
      <section id="roadmap" style={{ background: `url(${backgroundImage})` }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h2 className="section-heading text-uppercase">
                幻想ロードマップ
              </h2>
              <h3 className="section-subheading text-muted">
                完全独自経済圏を世界最速で達成する幻想
              </h3>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <ul className="timeline">
                {roadmap_items}
                <li className="timeline-inverted">
                  <div className="timeline-image">
                    <h4 style={{ color: 'steelblue' }}>
                      共同幻想が
                      <br />
                      新しい経済圏
                      <br />
                      を創造する！
                    </h4>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default Roadmap
