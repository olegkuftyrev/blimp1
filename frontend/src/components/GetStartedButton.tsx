"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { MeshGradient } from "@paper-design/shaders-react"

type GetStartedButtonProps = {
  text?: string
  onClick?: () => void
  className?: string
}

export default function GetStartedButton({ text = "Get Started", onClick, className }: GetStartedButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const letters = text.split("")

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setClickPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    setIsPressed(true)
  }

  return (
    <motion.button
      ref={buttonRef}
      className={`relative rounded-[16px] overflow-hidden focus:outline-none ${className ?? ""}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={handleMouseDown}
      onMouseUp={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? 0.95 : 1,
        y: isPressed ? 2 : 0,
        boxShadow: isPressed ? "0px 2px 4px rgba(0, 0, 0, 0.1)" : "0px 6px 12px rgba(0, 0, 0, 0.15)",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
      aria-label={text}
    >
      <div className="w-[220px] h-[60px]">
        {isHovered ? (
          <MeshGradient
            color1="#D4BEFE"
            color2="#F87EE7"
            color3="#E5DAFA"
            color4="#FCA4B2"
            speed={0.5}
            style={{ width: 220, height: 60, borderRadius: 16, position: "absolute", top: 0, left: 0 }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#BD97FE] rounded-[16px]" />
        )}
      </div>

      {isPressed && (
        <motion.div
          className="absolute rounded-full bg-gradient-to-r from-white/30 to-transparent"
          style={{ left: clickPosition.x, top: clickPosition.y, width: 10, height: 10, transform: "translate(-50%, -50%)" }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 15, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      <motion.div
        className="absolute inset-0 rounded-[16px] pointer-events-none"
        initial={{ boxShadow: "0 0 0 0px rgba(255,255,255,0)" }}
        animate={{ boxShadow: isPressed ? "0 0 0 2px rgba(255,255,255,0.5)" : "0 0 0 0px rgba(255,255,255,0)" }}
        transition={{ duration: 0.3 }}
      />

      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 400 }}>
        <div className="relative h-6 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          <div className="flex absolute" style={{ transformStyle: "preserve-3d" }}>
            {letters.map((letter, index) => (
              <motion.span
                key={`original-${index}`}
                className="font-medium text-[#2D1F30]"
                initial={{ y: 0, z: 0, rotateX: "0deg", opacity: 1 }}
                animate={{ y: isHovered ? -25 : 0, z: isHovered ? 20 : 0, rotateX: isHovered ? "-90deg" : "0deg", opacity: isHovered ? 0 : 1 }}
                transition={{ duration: 0.3, delay: isHovered ? index * 0.015 : (letters.length - index) * 0.015, ease: [0.3, 0.1, 0.3, 1] }}
                style={{ transformStyle: "preserve-3d", textShadow: isHovered ? "none" : "0px 1px 2px rgba(0,0,0,0.1)" }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>

          <div className="flex absolute" style={{ transformStyle: "preserve-3d" }}>
            {letters.map((letter, index) => (
              <motion.span
                key={`new-${index}`}
                className="font-medium text-[#2D1F30]"
                initial={{ y: 25, z: -20, rotateX: "90deg", opacity: 0 }}
                animate={{ y: isHovered ? 0 : 25, z: isHovered ? 0 : -20, rotateX: isHovered ? "0deg" : "90deg", opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3, delay: isHovered ? index * 0.015 : (letters.length - index) * 0.015, ease: [0.3, 0.1, 0.3, 1] }}
                style={{ transformStyle: "preserve-3d", textShadow: isHovered ? "0px 1px 2px rgba(0,0,0,0.1)" : "none" }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  )
}


