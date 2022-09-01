import { useEffect, useRef, useState } from "react"

export const useInterval = (callback: () => void, delay: number = 0) => {
    const savedCallback = useRef<typeof callback>()

    // Remember the latest function.
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // Set up the interval.
    useEffect(() => {
        const tick = () => {
            if (savedCallback.current) {
                savedCallback.current()
            }
        }

        if (delay !== null) {
            const id = setInterval(tick, delay)

            return () => {
                clearInterval(id)
            }
        }
    }, [delay])
}

export const useViewportDimensions = () => {
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })

    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight })
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return dimensions
}
