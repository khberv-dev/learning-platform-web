import {Button, Dialog} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';

function ConfirmDialog({open, title, message, confirmText, danger = true, loading, onConfirm, onClose}) {
    const {t} = useI18n();

    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={title ?? t('common.confirm')}/>
            {message && <Dialog.Body>{message}</Dialog.Body>}
            <Dialog.Footer
                onClickButtonCancel={onClose}
                textButtonCancel={t('common.cancel')}
                onClickButtonApply={onConfirm}
                textButtonApply={confirmText ?? t('common.confirm')}
                propsButtonApply={{view: danger ? 'outlined-danger' : 'action', loading}}
            />
        </Dialog>
    );
}

export default ConfirmDialog;

// A plain Button that opens nothing on its own - paired with ConfirmDialog by
// pages that need a delete affordance in a toolbar.
export function DangerButton(props) {
    return <Button view="outlined-danger" {...props}/>;
}
