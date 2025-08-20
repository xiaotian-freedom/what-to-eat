export default {
  // 通用
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    back: '返回',
    next: '下一步',
    skip: '跳过',
    start: '开始',
    share: '分享',
    close: '关闭',
  },

  // 页面标题
  pages: {
    home: '今天吃什么',
    result: '选择结果',
    foodManagement: '菜品管理',
    addFood: '添加菜品',
    editFood: '修改菜品',
    guide: '使用指南',
    settings: '设置',
  },

  // 按钮文本
  buttons: {
    randomFood: '随机选菜',
    addFood: '添加菜品',
    showFoodList: '菜品列表',
    chooseAgain: '再选一次',
    shareResult: '分享结果',
    startApp: '开始使用',
    nextStep: '下一步',
  },

  // 引导页面
  guide: {
    step1: {
      title: '不知道吃什么？',
      subtitle1: '点击随机按钮，让我来帮你决定！',
      subtitle2: '精美动画，高效决策，不再纠结。',
    },
    step2: {
      title: '自定义你的菜单',
      subtitle1: '添加你喜欢的菜品到列表中',
      subtitle2: '再也不用担心没有选择范围',
    },
    step3: {
      title: '准备完成',
      subtitle1: '一切就绪，开始你的美食之旅吧！',
      subtitle2: '点击开始，享受随机选菜的乐趣',
    },
  },

  // 表单相关
  form: {
    dishName: '菜品名称',
    dishNamePlaceholder: '请输入菜品名称',
    uploadImage: '上传图片',
    uploadImageTip: '点击上传菜品图片',
    imageRequired: '请上传菜品图片',
    nameRequired: '请输入菜品名称',
  },

  // 标签页
  tabs: {
    presetDishes: '预设菜品',
    customAdd: '自定义添加',
  },

  // 搜索相关
  search: {
    placeholder: '搜索菜品...',
    noResults: '没有找到相关菜品',
  },

  // 提示信息
  messages: {
    addSuccess: '添加成功',
    addFailed: '添加失败',
    editSuccess: '修改成功',
    deleteSuccess: '删除成功',
    deleteConfirm: '确定要删除这个菜品吗？',
    duplicateFood: '该菜品已存在，无需重复添加',
    noDishes: '还没有添加任何菜品',
    addDishFirst: '请先添加一些菜品',
    todayLimitReached: '今日随机次数已用完',
    challengeCompleted: '挑战完成！',
    challengeInProgress: '挑战进行中...',
    uploadSuccess: '上传成功',
    uploadFailed: '上传失败',
    uploadTokenFailed: '获取上传token失败',
    uploadRetry: '上传失败，请重试',
    copySuccess: '已复制到剪贴板',
    copyFailed: '复制失败',
    imageSizeLimit: '图片大小不能超过 10M',
  },

  // 成就系统
  achievements: {
    title: '成就',
    system: '成就系统',
    unlocked: '已解锁',
    total: '总成就',
    completion: '完成度',
    progress: '进度',
    unlockTime: '解锁时间',
    firstUse: '初次尝试',
    firstUseDesc: '第一次使用随机选菜',
    dailyStreak3: '坚持三天',
    dailyStreak3Desc: '连续使用3天',
    dailyStreak7: '一周坚持',
    dailyStreak7Desc: '连续使用7天',
    dailyStreak30: '月度达人',
    dailyStreak30Desc: '连续使用30天',
    luckyMaster: '幸运大师',
    luckyMasterDesc: '累计获得100点幸运值',
    foodExplorer: '美食探索者',
    foodExplorerDesc: '尝试过50种不同的菜品',
  },

  // 挑战系统
  challenge: {
    title: '每日挑战',
    description: '每天随机选菜3次',
    progress: '进度',
    remaining: '剩余',
    times: '次',
    completed: '已完成',
    inProgress: '进行中',
    todayLimitReached: '今日次数已用完',
    luckyValue: '幸运值',
    consecutiveDays: '连续天数',
  },

  // 设置页面
  settings: {
    title: '设置',
    language: '语言',
    languageDesc: '选择应用语言',
    version: '版本号',
    versionDesc: '当前应用版本',
    about: '关于我们',
    aboutDesc: '了解更多信息',
    languageOptions: {
      'zh-CN': '简体中文',
      'en-US': 'English',
    },
    aboutContent: {
      developer: '开发者',
      contact: '联系我们',
      email: '邮箱',
      github: 'GitHub',
    },
  },

  // 应用配置
  app: {
    name: '今天吃什么',
    description: '一个简单而有趣的随机选菜应用',
    features: {
      randomFood: '🎯 随机选菜功能',
      foodManagement: '📝 自定义菜品管理',
      achievements: '🏆 成就系统',
      dailyChallenge: '🔥 每日挑战',
      animations: '🎨 精美动画效果',
    },
  },
};
