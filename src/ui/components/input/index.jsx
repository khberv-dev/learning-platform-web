import {TextArea as GTextArea, TextInput as GTextInput} from "@gravity-ui/uikit";
import Icon from "@/ui/components/icon/index.jsx";

export default function Input({iconLeft, iconRight, size = 'l', ...props}) {
    return (
        <GTextInput
            size={size}
            startContent={
                iconLeft ? (
                    <span style={{paddingLeft: 10, display: 'inline-flex'}}>
                        <Icon name={iconLeft} size={16} color={'var(--it-text-secondary)'}/>
                    </span>
                ) : undefined
            }
            endContent={
                iconRight ? (
                    <span style={{paddingRight: 10, display: 'inline-flex'}}>
                        <Icon name={iconRight} size={16} color={'var(--it-text-secondary)'}/>
                    </span>
                ) : undefined
            }
            {...props}
        />
    )
}

export function TextArea({size = 'l', ...props}) {
    return <GTextArea size={size} minRows={3} {...props}/>
}
