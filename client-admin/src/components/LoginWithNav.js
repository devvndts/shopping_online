import { useNavigate } from 'react-router-dom';
import Login from './LoginComponent';

/**
 * Cho phép chuyển tới dashboard sau khi đăng nhập (cần nằm trong BrowserRouter).
 */
export default function LoginWithNav() {
  const navigate = useNavigate();
  return (
    <Login
      onSuccess={() => navigate('/admin/home', { replace: true })}
    />
  );
}
