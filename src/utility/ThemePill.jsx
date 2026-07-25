import { useRef, useEffect } from "react"
import DawnBlack from "../assets/Dawn_black.svg"
import DawnWhite from "../assets/Dawn_white.svg"
import DayBlack from "../assets/Day_black.svg"
import DayWhite from "../assets/Daytime_white.svg"
import EveningBlack from "../assets/Evening_black.svg"
import EveningWhite from "../assets/Evening_white.svg"
import NightBlack from "../assets/Night_black.svg"
import NightWhite from "../assets/Night_white.svg"
import TickSound from "../assets/TickSound.mp3"
import { useTheme } from "../hooks/useTheme"

function usePrevious(value) {
  const ref = useRef(null)
  useEffect(() => { ref.current = value }, [value])
  return ref.current
}

const themeOptions = [
  { id: "dawn",     label: "Dawn",    lightIcon: DawnBlack,    darkIcon: DawnWhite    },
  { id: "day",      label: "Daytime", lightIcon: DayBlack,     darkIcon: DayWhite     },
  { id: "evening",  label: "Evening", lightIcon: EveningBlack, darkIcon: EveningWhite },
  { id: "midnight", label: "Night",   lightIcon: NightBlack,   darkIcon: NightWhite   },
]

const ThemePill = ({ size = "md" }) => {
  const { theme, setThemeManually } = useTheme()
  const audioRef = useRef(null)

  const activeIndex = themeOptions.findIndex(o => o.id === theme)
  const prevIndex   = usePrevious(activeIndex) ?? activeIndex
  const isDarkTheme = theme === "evening" || theme === "midnight"

  useEffect(() => {
    audioRef.current = new Audio(TickSound)
    audioRef.current.volume = 0.5
    audioRef.current.playbackRate = 3.0 // Play the audio twice as fast
    return () => {
      audioRef.current = null 
    }
  }, [])

  return (
    <div
      className={`theme-pill ${size === "sm" ? "theme-pill-sm" : ""}`}
      role="group"
      aria-label="Theme selector"
      data-active={activeIndex}
      data-prev={prevIndex}
    >
      <span className="theme-indicator" />

      {themeOptions.map((option) => {
        const isActive = option.id === theme
        const icon = isDarkTheme ? option.darkIcon : option.lightIcon

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0
                audioRef.current.play().catch(() => {})
              }
              setThemeManually(option.id)
            }}
            className={`theme-pill-item ${isActive ? "theme-pill-active" : ""}`}
            aria-pressed={isActive}
          >
            <img src={icon} alt={option.label} className="theme-pill-icon" />
          </button>
        )
      })}
    </div>
  )
}

export default ThemePill
