import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const NavContainer = styled.nav`
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1000;
`;

const TopNav = styled.div`
  background: white;
  padding: 0 20px;
  position: relative;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TopNavContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    height: 60px;
    padding: 0 15px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const LogoIcon = styled.img`
  height: 32px;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  opacity: 0.9;
  
  @media (max-width: 768px) {
    height: 28px;
  }
`;

const LogoText = styled.span`
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  
  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 5px;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  color: #1f2937;
  text-shadow: none;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const Timer = styled.div`
  background: #f3f4f6;
  backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  border: 1px solid #d1d5db;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 6px 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 9px;
    padding: 4px 8px;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: 2px solid #3b82f6;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    border-color: #1d4ed8;
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 12px;
  }
`;

const LogoutButton = styled.button`
  background: #f3f4f6;
  backdrop-filter: blur(10px);
  color: #374151;
  border: 2px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    background: #e5e7eb;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 12px;
  }
`;

const NotificationButton = styled.button`
  background: #f3f4f6;
  backdrop-filter: blur(10px);
  color: #374151;
  border: 2px solid #d1d5db;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    background: #e5e7eb;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
`;

function Navigation({ isLoggedIn, onLoginSuccess, onLogout, userInfo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    if (timeLeft > 0 && isLoggedIn) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      setTimeLeft(30 * 60);
    } else {
      setTimeLeft(0);
    }
  }, [isLoggedIn]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeepLogin = () => {
    setTimeLeft(30 * 60);
  };

  const handleLogout = () => {
    onLogout();
    setTimeLeft(0);
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const maskUserName = (name) => {
    if (!name || name === '사용자') return name;
    if (name.length <= 1) return '*';
    return name.slice(0, -1) + '*';
  };

  return (
    <>
      <NavContainer>
        <TopNav>
          <TopNavContent>
            <Logo onClick={handleLogoClick}>
              <LogoIcon src={logo} alt="PATENTSIGHT" />
              <LogoText>PATENTSIGHT</LogoText>
            </Logo>
            <UserSection>
              {isLoggedIn ? (
                <>
                  <UserInfo>
                    <UserName>{maskUserName(userInfo?.name || '사용자')} 심사관님</UserName>
                    <Timer>로그인 시간: {formatTime(timeLeft)}</Timer>
                  </UserInfo>
                  <Button onClick={handleKeepLogin}>로그인 유지</Button>
                  <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
                  <NotificationButton>🔔</NotificationButton>
                </>
              ) : (
                <Button onClick={() => navigate('/login')}>로그인</Button>
              )}
            </UserSection>
          </TopNavContent>
        </TopNav>
      </NavContainer>
    </>
  );
}

export default Navigation;
