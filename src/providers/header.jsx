import {createContext, useContext, useState} from "react";

const HeaderContext = createContext(null)

export function HeaderProvider({children}) {
    const [title, setTitle] = useState('')
    const [onBack, setOnBack] = useState(null)

    const setHeader = ({title = '', onBack = null} = {}) => {
        setTitle(title)
        setOnBack(() => onBack)
    }

    return (
        <HeaderContext.Provider value={{title, onBack, setHeader}}>
            {children}
        </HeaderContext.Provider>
    )
}

export const useHeader = () => useContext(HeaderContext)
