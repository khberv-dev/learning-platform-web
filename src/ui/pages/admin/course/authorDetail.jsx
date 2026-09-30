import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button} from '@gravity-ui/uikit';
import {Pencil, Trash2} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {GENDER, useAuthor, useDeleteAuthor} from '@/services/author/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import AuthorFormDialog from '@/ui/pages/admin/course/authorFormDialog.jsx';

function AdminAuthorDetail() {
    const {t} = useI18n();
    const {id} = useParams();
    const navigate = useNavigate();
    const query = useAuthor(id);
    const deleteAuthor = useDeleteAuthor();

    const [editing, setEditing] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    if (query.isPending) return <LoadingState rows={6}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const author = query.data;
    const name = `${author.firstName} ${author.lastName}`;

    // Credits are assigned from the course's own Authors tab, so the course
    // rows here link there rather than offering an unlink of their own.
    const courseColumns = [
        {
            id: 'image',
            name: '',
            width: 72,
            template: (row) =>
                row.image ? (
                    <img
                        src={row.image}
                        alt=""
                        style={{width: 56, height: 36, objectFit: 'cover', borderRadius: 4, display: 'block'}}
                    />
                ) : null,
        },
        {id: 'title', name: t('course.name'), template: (row) => row.title},
        {id: 'isActive', name: t('common.status'), template: (row) => <ActiveLabel active={row.isActive}/>},
    ];

    return (
        <>
            <PageHeader
                title={name}
                description={t('author.single')}
                backTo="/admin/course/authors"
                breadcrumbs={[{title: t('author.title'), to: '/admin/course/authors'}, {title: name}]}
                actions={
                    <div style={{display: 'flex', gap: 8}}>
                        <Button onClick={() => setEditing(true)}>
                            <Button.Icon>
                                <Pencil size={16}/>
                            </Button.Icon>
                            {t('common.edit')}
                        </Button>
                        <Button view="outlined-danger" onClick={() => setConfirmOpen(true)}>
                            <Button.Icon>
                                <Trash2 size={16}/>
                            </Button.Icon>
                            {t('common.delete')}
                        </Button>
                    </div>
                }
            />

            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <PageSection>
                    <div style={{display: 'flex', gap: 16, alignItems: 'flex-start'}}>
                        <UserAvatar avatar={author.avatar} name={name} size="xl"/>
                        <div style={{minWidth: 0}}>
                            <div style={{fontSize: 18, fontWeight: 600}}>{name}</div>
                            <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)', marginTop: 2}}>
                                {t(author.gender === GENDER.FEMALE ? 'mentor.genderFemale' : 'mentor.genderMale')}
                            </div>
                            <div style={{fontSize: 14, whiteSpace: 'pre-wrap', marginTop: 12}}>
                                {author.description || (
                                    <span style={{color: 'var(--g-color-text-secondary)'}}>
                                        {t('author.noDescription')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </PageSection>

                <PageSection title={t('author.courses')} description={t('author.coursesHint')}>
                    <DataTable
                        query={query}
                        rows={author.courses ?? []}
                        columns={courseColumns}
                        onRowClick={(row) => navigate(`/admin/course/courses/${row.id}`)}
                        emptyTitle={t('author.noCourses')}
                    />
                </PageSection>
            </div>

            {editing && <AuthorFormDialog author={author} onClose={() => setEditing(false)}/>}

            <ConfirmDialog
                open={confirmOpen}
                title={t('common.delete')}
                message={t('author.deleteConfirm')}
                confirmText={t('common.delete')}
                loading={deleteAuthor.isPending}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() =>
                    deleteAuthor.mutate(author.id, {
                        onSuccess: () => {
                            toaster.add({name: 'author-deleted', theme: 'success', title: t('common.deleted')});
                            navigate('/admin/course/authors');
                        },
                        onError: (error) =>
                            toaster.add({
                                name: 'author-delete-failed',
                                theme: 'danger',
                                title: extractApiErrorMessage(error, t('common.error')),
                            }),
                    })
                }
            />
        </>
    );
}

export default AdminAuthorDetail;
