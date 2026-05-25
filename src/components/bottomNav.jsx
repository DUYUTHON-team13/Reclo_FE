import { NavLink } from "react-router-dom";
import chartIcon from "../assets/image/icon/Chart_Bar_Vertical_01.png";
import bagIcon from "../assets/image/icon/Handbag.png";
import homeIcon from "../assets/image/icon/House_02.png";

const navItems = [
  { to: "/home", icon: homeIcon, label: "홈" },
  { to: "/closet", icon: bagIcon, label: "나의 옷장" },
  { to: "/report", icon: chartIcon, label: "리포트" },
];

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} className="bottom-nav__item">
          <img className="bottom-nav__icon" src={item.icon} alt="" />
          <p>{item.label}</p>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
