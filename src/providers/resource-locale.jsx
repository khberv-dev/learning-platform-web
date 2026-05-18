import {createContext, useContext, useState} from "react";

const ResourceLocaleContext = createContext(null)

export function ResourceLocaleProvider({children}) {
    const [resourceLocale, setResourceLocale] = useState(
        () => localStorage.getItem('locale') || 'uz'
    )

    const changeResourceLocale = (value) => {
        localStorage.setItem('locale', value)
        setResourceLocale(value)
    }

    return (
        <ResourceLocaleContext.Provider value={{resourceLocale, changeResourceLocale}}>
            {children}
        </ResourceLocaleContext.Provider>
    )
}

export const useResourceLocale = () => useContext(ResourceLocaleContext)
