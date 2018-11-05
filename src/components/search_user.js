import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

import fa_alis from '../assets/images/fa-alis.png'
import image_alishackers from '../assets/images/alishackers_twitter.jpeg'
moment.locale('ja')
let prefix = process.env.FIREBASE_PROJECT_NAME
const modals = {
  error_general: {
    title: (
      <div>
        <i className="text-danger fas fa-ban" /> エラーが発生しました！
      </div>
    ),
    body: '時間を置いてからもう一度お試し下さい。',
    cancel_text: '確認',
  },
  error_nouser: {
    title: (
      <div>
        <i className="text-danger fas fa-ban" /> エラーが発生しました！
      </div>
    ),
    body: 'お探しのユーザーさんはALISに登録されていません。',
    cancel_text: '確認',
  },
}

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      candidates: [],
      no_tweeple: false,
      twitter_prifile_image: null,
      twitter_bg_image: null,
      searchedUser: null,
      searching_alis: false,
      searching_twitter: false,
    }
  }

  searchUser() {
    let user_id = window.$('#user_id').val()
    if (user_id.match(/^\s*$/) != null) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            入力エラー！
          </div>
        ),
        body: <p>ALISユーザー名を入力してください。</p>,
        cancel_text: '確認',
      })
    } else {
      this.setState({ searching_alis: true }, () => {
        this.search(user_id)
      })
    }
  }
  async addCandidate() {
    let screen_name = window.$('#candidate_id').val()
    if (screen_name.match(/^\s*$/) != null) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            入力エラー！
          </div>
        ),
        body: <p>Twitterスクリーンネームを入力してください。</p>,
        cancel_text: '確認',
      })
    } else if (
      (
        _(this.state.candidates).map(v => {
          return v.toLowerCase()
        }) || []
      ).includes(screen_name.toLowerCase())
    ) {
      this.props.showModal({
        title: (
          <div>
            <i className="text-warning fas fa-exclamation-triangle" />{' '}
            登録済みアカウント！
          </div>
        ),
        body: `${screen_name}さんはすでに候補に登録されています。`,
        cancel_text: '確認',
      })
    } else {
      this.props.auth.existsTweeple(screen_name, exists => {
        if (exists) {
          this.props.showModal({
            title: (
              <div>
                <i className="text-warning fas fa-exclamation-triangle" />{' '}
                登録済みアカウント！
              </div>
            ),
            body: `${screen_name}さんはすでに他のユーザーに登録されています。`,
            cancel_text: '確認',
          })
        } else {
          this.props.showModal({
            title: (
              <div>
                <i className="text-warning fas fa-exclamation-triangle" /> 確認
              </div>
            ),
            body: (
              <p>
                <a
                  href={`https://twitter.com/${screen_name}`}
                  className="mr-1"
                  target="_blank"
                >
                  <i className="fab fa-twitter" /> {screen_name}
                </a>
                さんを登録してよろしいですか？
              </p>
            ),
            exec_text: '実効',
            exec: () => {
              this.props.auth.addCandidate(
                screen_name,
                this.state.searchedUser,
                this
              )
            },
          })
        }
      })
    }
  }

  getTweeple() {
    const user_id = this.state.searchedUser.user_id
    this.setState({ searching_twitter: true }, () => {
      this.props.auth.searchTweeple(
        user_id,
        ss => {
          if (!ss.exists) {
            this.setState(
              { no_tweeple: true, searching_twitter: false },
              () => {
                this.props.auth.getCandidates(user_id, this)
              }
            )
          } else {
            let tweeple = ss.data()
            if (tweeple.profile_image_url != undefined) {
              let profile_image = new Image()

              profile_image.onload = () => {
                this.setState({
                  twitter_profile_image: tweeple.profile_image_url,
                })
              }
              profile_image.onerror = () => {}

              profile_image.src = tweeple.profile_image_url.replace(
                /_normal/,
                ''
              )
              let bg_image = new Image()

              bg_image.onload = () => {
                this.setState({
                  twitter_bg_image: tweeple.profile_banner_url,
                })
              }
              bg_image.onerror = () => {
                this.setState({
                  twitter_bg_image:
                    'http://abs.twimg.com/images/themes/theme1/bg.png',
                })
              }

              bg_image.src = tweeple.profile_banner_url
            }
            this.setState({
              twitter_bg_image: null,
              twitter_profile_image: null,
              tweeple: tweeple,
              searching_twitter: false,
              no_tweeple: false,
            })
          }
        },
        e => {
          console.log(e)
          this.setState({ searching_twitter: false })
          this.props.showModal(modals.error_general)
        }
      )
    })
  }
  search(user_id) {
    fetch(
      `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/get_user/${user_id}`,
      {
        method: 'GET',
      }
    )
      .then(res => res.json())
      .then(json => {
        this.setState({ searching_alis: false }, () => {
          if (json.error == undefined && json.user != undefined) {
            this.setState(
              {
                searchedUser: json.user,
                tweeple: null,
                twitter_profile_image: null,
                twitter_bg_image: null,
              },
              () => {
                this.getTweeple()
              }
            )
          } else {
            this.props.showModal(modals.error_nouser)
          }
        })
      })
      .catch(() => {
        this.setState({ searching_alis: false }, () => {
          this.props.showModal(modals.error_general)
        })
      })
  }
  render() {
    let user_icon, twitter, user_icon_twitter, alis
    let user_description = `ALISのユーザー名を検索するとそのALISISTAのツイッターアカウントを表示します。`
    let user_description_twitter = ``
    let searchTwitter
    let candidates
    let search_addon =
      'ログインをするとツイッターアカウントをリストに追加することができます！'

    if (this.state.no_tweeple) {
      if (this.props.user != undefined) {
        if (
          this.state.candidates != undefined &&
          this.state.candidates.length !== 0
        ) {
          let twitter_candidates = []
          for (let v of this.state.candidates) {
            twitter_candidates.push(
              <a
                href={`https://twitter.com/${v}`}
                target="_blank"
                className="m-2"
              >
                <i className="fab fa-twitter mr-1" />
                {v}
              </a>
            )
          }
          candidates = (
            <div className="mt-4">
              <div className="mb-3">現在登録確認中の候補</div>
              {twitter_candidates}
            </div>
          )
        }
        search_addon = `下記ボックスから登録すると確認作業後にリストに追加されます。`
        searchTwitter = (
          <div className="input-group">
            <input
              id="candidate_id"
              placeholder="ツイッタースクリーンネーム"
              type="text"
              className="form-control"
            />
            <span className="input-group-append">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  this.addCandidate()
                }}
              >
                ツイッター登録
              </button>
            </span>
          </div>
        )
      }
      user_description_twitter = (
        <span className="text-danger">
          {this.state.searchedUser.user_display_name}
          さん(@
          {this.state.searchedUser.user_id}
          )のツイッターアカウントは見つかりませんでした。
          {search_addon}
        </span>
      )
    }
    let user_name = (
      <a className="text-dark" style={{ cursor: 'default' }}>
        Who am I ?
      </a>
    )
    let twitter_stats
    let user_name_twitter = (
      <a className="text-dark" style={{ cursor: 'default' }}>
        ツイッターアカウント
      </a>
    )

    let twitter_default_image =
      'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png'
    let twitter_background_image = image_alishackers
    let alis_default_image = `https://alis.to/d/nuxt/dist/img/icon_user_noimg.d5f3940.png`
    twitter = (
      <p className="mb-2" style={{ fontSize: '20px' }}>
        <a className="text-muted">Twitter</a>
      </p>
    )
    if (this.state.tweeple != undefined) {
      twitter_stats = (
        <div className="row">
          <div className="col-4">
            <div className="small text-muted">ツイート</div>
            <div>
              <b className="text-primary" style={{ fontSize: '22px' }}>
                {this.state.tweeple.statuses_count}
              </b>
            </div>
          </div>
          <div className="col-4">
            <div className="small text-muted">フォロー</div>
            <div>
              <b className="text-primary" style={{ fontSize: '22px' }}>
                {this.state.tweeple.friends_count}
              </b>
            </div>
          </div>
          <div className="col-4">
            <div className="small text-muted">フォロワー</div>
            <div>
              <b className="text-primary" style={{ fontSize: '22px' }}>
                {this.state.tweeple.followers_count}
              </b>
            </div>
          </div>
        </div>
      )
      if (this.state.twitter_profile_image) {
        twitter_default_image = this.state.twitter_profile_image.replace(
          /_normal/,
          ''
        )
      }
      if (this.state.twitter_bg_image != undefined) {
        twitter_background_image = this.state.twitter_bg_image
      }
      user_name_twitter = (
        <a
          href={`https://twitter.com/${this.state.tweeple.screen_name}`}
          target="_blank"
          className="text-dark"
        >
          {this.state.tweeple.name}
        </a>
      )
      user_description_twitter = this.state.tweeple.description
      twitter = (
        <p className="mb-2" style={{ fontSize: '20px' }}>
          <a
            href={`https://twitter.com/${this.state.tweeple.screen_name}`}
            target="_blank"
            className="text-muted"
          >
            @{this.state.tweeple.screen_name}
          </a>
        </p>
      )
    }
    alis = (
      <p className="mb-2" style={{ fontSize: '20px' }}>
        <a className="text-muted">ALIS</a>
      </p>
    )

    if (this.state.searchedUser != undefined) {
      if (this.state.searchedUser.icon_image_url != undefined) {
        alis_default_image = this.state.searchedUser.icon_image_url
      }
      user_name = (
        <a
          href={`https://alis.to/users/${this.state.searchedUser.user_id}`}
          target="_blank"
          className="text-dark"
        >
          {this.state.searchedUser.user_display_name}
        </a>
      )
      user_description = this.state.searchedUser.self_introduction

      alis = (
        <p className="mb-2" style={{ fontSize: '20px' }}>
          <a
            href={`https://alis.to/users/${this.state.searchedUser.user_id}`}
            target="_blank"
            className="text-muted"
          >
            @{this.state.searchedUser.user_id}
          </a>
        </p>
      )
    }
    let searching_user = (
      <i
        className="card-profile-img fas fa-spin fa-sync-alt"
        style={{
          marginTop: '-5rem',
          width: '96px',
          height: '96px',
          paddingTop: '15px',
          paddingBottom: '15px',
          marginBottom: '5px',
          backgroundColor: 'orange',
          color: 'white',
          fontSize: '60px',
        }}
      />
    )
    let card_body_alis_style = {}
    let card_body_twitter_style = {}
    let angle_style = {}
    if (
      this.state.searching_alis == true ||
      this.state.searching_twitter == true
    ) {
      angle_style = { color: '#333' }
    }
    if (this.state.searching_alis == true) {
      card_body_alis_style = { paddingTop: 0, marginTop: '-1px' }
      user_icon = searching_user
    } else {
      user_icon = (
        <img
          className="card-profile-img"
          src={alis_default_image}
          style={{
            width: '96px',
            height: '96px',
            marginBottom: '5px',
            backgroundColor: 'white',
          }}
        />
      )
    }
    if (this.state.searching_twitter == true) {
      card_body_twitter_style = { paddingTop: 0, marginTop: '-1px' }
      user_icon_twitter = searching_user
    } else {
      user_icon_twitter = (
        <img
          className="card-profile-img"
          src={twitter_default_image}
          style={{
            height: '96px',
            width: '96px',
            marginBottom: '5px',
            backgroundColor: 'white',
          }}
        />
      )
    }
    return [
      <div className="col-md-6 col-lg-5">
        <div className="card card-profile">
          <div
            className="card-header"
            style={{ backgroundImage: 'url(/img/bg-showcase-4.jpg)' }}
          />
          <div className="card-body text-center" style={card_body_alis_style}>
            {user_icon}
            {alis}
            <h3 className="mb-3">
              <div
                className="d-inline-block mr-2 text-center"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: '#858DDA',
                }}
              >
                <img
                  src={fa_alis}
                  style={{
                    height: '20px',
                    marginTop: '-2px',
                    display: 'inline-block',
                  }}
                />
              </div>

              {user_name}
            </h3>
            <p className="mb-4">{user_description}</p>

            <div className="input-group">
              <input
                id="user_id"
                placeholder="ALISユーザー名"
                type="text"
                className="form-control"
              />
              <span className="input-group-append">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    this.searchUser()
                  }}
                >
                  ユーザー検索
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>,
      <div
        className="d-none d-lg-block col-lg-2"
        style={{ textAlign: 'center', marginTop: '96px' }}
      >
        <span
          className="avatar"
          style={{
            fontSize: '70px',
            width: '96px',
            paddingTop: '5px',
            paddingLeft: '5px',
            height: '96px',
          }}
        >
          <i className="fa fa-angle-double-right" style={angle_style} />
        </span>
      </div>,
      <div className="col-md-6 col-lg-5">
        <div className="card card-profile">
          <div
            className="card-header"
            style={{ backgroundImage: `url(${twitter_background_image})` }}
          />
          <div
            className="card-body text-center"
            style={card_body_twitter_style}
          >
            {user_icon_twitter}
            <div className="clearfix" />
            {twitter}
            <h3 className="mb-3">
              <div
                className="d-inline-block mr-2 text-center text-primary"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  marginRight: '5px',
                }}
              >
                <i className="fab fa-twitter" />
              </div>

              {user_name_twitter}
            </h3>
            <p className="mb-4">{user_description_twitter}</p>
            {searchTwitter}
            {candidates}
            {twitter_stats}
          </div>
        </div>
      </div>,
    ]
  }
}

export default Profile
