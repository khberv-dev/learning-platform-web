import {createContext, useContext, useState, useCallback, useEffect, useMemo} from "react";

const HeaderContext = createContext(null)

export function HeaderProvider({children}) {
    const [title, setTitle] = useState('')
    const [subtitle, setSubtitle] = useState('')
    const [onBack, setOnBack] = useState(null)
    const [actions, setActions] = useState(null)

    const setHeader = useCallback(({title = '', subtitle = '', onBack = null, actions = null} = {}) => {
        setTitle(title)
        setSubtitle(subtitle)
        setOnBack(() => onBack)
        setActions(() => actions)
    }, [])

    const value = useMemo(() => ({title, subtitle, onBack, actions, setHeader}), [title, subtitle, onBack, actions, setHeader])

    return (
        <HeaderContext.Provider value={value}>
            {children}
        </HeaderContext.Provider>
    )
}

export const useHeader = () => useContext(HeaderContext)

export function useSetHeader(deps, factory) {
    const {setHeader} = useHeader()

    useEffect(() => {
        setHeader(factory())
        return () => setHeader({})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}
