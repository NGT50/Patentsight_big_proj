import React from 'react';

const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled = false }) => {
  // 버튼 종류(variant)에 따라 다른 스타일을 적용합니다.
  const baseStyle = "px-4 py-2 text-sm font-semibold rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const styles = {
    primary: `text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`,
    secondary: `text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500`,
    danger: `text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`,
  };

  const disabledStyle = "disabled:bg-gray-300 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${styles[variant]} ${disabledStyle}`}
    >
      {children}
    </button>
  );
};

export default Button;