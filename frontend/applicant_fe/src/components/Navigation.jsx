import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
<<<<<<< HEAD
import useAuthStore from '../stores/authStore';
=======
import NotificationPopup from './NotificationPopup';
import { getNotifications, getUnreadCount } from '../data/notifications';
>>>>>>> origin/woncicd

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
    font-size: 14px;
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
  position: relative;
  
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

const NotificationBadge = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid white;
`;

<<<<<<< HEAD
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

function Navigation({ onLoginSuccess, onNotificationClick }) { // props 추가
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState('My특허로');
  const [selectedSubCategory, setSelectedSubCategory] = useState('나의할일');
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);
  const { isLoggedIn, user, logout } = useAuthStore();
  // 현재 경로에 따라 페이지 제목 설정
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return '대시보드';
      case '/login':
        return '로그인';
      case '/auth':
        return '인증';
      case '/signup':
        return '회원가입';
      case '/status':
        return '현황조회';
      case '/opinion':
        return '의견서';
      default:
        return '대시보드';
    }
  };

  const currentPage = getCurrentPageTitle();

  // [FIXED] 메뉴 데이터를 우리 프로젝트의 실제 페이지 경로에 맞게 재구성
  const menuData = {
    'My특허로': {
      '마이페이지': [{ name: '대시보드 보기', path: '/mypage' }],
    },
    '신청/제출': {
      '새 출원서 등록': [{ name: '등록 시작하기', path: '/patents/new' }],
      '특허 점검': [{ name: '임시저장 목록', path: '/check/patents' }],
      '디자인 점검': [{ name: '임시저장 목록', path: '/check/designs' }]
    },
    '조회/발급': {
      '유사 특허 검색': [{ name: '대화형 검색', path: '/search' }]
    }
=======
function Navigation({ isLoggedIn, onLoginSuccess, onLogout, userInfo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // 핸들러 함수들을 먼저 정의
  const handleLogout = () => {
    onLogout();
    setTimeLeft(0);
    navigate('/login');
  };

  const handleKeepLogin = () => {
    setTimeLeft(30 * 60);
>>>>>>> origin/woncicd
  };

  const handleLogoClick = () => {
    navigate('/');
  };

<<<<<<< HEAD
  // 타이머 로직
  useEffect(() => {
    let timer;
    if (isLoggedIn && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isLoggedIn && timeLeft <= 0) {
      alert('세션이 만료되어 로그아웃됩니다.');
      handleLogout();
    }
    return () => clearInterval(timer);
  }, [isLoggedIn, timeLeft]);

  // 로그인/로그아웃 시 타이머 상태 초기화
  useEffect(() => {
    if (isLoggedIn) {
      setTimeLeft(30 * 60);
    } else {
      setTimeLeft(0);
    }
  }, [isLoggedIn]);
=======
  const handleNotificationClick = () => {
    setIsNotificationOpen(true);
  };

  const handleNotificationClose = () => {
    setIsNotificationOpen(false);
  };
>>>>>>> origin/woncicd

  const maskUserName = (name) => {
    if (!name || name === '사용자') return name;
    if (name.length <= 1) return '*';
    return name.slice(0, -1) + '*';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

<<<<<<< HEAD
  const handleKeepLogin = () => {
    setTimeLeft(30 * 60);// 로그인 유지 버튼 클릭 시 타이머를 30분으로 리셋
  };

  const handleLogout = () => {
    logout(); // Zustand의 logout 함수 사용
    navigate('/login');
  };

  const handleLogoClick = () => navigate(isLoggedIn ? '/mypage' : '/login');
=======
  const loadNotifications = async () => {
    if (!isLoggedIn) return;
    
    setIsLoadingNotifications(true);
    try {
      // 알림 목록과 미확인 개수를 병렬로 로드
      const [notificationData, unreadCountData] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ]);
      
      setNotifications(notificationData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('알림 데이터 로드 실패:', error);
      // 에러 발생 시 빈 배열로 설정
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoadingNotifications(false);
    }
  };
>>>>>>> origin/woncicd

  // 로그인/로그아웃 시 타이머 상태 초기화
  useEffect(() => {
    if (isLoggedIn) {
      setTimeLeft(30 * 60);
      // 알림 데이터 로드
      loadNotifications();
    } else {
      setTimeLeft(0);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  // 타이머 로직 (handleLogout 함수 정의 후에 실행)
  useEffect(() => {
    let timer;
    if (timeLeft > 0 && isLoggedIn) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 1초 남았을 때 로그아웃 (일시적으로 비활성화)
            clearInterval(timer);
            // alert('세션이 만료되어 로그아웃됩니다.');
            // handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isLoggedIn, timeLeft]);

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
                    <UserName>{maskUserName(userInfo?.name || '사용자')}님</UserName>
                    <Timer>로그인 시간: {formatTime(timeLeft)}</Timer>
                  </UserInfo>
                  <Button onClick={handleKeepLogin}>로그인 유지</Button>
                  <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
<<<<<<< HEAD
                  <NotificationButton onClick={onNotificationClick}>🔔</NotificationButton>
                
=======
                  <NotificationButton onClick={handleNotificationClick}>
                    🔔
                    {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
                  </NotificationButton>
>>>>>>> origin/woncicd
                </>
              ) : (
                <Button onClick={() => navigate('/login')}>로그인</Button>
              )}
            </UserSection>
          </TopNavContent>
        </TopNav>
<<<<<<< HEAD

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
                      <SubMenuItem key={item.name} onClick={() => handleMenuClick(item.path)}>
                          {item.name}
                        </SubMenuItem>
                    ))}
                  </SubMenuDropdown>
                </div>
              ))
            }
          </MenuNavContent>
        </MenuNav>
=======
>>>>>>> origin/woncicd
      </NavContainer>
      
      {/* 알림 팝업 */}
      <NotificationPopup
        isOpen={isNotificationOpen}
        onClose={handleNotificationClose}
        notifications={notifications}
        onNotificationUpdate={loadNotifications}
      />
    </>
  );
}

export default Navigation;

