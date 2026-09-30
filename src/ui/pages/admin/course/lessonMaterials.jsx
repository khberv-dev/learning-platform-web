import {useState} from 'react';
import {Button, Dialog, Label, TextInput} from '@gravity-ui/uikit';
import {Plus, Trash2} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useCreateMaterial, useDeleteMaterial, useMaterials} from '@/services/material/query.js';
import {formatDate} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import {DOCUMENT_RULES} from '@/shared/utils/fileValidation.js';
import {useUploadProgress} from '@/shared/hooks/useUploadProgress.js';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import FileDropCard from '@/ui/components/fileDropCard.jsx';

const DOCUMENT_ACCEPT = [...DOCUMENT_RULES.mimeTypes, ...DOCUMENT_RULES.extensions].join(',');

// Mounted only while the dialog is open, so every opening starts empty.
function AddMaterialDialog({lessonId, onClose}) {
    const {t} = useI18n();
    const createMaterial = useCreateMaterial();
    const upload = useUploadProgress();
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);

    // A picked file pre-fills the name with its own, minus the extension,
    // unless one was already typed.
    const handleFile = (picked) => {
        setFile(picked);
        if (picked && !name.trim()) setName(picked.name.replace(/\.[^.]+$/, ''));
    };

    const submit = () => {
        if (!name.trim() || !file) return;

        createMaterial.mutate(
            {lessonId, name: name.trim(), file, onUploadProgress: upload.onUploadProgress},
            {
                onSuccess: () => {
                    upload.reset();
                    toaster.add({name: 'material-saved', theme: 'success', title: t('common.saved')});
                    onClose();
                },
                onError: (error) => {
                    upload.reset();
                    toaster.add({
                        name: 'material-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    });
                },
            }
        );
    };

    return (
        <Dialog open onClose={createMaterial.isPending ? () => {} : onClose} size="s">
            <Dialog.Header caption={t('material.add')}/>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <FormField label={t('material.file')} required>
                        <FileDropCard
                            value={file}
                            onChange={handleFile}
                            accept={DOCUMENT_ACCEPT}
                            rules={DOCUMENT_RULES}
                            progress={upload.progress}
                            disabled={createMaterial.isPending}
                        />
                    </FormField>
                    <FormField label={t('material.name')} required>
                        <TextInput size="l" value={name} onUpdate={setName}/>
                    </FormField>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                textButtonCancel={t('common.cancel')}
                onClickButtonApply={submit}
                textButtonApply={t('common.save')}
                propsButtonApply={{
                    loading: createMaterial.isPending,
                    disabled: !name.trim() || !file,
                }}
                propsButtonCancel={{disabled: createMaterial.isPending}}
            />
        </Dialog>
    );
}

// Downloadable attachments for one lesson. The materials API is keyed by the
// lesson alone, not the course/unit path the rest of the tree uses.
function LessonMaterials({lessonId}) {
    const {t} = useI18n();
    const query = useMaterials(lessonId);
    const deleteMaterial = useDeleteMaterial();

    const [adding, setAdding] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const columns = [
        {
            id: 'name',
            name: t('material.name'),
            // `url` is null when the server failed to sign the link, so the
            // name then renders without one.
            template: (row) =>
                row.url ? (
                    <a href={row.url} target="_blank" rel="noreferrer" style={{color: 'var(--g-color-text-link)'}}>
                        {row.name}
                    </a>
                ) : (
                    row.name
                ),
        },
        {
            id: 'type',
            name: t('material.type'),
            template: (row) => <Label size="xs">{String(row.type).toUpperCase()}</Label>,
        },
        {id: 'createdAt', name: t('common.createdAt'), template: (row) => formatDate(row.createdAt)},
        {
            id: 'actions',
            name: '',
            align: 'end',
            template: (row) => (
                <Button
                    size="s"
                    view="flat-danger"
                    onClick={() => setConfirmDelete(row)}
                    aria-label={t('common.delete')}
                >
                    <Button.Icon>
                        <Trash2 size={14}/>
                    </Button.Icon>
                </Button>
            ),
        },
    ];

    return (
        <PageSection
            title={t('material.title')}
            description={t('material.hint')}
            actions={
                <Button view="action" onClick={() => setAdding(true)}>
                    <Button.Icon>
                        <Plus size={16}/>
                    </Button.Icon>
                    {t('material.add')}
                </Button>
            }
        >
            <DataTable query={query} columns={columns} emptyTitle={t('material.empty')}/>

            {adding && <AddMaterialDialog lessonId={lessonId} onClose={() => setAdding(false)}/>}

            <ConfirmDialog
                open={Boolean(confirmDelete)}
                title={t('common.delete')}
                message={confirmDelete?.name}
                confirmText={t('common.delete')}
                loading={deleteMaterial.isPending}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() =>
                    deleteMaterial.mutate(
                        {lessonId, materialId: confirmDelete.id},
                        {
                            onSuccess: () => {
                                toaster.add({name: 'material-deleted', theme: 'success', title: t('common.deleted')});
                                setConfirmDelete(null);
                            },
                            onError: (error) =>
                                toaster.add({
                                    name: 'material-delete-failed',
                                    theme: 'danger',
                                    title: extractApiErrorMessage(error, t('common.error')),
                                }),
                        }
                    )
                }
            />
        </PageSection>
    );
}

export default LessonMaterials;
