import { onMount } from "solid-js";
import { createSignal } from "solid-js";
import { GameWrapper } from "./games/Games";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
  const [activeIndex, setActiveIndex] = createSignal(0);
  const [popupOpen, setPopupOpen] = createSignal(false);

  onMount(() => {
    updateSlider();
  });

  const updateSlider = (element?: HTMLElement) => {
    const container = document.querySelector(".nav-container") as HTMLElement;
    const slider = document.getElementById("slider") as HTMLElement;

    if (!container || !slider) return;

    if (element) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = element.getBoundingClientRect();

      const left = itemRect.left - containerRect.left;
      const width = itemRect.width;

      slider.style.width = `${width}px`;
      slider.style.left = `${left}px`;
    } else {
      const firstItem = document.querySelector(".nav-item") as HTMLElement;
      if (firstItem) {
        updateSlider(firstItem);
      }
    }
  };

  const handleNavClick = (index: number, e: Event) => {
    setActiveIndex(index);
    setPopupOpen(false); // Close popup when another nav item is clicked
    updateSlider(e.currentTarget as HTMLElement);
  };

  const handlePopupClick = (e: Event) => {
    e.preventDefault();
    setPopupOpen(!popupOpen());
    if (!popupOpen()) {
      // If closing popup, reset active index to none
      setActiveIndex(-1);
      const slider = document.getElementById("slider") as HTMLElement;
      if (slider) {
        slider.style.width = "0";
      }
    } else {
      // If opening popup, update slider position
      updateSlider(e.currentTarget as HTMLElement);
    }
  };

  const handleMouseEnter = (e: Event) => {
    if (!(e.currentTarget as HTMLElement).classList.contains("active")) {
      updateSlider(e.currentTarget as HTMLElement);
    }
  };

  const handleMouseLeave = () => {
    if (activeIndex() >= 0) {
      const activeItem = document.querySelector(
        `.nav-item[data-index="${activeIndex()}"]`
      ) as HTMLElement;
      if (activeItem) {
        updateSlider(activeItem);
      }
    } else {
      const slider = document.getElementById("slider") as HTMLElement;
      if (slider) {
        slider.style.width = "0";
      }
    }
  };

  const navItems = [
    { name: "Home", icon: "fa-home", src: "#home" },
    { name: "About Me", icon: "fa-user", src: "#about" },
    { name: "Projects", icon: "fa-briefcase", src: "#projects" },
    { name: "Skills", icon: "fa-code", src: "#skills" },
  ];

  const mobileNavItems = [
    ...navItems,
    { name: "Login", icon: "fa-sign-in-alt", src: "/login" },
    { name: "Sign Up", icon: "fa-user-plus", src: "/register" },
  ];

  return (
    <>
      <nav class="bg-gray-950 bg-opacity-90 backdrop-blur-md shadow-lg fixed z-50 rounded-xl top-4 left-1/2 transform border border-gray-800 -translate-x-1/2 w-[95%] max-w-6xl">
        <div class="max-w-6xl mx-auto px-4">
          <div class="flex justify-between items-center h-16">
            {/* Logo */}
            <div class="flex-shrink-0 flex items-center mx-2">
              <a
                href="#"
                class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center"
              >
                M Hisyam
              </a>
            </div>

            {/* Primary Nav */}
            <div class="hidden md:flex items-center h-full nav-container">
              <div class="slider" id="slider"></div>
              {navItems.map((item, index) => (
                <a
                  href={item.src}
                  class={`nav-item h-full flex items-center px-5 font-medium text-sm ${
                    activeIndex() === index
                      ? "text-blue-400 active"
                      : "text-gray-300 hover:text-blue-400"
                  } transition-colors duration-200 relative group`}
                  data-index={index}
                  onClick={(e) => handleNavClick(index, e)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <span>{item.name}</span>
                </a>
              ))}
              <button
                class={`nav-item h-full flex items-center px-5 font-medium text-sm ${
                  popupOpen()
                    ? "text-blue-400 active"
                    : "text-gray-300 hover:text-blue-400"
                } transition-colors duration-200 relative group`}
                onClick={handlePopupClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <i class="fas fa-gamepad"></i>
              </button>
            </div>

            {/* Secondary Nav */}
            <div class="hidden md:flex items-center space-x-2 ml-4">
              <button class="py-1.5 px-4 font-medium text-blue-400 rounded-lg border border-blue-700 hover:bg-blue-900 hover:border-blue-600 transition-all duration-200 text-sm">
                Hire Me
                <i class="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
              </button>
            </div>

            {/* Mobile menu button */}
            <div class="md:hidden flex items-center">
              <button
                class="outline-none p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
              >
                <svg
                  class={`w-6 h-6 text-gray-300 transition-transform duration-200 ${
                    mobileMenuOpen() ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Games Popup */}
      {popupOpen() && (
        <div class="fixed top-24 right-4 z-50 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg p-4">
          <GameWrapper onClose={() => setPopupOpen(false)} />
        </div>
      )}

      {/* Mobile menu */}
      <div
        class={`${
          mobileMenuOpen() ? "block md:hidden" : "hidden"
        } mobile-menu bg-gray-900/80 backdrop-blur-md shadow-sm fixed z-50 rounded-xl top-24 left-1/2 transform border border-gray-800 -translate-x-1/2 w-[95%] max-w-6xl overflow-hidden`}
      >
        <ul class="divide-y divide-gray-700">
          {mobileNavItems.map((item, index) => (
            <li>
              <a
                href={item.src}
                class={`block px-6 py-3 text-sm ${
                  index === activeIndex()
                    ? "bg-blue-950 text-blue-400 font-medium"
                    : "text-gray-300 hover:bg-gray-800"
                } transition-colors duration-150 flex items-center`}
                onClick={() => {
                  if (index < navItems.length) setActiveIndex(index);
                  setMobileMenuOpen(false);
                }}
              >
                <i
                  class={`fas ${item.icon} mr-3 ${
                    index === activeIndex() ? "text-blue-400" : "text-gray-500"
                  }`}
                ></i>
                {item.name}
                {index >= navItems.length && (
                  <span class="ml-auto text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                    {index === navItems.length ? "Account" : "New"}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <style>
        {`
    .nav-container {
      position: relative;
    }

    .slider {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10;
      border-radius: 2px;
      box-shadow: 0 1px 3px rgba(59, 130, 246, 0.4);
    }

    .mobile-menu {
      animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      transform-origin: top;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px) scaleY(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scaleY(1);
      }
    }
  `}
      </style>
    </>
  );
}
