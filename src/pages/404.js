import React, { Component } from 'react'
import Helmet from '../components/helmet'
import Header_Home from '../components/header_home'
import Layout from '../components/layout'
import Footer from '../components/footer'
import image_404 from '../assets/images/404.jpg'

class NotFoundPage extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.resizeImage()
    setTimeout(() => {
      this.resizeImage()
    }, 100)
    window.$(window).ready(() => {
      this.resizeImage()
    })
    window.$(window).on('resize', () => {
      console.log('esized')
      this.resizeImage()
    })
  }
  resizeImage() {
    let height =
      window.$(window).height() -
      window.$('.header').outerHeight() -
      window.$('footer').outerHeight()
    window.$('#404').height(height)
    window.$('#404-wrapper').height(height)
  }
  render() {
    let nav_links = [
      { name: 'トークン', href: '/home/' },
      { name: 'ALIS', href: '/rankings/alis/' },
      { name: 'note', href: '/rankings/note/' },
      { name: '企画', href: '/rankings/note/tag?alis' },
      { name: 'whoami', href: '/whoami/' },
    ]
    return (
      <Layout>
        <Helmet />
        <Header_Home
          noSubHeader={true}
          links={nav_links}
          user={{
            photoURL:
              'https://avatars0.githubusercontent.com/u/43112647?s=96&v=4',
            displayName: 'by マミィさん 史上初！',
            overrideText: (
              <span>
                <span className="text-danger">300AHT</span> でお支払いのイラスト
              </span>
            ),
            linkTo: 'https://twitter.com/tabimama00',
          }}
        />
        <div id="404-wrapper" style={{ width: '100%', overflow: 'hidden' }}>
          <div
            id="404"
            style={{
              backgroundSize: 'cover',
              backgroundPosition: 'right top',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              backgroundImage: `url(${image_404})`,
            }}
          />
        </div>
        <Footer />
      </Layout>
    )
  }
}

export default NotFoundPage
