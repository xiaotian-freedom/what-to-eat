import { ref } from 'vue';
import { useRouter } from 'vue-router';

// 全局登录提示状态
const showLoginPrompt = ref(false);

export function useLoginPrompt() {
  const router = useRouter();

  /**
   * 显示登录提示弹窗
   */
  const showLoginPromptModal = () => {
    showLoginPrompt.value = true;
  };

  /**
   * 隐藏登录提示弹窗
   */
  const hideLoginPromptModal = () => {
    showLoginPrompt.value = false;
  };

  /**
   * 处理登录提示弹窗的取消事件
   */
  const handleLoginPromptCancel = () => {
    hideLoginPromptModal();
  };

  /**
   * 处理登录提示弹窗的登录事件
   */
  const handleLoginPromptLogin = () => {
    hideLoginPromptModal();
    // 跳转到登录页
    router.push('/login');
  };

  return {
    // 状态
    showLoginPrompt,

    // 方法
    showLoginPromptModal,
    hideLoginPromptModal,
    handleLoginPromptCancel,
    handleLoginPromptLogin,
  };
}
