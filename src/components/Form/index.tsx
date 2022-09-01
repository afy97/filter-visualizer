import { CSSProperties, FormEvent, forwardRef, Ref, useImperativeHandle, useMemo, useRef, useState } from "react"

export interface FormRef {
    getFormValues: () => {
        method: Method,
        gainG: number,
        gainH: number,
        gainK: number,
        noise: number,
    }
}

type FormStyles = "root" | "wrapper" | "select" | "text" | "slider"
type Method = "g-h-k" | "kalman"

const Form = forwardRef<FormRef>((_, ref) => {
    const styles = useMemo<{ [key in FormStyles]: CSSProperties }>(() => ({
        root: {
            display: "block",
            width: "100%",
            padding: "2em",
        },
        wrapper: {
            width: "100%",
            paddingBottom: "1em"
        },
        select: {

        },
        text: {

        },
        slider: {

        },
    }), [])

    const [method, setMethod] = useState<Method>("g-h-k")
    const [gainG, setGainG] = useState(0.1)
    const [gainH, setGainH] = useState(0.1)
    const [gainK, setGainK] = useState(0.1)
    const [noise, setNoise] = useState(32)

    useImperativeHandle(
        ref,
        () => ({
            getFormValues() {
                return { method, gainG, gainH, gainK, noise }
            },
        }),
        [method, gainG, gainH, gainK, noise]
    )

    return (
        <form onSubmit={event => event.preventDefault()} style={styles.root}>
            <h1>Controls</h1>
            <div style={styles.wrapper}>
                <h2>Method</h2>
                <select name="method" value={method} onChange={event => setMethod(event.target.value as Method)} style={styles.select}>
                    <option value="g-h-k">g-h-k</option>
                    <option disabled value="kalman">Kalman (not-impl.)</option>
                </select>
            </div>
            <div style={styles.wrapper}>
                <h2>Noise</h2>
                <div style={styles.wrapper}>
                    Noise: {noise}<br />
                    <input type="range" name="g" step={1} min={0} max={10} value={Math.log2(noise)} onChange={event => setNoise(Math.pow(2, Number(event.target.value)))} /><br />
                </div>
            </div>
            {method === "g-h-k" ? (
                <div style={styles.wrapper}>
                    <h2>Gains</h2>
                    <div style={styles.wrapper}>
                        g: {gainG}<br />
                        <input type="range" name="g" step={0.01} value={gainG} min={0} max={1} onChange={event => setGainG(Number(event.target.value))} /><br />
                    </div>
                    <div style={styles.wrapper}>
                        h: {gainH}<br />
                        <input type="range" name="h" step={0.01} value={gainH} min={0} max={1} onChange={event => setGainH(Number(event.target.value))} /><br />
                    </div>
                    <div style={styles.wrapper}>
                        k: {gainK}<br />
                        <input type="range" name="k" step={0.01} value={gainK} min={0} max={1} onChange={event => setGainK(Number(event.target.value))} /><br />
                    </div>
                </div>
            ) : (null)}
        </form>
    )
})

export default Form
