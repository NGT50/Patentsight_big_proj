import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Plus
} from 'lucide-react';

const SubNavContainer = styled.nav`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 9999;
`;

const SubNavContent = styled.div`
  max-width: 7xl;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

const MenuList = styled.ul`
  display: flex;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  height: 50px;
  overflow-x: auto;
  
  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  @media (max-width: 768px) {
    height: 45px;
    gap: 0;
  }
`;

const MenuItem = styled.li`
  position: relative;
  flex-shrink: 0;
`;

const MenuLink = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  height: 50px;
  background: ${props => props.$isActive ? '#f8fafc' : 'transparent'};
  border: none;
  outline: none;
  color: ${props => props.$isActive ? '#3b82f6' : '#6b7280'};
  font-weight: ${props => props.$isActive ? '600' : '500'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  
  &:hover {
    color: #3b82f6;
    background: #f8fafc;
  }
  
  &:focus {
    outline: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$isActive ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent'};
    border-radius: 2px 2px 0 0;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 768px) {
    padding: 0 12px;
    height: 45px;
    font-size: 13px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 0 8px;
    font-size: 12px;
    gap: 4px;
  }
`;

const MenuIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    transition: all 0.3s ease;
    
    @media (max-width: 768px) {
      width: 14px;
      height: 14px;
    }
    
    @media (max-width: 480px) {
      width: 12px;
      height: 12px;
    }
  }
`;

const SubNavigation = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로에 따라 활성 메뉴 결정
  const getActiveMenu = () => {
    const path = location.pathname;
    
    if (path === '/mypage' || path === '/dashboard') return 'mypage';
    if (path.startsWith('/patent/')) {
      return 'patent';
    }
    if (path === '/new-patent-choice') return 'new-patent';
    if (path === '/search') return 'search';
    
    return '';
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  // 로그인하지 않은 경우 네비게이션 숨김
  if (!isLoggedIn) {
    return null;
  }

  // 랜딩페이지나 로그인 페이지에서는 네비게이션 숨김
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  const menuItems = [
    {
      id: 'mypage',
      label: '마이페이지',
      icon: <Home />,
      path: '/mypage'
    },
    {
      id: 'new-patent',
      label: '새 출원',
      icon: <Plus />,
      path: '/new-patent-choice'
    },
    {
      id: 'search',
      label: '특허 검색',
      icon: <Search />,
      path: '/search'
    },

  ];

  const activeMenu = getActiveMenu();

  return (
    <SubNavContainer>
      <SubNavContent>
        <MenuList>
          {menuItems.map((item) => (
            <MenuItem key={item.id}>
              <MenuLink
                $isActive={activeMenu === item.id}
                onClick={() => handleMenuClick(item.path)}
              >
                <MenuIcon>
                  {item.icon}
                </MenuIcon>
                <span>{item.label}</span>
              </MenuLink>
            </MenuItem>
          ))}
        </MenuList>
      </SubNavContent>
    </SubNavContainer>
  );
};

export default SubNavigation; 