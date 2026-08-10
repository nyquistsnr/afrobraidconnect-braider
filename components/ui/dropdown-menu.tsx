"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, children, align = "right" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, bottom: 0, spaceBelow: 0 });

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        right: window.innerWidth - rect.right,
        bottom: window.innerHeight - rect.top,
        spaceBelow: window.innerHeight - rect.bottom,
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideContainer = containerRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);
      
      if (!clickedInsideContainer && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      updatePosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const dropdownMenu = isOpen && typeof document !== "undefined" ? (
    createPortal(
      <div
        ref={dropdownRef}
        className={`fixed z-[100] w-48 rounded-md bg-surface border border-border shadow-lg animate-in fade-in zoom-in-95 duration-100 ${
          align === "right" ? "origin-top-right" : "origin-top-left"
        }`}
        style={{
          // If there is not enough space below, open upwards
          ...(coords.spaceBelow < 150 
            ? { bottom: coords.bottom + 8 } 
            : { top: coords.top + 8 }),
          ...(align === "right" 
            ? { right: coords.right } 
            : { left: coords.left }),
        }}
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          {React.Children.map(children, (child) => {
            if (
              React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(
                child
              )
            ) {
              return React.cloneElement(child, {
                onClick: (e: React.MouseEvent) => {
                  child.props.onClick?.(e);
                  setIsOpen(false);
                },
              });
            }
            return child;
          })}
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <div className="relative inline-block text-left" ref={containerRef}>
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className="cursor-pointer inline-flex items-center justify-center"
        >
          {trigger}
        </div>
      </div>
      {dropdownMenu}
    </>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function DropdownMenuItem({ children, onClick, icon, className = "" }: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center px-4 py-2 text-sm text-foreground transition-colors hover:bg-border/50 hover:text-brand ${className}`}
      role="menuitem"
    >
      {icon && <span className="mr-2 text-icon-muted">{icon}</span>}
      {children}
    </button>
  );
}
