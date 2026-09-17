import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import LoginModal from './components/user/LoginModal';
import './app.scss';

function App({ children }: { children: React.ReactNode }) {
  const { checkLoginStatus } = useAuthStore();

  useEffect(() => {
    // 应用启动时检查登录状态
    checkLoginStatus();
  }, []);

  return (
    <>
      {children}
      {/* 全局登录弹窗 */}
      <LoginModal />
    </>
  );
}

export default App;
