import { CSSProperties, memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Vector2D } from "../../helper"
import { FormRef } from "../Form"

interface CanvasProps {
    width?: number,
    height?: number,
    color?: CSSProperties["color"]
    params?: ReturnType<FormRef["getFormValues"]>
}

interface KalmanCursor {
    delta?: number,
    time: number,
    data: {
        acc: Vector2D,
        vel: Vector2D,
        pos: Vector2D,
    },
}

const PATH_LENGHT = 64

const dim = (index: number) => {
    return Math.log10(1.0 / index) + 1
}

const Canvas = (props: CanvasProps) => {
    const {
        width = 512,
        height = 512,
        color = "black",
        params,
    } = props

    const ref = useRef<HTMLCanvasElement>(null)

    const [rawPath, setRawPath] = useState<Array<KalmanCursor>>([])
    const [measuredPath, setMeasuredPath] = useState<Array<KalmanCursor>>([])
    const [filterPath, setFilterPath] = useState<Array<KalmanCursor>>([])
    const [cursor, setCursor] = useState<KalmanCursor>()
    const [estimation, setEstimation] = useState<KalmanCursor>({
        time: Date.now(),
        delta: 0,
        data: {
            acc: new Vector2D(0, 0),
            vel: new Vector2D(0, 0),
            pos: new Vector2D(0, 0),
        }
    })

    const noiseScale = useMemo(() => params?.noise ?? 32, [params])

    const [g, setG] = useState(params?.gainG ?? 0.1)
    const [h, setH] = useState(params?.gainH ?? 0.1)
    const [k, setK] = useState(params?.gainK ?? 0.1)

    const handleMouseMove = useCallback<any>((event: MouseEvent) => {
        setCursor({
            time: Date.now(),
            data: {
                acc: new Vector2D(0, 0),
                vel: new Vector2D(0, 0),
                pos: new Vector2D(event.clientX, event.clientY),
            },
        })
    }, [])

    /**
     * State update equation
     * @param prev - Previous state
     * @param next - Next mesurement
     */
    const stateUpdate = useCallback((prev: KalmanCursor, next: KalmanCursor) => {
        const d = (next.time - prev.time) / 1000
        const a = prev.data.acc.add(next.data.pos.add(prev.data.pos.inverse()).scale((k * 2) / (d * d)))
        const v = prev.data.vel.add(next.data.pos.add(prev.data.pos.inverse()).scale(h / d))
        const x = prev.data.pos.add(next.data.pos.add(prev.data.pos.inverse()).scale(g))

        return {
            delta: d,
            time: Date.now(),
            data: {
                acc: a,
                vel: v,
                pos: x,
            }
        } as KalmanCursor
    }, [g, h, k])

    /**
     * State extrapolation equation
     * @param prev - Previous state
     * @param next - Next mesurement
     */
    const stateExtrapolation = useCallback((state: KalmanCursor) => {
        if (!state.delta && state.delta !== 0) {
            throw new Error("Time delta is not specified")
        }

        const d = state.delta
        const a = state.data.acc
        const v = state.data.vel.add(state.data.acc.scale(d))
        const x = state.data.pos.add(state.data.vel.scale(d))

        return {
            delta: d,
            time: Date.now(),
            data: {
                acc: a,
                vel: v,
                pos: x,
            }
        } as KalmanCursor
    }, [])

    const clear = useCallback(() => {
        const ctx = ref.current?.getContext("2d")

        if (ctx) {
            const style = ctx.fillStyle
            ctx.fillStyle = color
            ctx.fillRect(0, 0, width, height)
            ctx.fillStyle = style
        }
    }, [ref, color, width, height])

    const draw = useCallback(() => {
        const ctx = ref.current?.getContext("2d")

        if (ctx && measuredPath.length) {
            clear()
            const fstyle = ctx.fillStyle
            const sstyle = ctx.fillStyle

            ctx.lineWidth = 3

            for (let i = 0; i < rawPath.length - 1; ++i) {
                ctx.strokeStyle = `rgba(0, 255, 255, ${dim(i)})` // cyan
                ctx.beginPath()
                ctx.moveTo(rawPath[i + 0].data.pos.i, rawPath[i + 0].data.pos.j)
                ctx.lineTo(rawPath[i + 1].data.pos.i, rawPath[i + 1].data.pos.j)
                ctx.stroke()
            }

            for (let i = 0; i < measuredPath.length - 1; ++i) {
                ctx.strokeStyle = `rgba(255, 0, 255, ${dim(i)})` // magenta
                ctx.beginPath()
                ctx.moveTo(measuredPath[i + 0].data.pos.i, measuredPath[i + 0].data.pos.j)
                ctx.lineTo(measuredPath[i + 1].data.pos.i, measuredPath[i + 1].data.pos.j)
                ctx.stroke()
            }

            for (let i = 0; i < filterPath.length - 1; ++i) {
                ctx.strokeStyle = `rgba(255, 255, 0, ${dim(i)})` // yellow
                ctx.beginPath()
                ctx.moveTo(filterPath[i + 0].data.pos.i, filterPath[i + 0].data.pos.j)
                ctx.lineTo(filterPath[i + 1].data.pos.i, filterPath[i + 1].data.pos.j)
                ctx.stroke()
            }

            ctx.fillStyle = fstyle
            ctx.strokeStyle = sstyle
        }
    }, [ref, measuredPath, filterPath, clear])

    useEffect(() => {
        if (cursor) {
            const update = [{ ...cursor }, ...rawPath]

            if (PATH_LENGHT < rawPath.length) {
                update.pop()
            }

            setRawPath(update)
        }
    }, [cursor])

    useEffect(() => {
        if (cursor) {
            const x = cursor.data.pos.i + ((Math.pow(Math.random(), 2) * noiseScale) - (noiseScale / 2))
            const y = cursor.data.pos.j + ((Math.pow(Math.random(), 2) * noiseScale) - (noiseScale / 2))
            const mesurement = { ...cursor, data: { ...cursor.data, pos: new Vector2D(x, y) } } as KalmanCursor
            const update = [{ ...mesurement }, ...measuredPath]

            if (PATH_LENGHT < measuredPath.length) {
                update.pop()
            }

            setMeasuredPath(update)
        }
    }, [cursor])

    useEffect(() => {
        if (estimation) {
            const update = [{ ...estimation }, ...filterPath]

            if (PATH_LENGHT < filterPath.length) {
                update.pop()
            }

            setFilterPath(update)
        }
    }, [estimation])

    useEffect(() => {
        if (cursor) {
            const next = { ...cursor, delta: Date.now() - cursor.time } as KalmanCursor
            setEstimation((prev) => stateUpdate(prev, stateExtrapolation(next)))
        }
    }, [cursor])

    useEffect(clear, [clear])
    useEffect(draw, [draw])

    useEffect(() => {
        setG(prev => params?.gainG ?? prev)
        setH(prev => params?.gainH ?? prev)
        setK(prev => params?.gainK ?? prev)
    }, [params])

    useEffect(() => {
        console.log(g, h, k)
    }, [g, h, k])


    return <canvas ref={ref} onMouseMove={handleMouseMove} style={{ cursor: "crosshair" }} width={width} height={height} />
}

export default memo(Canvas)
