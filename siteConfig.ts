// siteConfig.ts - 全站配置中心（前端兜底配置，优先使用数据库中的站点配置）


export const siteConfig = {
  // 网站标题与博主信息
  title: "My Blog",
  url: "https://example.com/",
  authorName: "PAFF",
  bio: "欢迎来到我的博客",
  // 头像设置
  avatarUrl: "/images/paff-avatar.webp?v=1",
  // 头像点击跳转链接（后台站点配置 websiteUrl，空则不跳转）
  websiteUrl: "",
  // 背景设置
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"],
  bgImages: [],
  defaultPostCover: "",
  photoWallImage: "",
  cloudMusicPlaylistId: "",
  cloudMusicIds: [],
  apiBaseUrl: "",
  social: { github: "", bilibili: "", email: "", x: "", youtube: "" },
  buildDate: "2026-11-24T22:30:00+08:00",
  icpConfig: { name: "", link: "" },
  moeIcpConfig: { name: "", link: "" },
  chatterTitle: "留言",
  chatterDescription: "记录生活、技术与随想",
};
