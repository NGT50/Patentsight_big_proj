import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import useAuthStore from '../stores/authStore';

const NavContainer = styled.nav`
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TopNav = styled.div`
  background: white;
  padding: 0 20px;
  border-bottom: 1px solid #e9ecef;
`;

const TopNavContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  
  @media (max-width: 768px) {
    height: 50px;
    padding: 0 10px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  color: #0066cc;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
  
  @media (max-width: 768px) {
    height: 32px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 5px;
  }
`;

const UserName = styled.span`
  font-weight: 500;
  color: #333;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const Timer = styled.div`
  background: #f8f9fa;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 3px 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 9px;
    padding: 2px 4px;
  }
`;

const Button = styled.button`
  background: #0066cc;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.2s;
  
  &:hover {
    background: #0052a3;
  }
  
  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 10px;
  }
`;

const LogoutButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.2s;
  
  &:hover {
    background: #5a6268;
  }
  
  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 10px;
  }
`;

const NotificationButton = styled.button`
  background: white;
  color: #0066cc;
  border: 1px solid #e9ecef;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
`;

const SubNav = styled.div`
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0 20px;
`;

const SubNavContent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between; // space-between으로 변경
  height: 50px;
  
  @media (max-width: 768px) {
    height: 40px;
    padding: 0 10px;
  }
`;

const SubNavLeft = styled.div`
  display: flex;
  align-items: center;
`;

const SubNavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const MyPageButton = styled.button`
  background: none;
  color: #0066cc; // 파란색 글자
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  
  &:hover {
    background: #e9ecef; // 호버 시 연회색 배경
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;


const HamburgerMenu = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-right: 15px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
`;

const HamburgerLine = styled.div`
  width: 20px;
  height: 2px;
  background: #333;
  transition: all 0.3s;
`;

const PageTitle = styled.h2`
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  
  @media (max-width: 768px) {
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
  };

  // 현재 경로에 따라 활성 메뉴 확인
  const isActiveMenu = (menuPath) => {
    return location.pathname === menuPath;
  };

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


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeepLogin = () => {
    setTimeLeft(30 * 60);// 로그인 유지 버튼 클릭 시 타이머를 30분으로 리셋
  };

  const handleLogout = () => {
    logout(); // Zustand의 logout 함수 사용
    navigate('/login');
  };

  const handleLogoClick = () => navigate(isLoggedIn ? '/mypage' : '/login');

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const closeSideMenu = () => {
    setIsSideMenuOpen(false);
  };

  const handleMenuClick = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  // handleMenuClick 함수 다음에 추가
const handleMainCategoryClick = (mainCategory) => {
  setSelectedMainCategory(mainCategory);
  setSelectedSubCategory(Object.keys(menuData[mainCategory])[0]); // 첫 번째 중분류 선택
  setIsSideMenuOpen(false);
};

const handleSubCategoryClick = (subCategory) => {
  setSelectedSubCategory(subCategory);
};

 // 사용자 이름의 마지막 글자를 마스킹하는 함수
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
              <LogoImage src={logo} alt="PATENTSIGHT" />
            </Logo>
            <UserSection>
              {isLoggedIn ? (
                <>
                  <UserInfo>
                    <UserName>{maskUserName(userInfo?.name || '사용자')} 출원인님</UserName>
                    <Timer>로그인 시간: {formatTime(timeLeft)}</Timer>
                  </UserInfo>
                  <Button onClick={handleKeepLogin}>로그인 유지</Button>
                  <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
                  <NotificationButton onClick={onNotificationClick}>🔔</NotificationButton>
                
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
      </NavContainer>

{/* 사이드 메뉴 */}
<SideMenu $isOpen={isSideMenuOpen}>
  <SideMenuHeader>
    <SideMenuTitle>메뉴</SideMenuTitle>
    <CloseButton onClick={closeSideMenu}>×</CloseButton>
  </SideMenuHeader>
  <SideMenuContent>
    <SideMenuSection>
      <SideMenuSectionTitle onClick={() => handleMainCategoryClick('My특허로')}>
        My특허로
      </SideMenuSectionTitle>
      <SideMenuItem onClick={() => handleSubCategoryClick('나의할일')}>
        나의할일 (To-Do)
      </SideMenuItem>
      <SideMenuItem onClick={() => handleSubCategoryClick('통지서/등록료안내')}>
        통지서/등록료안내
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/notification-inbox')}>
        통지서수신함
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/fee-inbox')}>
        등록료안내수신함
      </SideMenuItem>
      <SideMenuItem onClick={() => handleSubCategoryClick('제출결과조회')}>
        제출결과조회
      </SideMenuItem>
    </SideMenuSection>

    <SideMenuSection>
      <SideMenuSectionTitle onClick={() => handleMainCategoryClick('신청/제출')}>
        신청/제출
      </SideMenuSectionTitle>
      <SideMenuItem onClick={() => handleSubCategoryClick('국내출원')}>
        국내출원
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/specification-form')}>
        명세서/서식 작성
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/online-submission')}>
        온라인제출
      </SideMenuItem>
      <SideMenuItem onClick={() => handleSubCategoryClick('국제출원')}>
        국제출원
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/international-trademark')}>
        국제상표출원
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/international-design')}>
        국제디자인출원
      </SideMenuItem>
    </SideMenuSection>

    <SideMenuSection>
      <SideMenuSectionTitle onClick={() => handleMainCategoryClick('조회/발급')}>
        조회/발급
      </SideMenuSectionTitle>
      <SideMenuItem onClick={() => handleSubCategoryClick('특허보관함')}>
        특허보관함
      </SideMenuItem>
      <SideMenuItem onClick={() => handleSubCategoryClick('검색/확인')}>
        검색/확인
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/examination-status')}>
        심사처리상황
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/publication-notice')}>
        공보발간일 예고
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/right-expiration')}>
        권리소멸예고
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/term-extension')}>
        존속기간연장
      </SideMenuItem>
      <SideMenuItem onClick={() => handleMenuClick('/internet-publication')}>
        인터넷공보
      </SideMenuItem>
    </SideMenuSection>
  </SideMenuContent>
</SideMenu>

      {/* 오버레이 */}
      <Overlay $isOpen={isSideMenuOpen} onClick={closeSideMenu} />
    </>
  );
}

export default Navigation;

