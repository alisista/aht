import React, { Component } from 'react'

import Layout from '../components/layout'
import Nav from '../components/nav'
import Header from '../components/header'
import Vision from '../components/vision'
import Problems from '../components/problems'
import Strategy from '../components/strategy'
import Roadmap from '../components/roadmap'
import Members from '../components/members'
import Partnerships from '../components/partnerships'
import Token from '../components/token'
import Footer from '../components/footer'

import alis_hackers from '../assets/images/alis_hackers.png'
import alis_supporters from '../assets/images/alis_supporters.png'
class HTML extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let nav_items = [
      { name: '幻想', id: 'vision' },
      { name: '問題', id: 'problems' },
      { name: '戦略', id: 'strategy' },
      { name: '道筋', id: 'roadmap' },
      { name: '部員', id: 'members' },
      { name: '提携', id: 'partnerships' },
      { name: 'トークン', id: 'token' },
    ]
    let footer_links = [
      { key: 'twitter', href: 'https://twitter.com/alishackers' },
      { key: 'github', href: 'https://github.com/alisista' },
      { key: 'discord', href: 'https://discord.gg/TyKbbrT' },
    ]
    let visions = [
      {
        title: '創造活動によって価値を産出',
        description:
          'トークン価値を法定通貨に依存して付けるのではなく、分散型技術者組織による開発で経済圏内に価値を創造して行きます。価値を創造できる個人や団体と提携して相互に仕事の受発注をすることでトークンの循環性を高めます。ICOや取引所上場、不特定多数へのエアドロップ等を行いません。法定通貨との繋がりを持たないため、外部からの相場変動に影響されず規制とも無縁です。',
        icon: 'lightbulb',
      },
      {
        title: '学習しながら報酬を得る',
        description:
          'プログラミング習得の一番の近道は実際に動くものを作ってみることです。ハッカーコインで仕事を受注し、初g学者が実案件プロジェクトで報酬を得ながら学習できる仕組みを創ります。学習中の開発者にミッションや仕事を発注したり、今まで値段が付かなかった素人レベルの作品など、あらゆるレベルの学習・創造活動に価値を付けるトークンです。',
        icon: 'graduation-cap',
      },
      {
        title: '完全独自経済圏の構築',
        description:
          'スキルのオンラインマーケットプレイス開発や、ハッカーコインを介して物々交換プラットフォーム開発、自動報酬システムによる非中央集権DAOの構築により、ハッカーコインだけで生きていける完全独自経済圏を創り出します。また、可視化した信頼と細分化されたトークンエコノミーのネットワークを組み合わせた画期的な経済システムの構築を目指します。',
        icon: 'globe-americas',
      },
    ]
    let problems = [
      {
        title: '独自経済圏形成最大の問題点は法定通貨への依存性',
        description:
          '独自経済圏の完成は法定通貨経済圏との分離によって初めて達成される。しかし一度法定通貨でトークン価値を定められると切り離しは極めて困難になる。中央集権的取引所への上場やICOによる資金調達はトークンエコノミーによる独自経済圏形成を実質不可能にする。',
        icon: '/img/bg-showcase-1.jpg',
      },
      {
        title: '初めから法定通貨との接触点を極力排除する',
        description:
          '独自経済圏での価値はそれを共創し共通認識する経済圏参加者が決定する。外部から法定通貨によって価値を測定されトレードによって変動させられることは内部参加者にとってはノイズでしかない。完全排除は難しいが、トークン価値が外部から操作不可能なレベルに関わりを抑える。',
        icon: '/img/bg-showcase-2.jpg',
      },
      {
        title: '創造活動によって価値をゼロから創り出す',
        description:
          '法定通貨によって価値を与えないのであれば無価値なトークンに価値を付けるのは何か？それは、無から価値を創り出す創造活動、例えばハッカー部の開発力や絵師さんの作品等。創造活動の対価としてトークンを流動させていくことによって、経済圏全体の価値を一方通行で上昇させることを目指す。',
        icon: '/img/bg-showcase-3.jpg',
      },
      {
        title: '学習活動によって自己に価値を上積みし経済圏に還元',
        description:
          'もう一つ無から価値を創りだせる活動、それは学習。学習によって得た知識やスキルを使って創造活動をすることで経済圏全体の価値向上に還元できる。ハッカーコインは初学者が学習をしながらマイニングできる仕組みを創り出す。具体的には、学習ミッションを達成して報酬を受け取ったり、外部から学習プロジェクトを受注、逆にハッカー部から外部の学習者に積極的に仕事を発注も行い、本来法定通貨によって価値の付かない学習や仕事にも価値を付ける。',
        icon: '/img/bg-showcase-4.jpg',
      },
    ]
    let strategies = [
      {
        title: 'トークンSDK開発',
        subheading: 'Software Development Kit',
        image: '/img/strategy/01-thumbnail.jpg',
      },
      {
        title: 'クリエイティブ団体と提携',
        subheading: 'Partnerships',
        image: '/img/strategy/02-thumbnail.jpg',
      },
      {
        title: '各種コンテスト開催',
        subheading: 'Contests',
        image: '/img/strategy/03-thumbnail.jpg',
      },
      {
        title: 'ミッション型学習',
        subheading: 'Mission Based Learning',
        image: '/img/strategy/04-thumbnail.jpg',
      },
      {
        title: 'スキルオークション',
        subheading: 'Freelance Marketplace',
        image: '/img/strategy/05-thumbnail.jpg',
      },
      {
        title: '物々交換プラットフォーム',
        subheading: 'Listing Plagform',
        image: '/img/strategy/06-thumbnail.jpg',
      },
      {
        title: '信頼の可視化',
        subheading: 'Visualizing Trust',
        image: '/img/strategy/07-thumbnail.jpg',
      },
      {
        title: 'DApps投票システム',
        subheading: 'DApps for Voting',
        image: '/img/strategy/08-thumbnail.jpg',
      },
      {
        title: '自動開発報酬DAO',
        subheading: 'Reward Automation',
        image: '/img/strategy/09-thumbnail.jpg',
      },
    ]
    let roadmap_items = [
      {
        due: '2018年7月',
        title: 'ALISハッカー部創立',
        description:
          'ALISハッカー部はALISコミュニティのオーガニックな活動から自然発生的に設立されました。トークンエコノミーを創るのに最も難しいのはコミュニティ形成です。ハッカー部や思想を共有し活動を支持していただける他の部活動、独自経済圏を創る母体となりえる、貢献する事を善としたコミュニティが既にそこに存在していました。',
        image: '/img/road_1.jpg',
      },

      {
        due: '2018年8月',
        title: '独自トークン（AHT）発行',
        description:
          '創造活動と学習活動に価値を付けることによって、法定通貨に依存しない完全独自経済圏を創るという思想の基、ALISハッカートークンを発行。発行当初から法定通貨との関わりを最小限に抑え、外部からの投機・投資で価値が変動する事を最大限防ぎながら展開。トークンへの価値は外部からの資金流入ではなく内部での創造によって付与。',
        image: '/img/road_2.jpg',
      },
      {
        due: '2018年9月～',
        title: 'ハッカー部員増員とSDK開発',
        description:
          'ハッカー部入部者や共に価値を創造する意志のある個人や団体を精選してトークン配布。SDKを開発してハッカートークンでの取引を埋め込んだウェブサービス立ち上げを容易に。開発コンテスト・ハッカソンや他団体コンテストのスポンサーをし、ハッカー部とトークンの周知を進める。',
        image: '/img/road_3.jpg',
      },
      {
        due: '2018年9月～',
        title: 'ミッション型学習プラットフォーム',
        description:
          'ハッカー部員がミッションをこなして報酬を得たり、学習プロジェクトとして開発できる案件をハッカートークンで受注するプラットフォームを開発。学習しながら携わったプロジェクトがポートフォリオになる仕組みを構築。初心者の入部と学習を促す。',
        image: '/img/road_4.jpg',
      },
      {
        due: '2018年第4期',
        title: 'スキル交換プラットフォーム',
        description:
          '開発案件受注プラットフォームを拡張し、ココナラやFiverrのようなスキルを提供できるプラットフォームを開発。学習中の素人さんでも積極的に案件を受発注しポートフォリオを構築できる仕組みを創る。',
        image: '/img/road_5.jpg',
      },
      {
        due: '2019年～',
        title: '物々交換プラットフォーム',
        description:
          'スキル交換プラットフォームをさらに拡張し、ebayのように個人がハッカーコインを介してあらゆるものを交換できるプラットフォームを開発。これによって自分のスキルを活かした仕事でハッカーコインを獲得し、それとものを交換できるようになる。ハッカーコインのみで生活していける完全独自経済圏が完成する。',
        image: '/img/road_6.jpg',
      },
      {
        due: '2019年～',
        title: '運営を完全非中央集権化',
        description:
          '各種プラットフォームやハッカー部の組織運営等、全ての運営の完全非中央集権化を目指す。コミュニティへの貢献度をベースにした信頼可視化合意形成アルゴリズム、それによって投票ができるDApps開発、さらにはハッカー部の開発成果への報酬を自動化するDAOの構築によって完全非中央集権化を目指す。',
        image: '/img/road_7.jpg',
      },
      {
        due: '2020年～',
        title: 'お金の概念をなくした新たな経済システムを構築',
        description:
          'ハッカートークンを基軸通貨として、細分化されたトークンエコノミーのネットワークシステムを構築。ホルダーの可視化された信頼をベースに各トークン間の価値変換が自動で行われる仕組みを開発。既存の金融取引による、価値基準が不安定な経済システムに変革をもたらす。',
        image: '/img/road_8.jpg',
      },
    ]
    let members = [
      {
        name: '億ラビットくん',
        subheading: '天才仮想通貨ラッパー',
        icon:
          'https://avatars3.githubusercontent.com/u/40726926?s=400&u=f7eb21d2526545761c588a92c73ed81192c56a59&v=4',
        links: [
          { type: 'alis', id: 'ocrybit' },
          { type: 'twitter', id: 'ocrybit' },
          { type: 'github', id: 'ocrybit' },
          { type: 'youtube', id: 'UCWInRWmZYCB712-ioKbqQ4w' },
        ],
      },
      {
        name: 'ホーさん',
        subheading: 'ALIS検索エンジン開発',
        icon: 'https://avatars2.githubusercontent.com/u/40290137?s=400&v=4',
        links: [
          { type: 'alis', id: 'fukurou' },
          { type: 'twitter', id: 'hoosan16' },
          { type: 'github', id: 'ocrybit' },
          { type: 'rss', id: 'https://alisista.com/', fa_type: 'fas' },
        ],
      },
      {
        name: '尾形学士',
        subheading: '知的養蜂家',
        icon: 'https://avatars2.githubusercontent.com/u/17435600?s=400&v=4',
        links: [
          { type: 'alis', id: 'gaxiiiiiiiiiiii' },
          { type: 'twitter', id: 'gaxiiiiiiiiiiii' },
          { type: 'github', id: 'gaxiiiiiiiiiiii' },
        ],
      },
      {
        name: 'ブルーモアイ',
        subheading: '革命軍船長',
        icon: 'https://avatars2.githubusercontent.com/u/37959746?s=400&v=4',

        links: [
          { type: 'alis', id: 'zakkuri-manabu' },
          { type: 'twitter', id: 'zakkuri_manabu' },
          { type: 'github', id: 'zakkuri-manabu' },
        ],
      },
      {
        name: 'はるか先生',
        subheading: 'ICOとdAppsをビシバシ教えます',
        icon: 'https://avatars1.githubusercontent.com/u/36725428?s=400&v=4',

        links: [
          { type: 'alis', id: 'haruka' },
          { type: 'twitter', id: 'harukatarotaro' },
          { type: 'github', id: 'harukataro' },
          { type: 'rss', id: 'http://harukataro.com', fa_type: 'fas' },
        ],
      },
      {
        name: 'ヤバいWEB屋さん',
        subheading: '投資 x プログラミング',
        icon: 'https://avatars2.githubusercontent.com/u/9312373?s=460&v=4',

        links: [
          { type: 'alis', id: 'yabaiwebyasan' },
          { type: 'twitter', id: 'websamurai_en' },
          { type: 'github', id: 'yukihirai0505' },
          { type: 'rss', id: 'https://yabaiwebyasan.com/', fa_type: 'fas' },
        ],
      },
    ]
    let partnerships = [
      {},
      {
        name: 'ALIS Supporters',
        link: 'https://discordapp.com/invite/zKKNtUe',
        icon: alis_supporters,
      },
      {
        name: 'ALISハッカー部',
        link: 'https://discordapp.com/invite/TyKbbrT',
        icon: alis_hackers,
      },
      {},
    ]
    let token = [
      {
        title: 'トークン取得方法',
        subheading: 'ALISハッカートークンを獲得できる方法です',
        items: [
          {
            title: 'ハッカー部入部 100AHT',
            description:
              'ハッカー部入部意思を表示のために、当ウェブサイトにログイン、DISCORD参加、Githubオーガニゼーション招待申請などの簡単なタスクをこなすことで100AHTが付与されます。',
            image: 'door-open',
          },
          {
            title: 'ALIS記事獲得トークンに付与',
            description:
              'ログインして申請することによって、ALISで書いた記事で獲得したALISトークンの10分の1の額のAHTを取得可能です。ALISトークンと交換ではなくAHTの無償付与になります。',
            image: 'pen-nib',
          },
          {
            title: 'ALIS APIコンテスト',
            description:
              '現在開発中のALIS API Javascript/Pythonクライアントが完成次第、ALISのAPIを使った開発コンテストを開催予定です。こちらのコンテストの賞品としてAHTを贈呈します。',
            image: 'trophy',
          },
        ],
      },
      {
        title: 'トークン利用方法',
        subheading: '利用可能方法は順次追加していきます',
        items: [
          {
            title: 'ハッカー部へ開発依頼',
            description:
              'AHTでハッカー部へ開発依頼ができる仕組みを作ります。初級のプログラマーさんたちが取り組めるような学習プロジェクトも大歓迎です！',
            image: 'robot',
          },
          {
            title: 'プロジェクト発起',
            description:
              'AHTを報酬にしてプロジェクトを立ち上げられるプラットフォームを作ります。ALIS盛り上げ企画のお手伝いさんを募集したり、開発・イラスト等のスキルが必要な際にご利用ください。',
            image: 'users-cog',
          },
          {
            title: '各種ウェブサービス',
            description:
              'AHTで取引可能なウェブサービスを次々開発していきます。SDKを開発し、初級のプログラマーさんでも簡単にAHT支払いを埋め込んだウェブサービスが開発できる仕組みを作ります。',
            image: 'sitemap',
          },
        ],
      },
    ]
    return (
      <Layout>
        <Nav items={nav_items} />
        <Header />
        <Vision items={visions} />
        <Problems items={problems} />
        <Strategy items={strategies} />
        <Roadmap items={roadmap_items} />
        <Members items={members} />
        <Partnerships items={partnerships} />
        <Token items={token} />
        <Footer items={footer_links} />
      </Layout>
    )
  }
}

export default HTML
