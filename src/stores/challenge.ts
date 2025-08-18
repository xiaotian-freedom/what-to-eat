import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 成就类型
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockDate?: string;
  progress: number;
  maxProgress: number;
}

// 挑战数据
export interface ChallengeData {
  dailyUses: number;
  maxDailyUses: number;
  lastResetDate: string;
  luckyValue: number;
  totalUses: number;
  consecutiveDays: number;
  achievements: Achievement[];
}

export const useChallengeStore = defineStore('challenge', () => {
  // 挑战数据
  const challengeData = ref<ChallengeData>({
    dailyUses: 0,
    maxDailyUses: 3,
    lastResetDate: '',
    luckyValue: 0,
    totalUses: 0,
    consecutiveDays: 0,
    achievements: [
      {
        id: 'first_use',
        name: '初次尝试',
        description: '第一次使用随机选菜',
        icon: '🎯',
        isUnlocked: false,
        progress: 0,
        maxProgress: 1,
      },
      {
        id: 'daily_streak_3',
        name: '坚持三天',
        description: '连续使用3天',
        icon: '🔥',
        isUnlocked: false,
        progress: 0,
        maxProgress: 3,
      },
      {
        id: 'daily_streak_7',
        name: '一周坚持',
        description: '连续使用7天',
        icon: '🌟',
        isUnlocked: false,
        progress: 0,
        maxProgress: 7,
      },
      {
        id: 'daily_streak_30',
        name: '月度达人',
        description: '连续使用30天',
        icon: '👑',
        isUnlocked: false,
        progress: 0,
        maxProgress: 30,
      },
      {
        id: 'lucky_master',
        name: '幸运大师',
        description: '累计获得100点幸运值',
        icon: '🍀',
        isUnlocked: false,
        progress: 0,
        maxProgress: 100,
      },
      {
        id: 'food_explorer',
        name: '美食探索者',
        description: '尝试过50种不同的菜品',
        icon: '🌍',
        isUnlocked: false,
        progress: 0,
        maxProgress: 50,
      },
    ],
  });

  // 计算属性
  const canUseToday = computed(
    () => challengeData.value.dailyUses < challengeData.value.maxDailyUses
  );
  const remainingUses = computed(
    () => challengeData.value.maxDailyUses - challengeData.value.dailyUses
  );
  const progressPercentage = computed(
    () => (challengeData.value.dailyUses / challengeData.value.maxDailyUses) * 100
  );

  // 从localStorage加载数据
  const loadChallengeData = (): void => {
    try {
      const stored = localStorage.getItem('challengeData');
      if (stored) {
        const data = JSON.parse(stored);
        challengeData.value = { ...challengeData.value, ...data };
      }
      checkAndResetDaily();
    } catch (error) {
      console.error('加载挑战数据出错:', error);
    }
  };

  // 保存数据到localStorage
  const saveChallengeData = (): void => {
    try {
      localStorage.setItem('challengeData', JSON.stringify(challengeData.value));
    } catch (error) {
      console.error('保存挑战数据出错:', error);
    }
  };

  // 检查并重置每日使用次数
  const checkAndResetDaily = (): void => {
    const today = new Date().toDateString();
    const lastReset = challengeData.value.lastResetDate;

    if (lastReset !== today) {
      // 如果是新的一天
      if (lastReset) {
        // 检查是否连续使用
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastReset === yesterdayStr) {
          // 连续使用，增加连续天数
          challengeData.value.consecutiveDays++;
        } else {
          // 中断了，重置连续天数
          challengeData.value.consecutiveDays = 1;
        }
      } else {
        // 第一次使用
        challengeData.value.consecutiveDays = 1;
      }

      // 重置每日使用次数
      challengeData.value.dailyUses = 0;
      challengeData.value.lastResetDate = today;
      saveChallengeData();
    }
  };

  // 使用随机选菜
  const useRandomFood = (): boolean => {
    checkAndResetDaily();

    if (!canUseToday.value) {
      return false;
    }

    challengeData.value.dailyUses++;
    challengeData.value.totalUses++;

    // 增加幸运值（每次使用增加1-3点）
    const luckyGain = Math.floor(Math.random() * 3) + 1;
    challengeData.value.luckyValue += luckyGain;

    saveChallengeData();
    checkAchievements();

    return true;
  };

  // 检查成就
  const checkAchievements = (): void => {
    const achievements = challengeData.value.achievements;

    // 检查各种成就
    achievements.forEach(achievement => {
      if (achievement.isUnlocked) return;

      switch (achievement.id) {
        case 'first_use':
          if (challengeData.value.totalUses >= 1) {
            unlockAchievement(achievement.id);
          }
          break;
        case 'daily_streak_3':
          achievement.progress = challengeData.value.consecutiveDays;
          if (challengeData.value.consecutiveDays >= 3) {
            unlockAchievement(achievement.id);
          }
          break;
        case 'daily_streak_7':
          achievement.progress = challengeData.value.consecutiveDays;
          if (challengeData.value.consecutiveDays >= 7) {
            unlockAchievement(achievement.id);
          }
          break;
        case 'daily_streak_30':
          achievement.progress = challengeData.value.consecutiveDays;
          if (challengeData.value.consecutiveDays >= 30) {
            unlockAchievement(achievement.id);
          }
          break;
        case 'lucky_master':
          achievement.progress = challengeData.value.luckyValue;
          if (challengeData.value.luckyValue >= 100) {
            unlockAchievement(achievement.id);
          }
          break;
      }
    });

    saveChallengeData();
  };

  // 解锁成就
  const unlockAchievement = (achievementId: string): void => {
    const achievement = challengeData.value.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockDate = new Date().toISOString();
      // 这里可以触发成就解锁的UI提示
    }
  };

  // 获取幸运值加成（影响随机选择的权重）
  const getLuckyBonus = (): number => {
    return Math.min(challengeData.value.luckyValue / 10, 0.3); // 最多30%的加成
  };

  // 重置挑战数据（用于测试）
  const resetChallengeData = (): void => {
    challengeData.value = {
      dailyUses: 0,
      maxDailyUses: 3,
      lastResetDate: '',
      luckyValue: 0,
      totalUses: 0,
      consecutiveDays: 0,
      achievements: challengeData.value.achievements.map(a => ({
        ...a,
        isUnlocked: false,
        unlockDate: undefined,
        progress: 0,
      })),
    };
    saveChallengeData();
  };

  return {
    challengeData,
    canUseToday,
    remainingUses,
    progressPercentage,
    loadChallengeData,
    useRandomFood,
    getLuckyBonus,
    resetChallengeData,
  };
});
