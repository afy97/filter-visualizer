import { useMemo, useRef, useState } from "react"
import { useViewportDimensions } from "../hooks"
import Canvas from "./Canvas"
import Form, { FormRef } from "./Form"

const App = () => {
    const formRef = useRef<FormRef>(null)
    const dimensions = useViewportDimensions()

    const orient = useMemo(() => dimensions.width < dimensions.height, [dimensions])
    const aspect = useMemo(() => orient ? dimensions.width : dimensions.height, [orient])

    const [current, setCurrent] = useState<ReturnType<FormRef["getFormValues"]>>()

    const handleSubmit = () => {
        setCurrent(formRef.current?.getFormValues())
    }

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: !orient ? "row" : "column" }}>
            <div style={{ flex: "0 1 " + ((aspect + "px") ?? "auto") }}>
                <Canvas width={aspect} height={aspect} params={current} />
            </div>
            <div style={{ flex: "0 1 auto", overflowY: "auto" }}>
                <Form ref={formRef} />
                <button style={{ width: "24ch", margin: "0 0 2em 2em" }} onClick={handleSubmit}>Update Parameters</button>
            </div>
            <div style={{ flex: "1 0 auto", overflowY: "auto" }} />
        </div>
    )
}

export default App
