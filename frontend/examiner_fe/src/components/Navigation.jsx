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

const MenuNav = styled.div`
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 0 20px;
  position: relative;
`;

const MenuNavContent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  height: 50px;
  gap: 30px;
  
  @media (max-width: 768px) {
    height: 40px;
    padding: 0 10px;
    gap: 20px;
    overflow-x: auto;
  }
`;

const MenuItem = styled.a`
  color: #666;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  
  &:hover {
    color: #0066cc;
    border-bottom-color: #0066cc;
  }
  
  &.active {
    color: #0066cc;
    border-bottom-color: #0066cc;
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    white-space: nowrap;
  }
`;

// 사이드 메뉴 스타일
const SideMenu = styled.div`
  position: fixed;
  top: 0;
  left: ${props => props.$isOpen ? '0' : '-300px'};
  width: 300px;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: left 0.3s ease;
  overflow-y: auto;
`;

const SideMenuHeader = styled.div`
  background: #0066cc;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SideMenuTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const SideMenuContent = styled.div`
  padding: 20px;
`;

const SideMenuSection = styled.div`
  margin-bottom: 30px;
`;

const SideMenuSectionTitle = styled.h4`
  color: #0066cc;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #0066cc;
  cursor: pointer; // 추가
  transition: color 0.2s; // 추가

  &:hover {
    color: #0052a3; // 추가
  }
`;

const SideMenuItem = styled.a`
  display: block;
  color: #333;
  text-decoration: none;
  padding: 10px 0;
  font-size: 14px;
  transition: color 0.2s;
  
  &:hover {
    color: #0066cc;
  }
`;

const SideMenuSubItem = styled.a`
  display: block;
  color: #666;
  text-decoration: none;
  padding: 8px 0 8px 20px;
  font-size: 13px;
  transition: color 0.2s;
  
  &:hover {
    color: #0066cc;
  }
`;

const SubMenuItem = styled.div`
  padding: 10px 15px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f9fa;
    color: #0066cc;
  }
`;

// 소분류 드롭다운 스타일
const SubMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  display: ${props => props.$isVisible ? 'block' : 'none'};
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

function Navigation({ isLoggedIn, onLoginSuccess, onLogout, userInfo }) { // props 추가
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

        <SubNav>
          <SubNavContent>
            <SubNavLeft>
              <HamburgerMenu onClick={toggleSideMenu}>
                <HamburgerLine />
                <HamburgerLine />
                <HamburgerLine />
              </HamburgerMenu>
              <PageTitle>{selectedMainCategory}</PageTitle>
            </SubNavLeft>
            <SubNavRight>
              {isLoggedIn && (
                <MyPageButton onClick={() => navigate('/mypage')}>
                  마이페이지
                </MyPageButton>
              )}
            </SubNavRight>
          </SubNavContent>
        </SubNav>

        <MenuNav>
          <MenuNavContent>
            {menuData[selectedMainCategory] && 
              Object.keys(menuData[selectedMainCategory]).map((subCategory) => (
                <div key={subCategory} style={{ position: 'relative' }}>
                  <MenuItem 
                    className={selectedSubCategory === subCategory ? 'active' : ''}
                    onClick={() => setSelectedSubCategory(subCategory)}
                    onMouseEnter={() => setHoveredSubCategory(subCategory)}
                    onMouseLeave={() => setHoveredSubCategory(null)}
                  >
                    {subCategory}
                  </MenuItem>
                  <SubMenuDropdown $isVisible={hoveredSubCategory === subCategory}>
                    {menuData[selectedMainCategory][subCategory].map((item) => (
                      <SubMenuItem key={item} onClick={() => handleMenuClick(`/${item}`)}>
                        {item}
                      </SubMenuItem>
                    ))}
                  </SubMenuDropdown>
                </div>
              ))
            }
          </MenuNavContent>
        </MenuNav>
      </NavContainer>
    </>
  );
}

export default Navigation;
