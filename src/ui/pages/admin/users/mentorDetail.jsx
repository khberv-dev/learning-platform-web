import {useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Select, Table} from '@gravity-ui/uikit';
import {Pencil, Upload} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    MENTOR_STATUS,
    useChangeMentorStatus,
    useMentor,
    useUploadMentorIntroVideo,
} from '@/services/mentor/query.js';
import {cdnUrl, formatDateTime, formatPhone, fullName} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import {EmptyState, ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

function Field({label, value}) {
    return (
        <div>
            <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>{label}</div>
            <div style={{fontSize: 14, marginTop: 2}}>{value || '—'}</div>
        </div>
    );
}

function AdminMentorDetail() {
    const {t} = useI18n();
    const {id} = useParams();
    const navigate = useNavigate();
    const query = useMentor(id);
    const changeStatus = useChangeMentorStatus();
    const uploadVideo = useUploadMentorIntroVideo();
    const fileInputRef = useRef(null);
    const [status, setStatus] = useState(null);

    if (query.isPending) return <LoadingState rows={6}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const mentor = query.data;
    const name = fullName(mentor.user);
    const currentStatus = status ?? mentor.status;

    const handleStatusChange = (value) => {
        setStatus(value);
        changeStatus.mutate(
            {id, status: value},
            {
                onSuccess: () =>
                    toaster.add({
                        name: 'mentor-status',
                        theme: 'success',
                        title: t('mentor.statusChanged'),
                    }),
                onError: (error) => {
                    // Roll the select back to what the server still holds.
                    setStatus(null);
                    toaster.add({
                        name: 'mentor-status-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    });
                },
            }
        );
    };

    const handleVideoChange = (event) => {
        const file = event.target.files?.[0];
        // Reset so picking the same file twice still fires a change event.
        event.target.value = '';
        if (!file) return;

        uploadVideo.mutate(
            {id, file},
            {
                onSuccess: () =>
                    toaster.add({name: 'intro-video', theme: 'success', title: t('common.saved')}),
                onError: (error) =>
                    toaster.add({
                        name: 'intro-video-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    const historyColumns = [
        {
            id: 'change',
            name: t('common.status'),
            template: (row) => (
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <StatusLabel status={row.oldStatus} i18nPrefix="mentor"/>
                    <span style={{color: 'var(--g-color-text-secondary)'}}>→</span>
                    <StatusLabel status={row.newStatus} i18nPrefix="mentor"/>
                </div>
            ),
        },
        {
            id: 'changedBy',
            name: t('assignment.mentor'),
            template: (row) => fullName(row.changedBy?.user) || '—',
        },
        {
            id: 'createdAt',
            name: t('common.createdAt'),
            template: (row) => formatDateTime(row.createdAt),
        },
    ];

    return (
        <>
            <PageHeader
                title={name}
                description={mentor.profession}
                backTo="/admin/users/mentors"
                breadcrumbs={[
                    {title: t('mentor.title'), to: '/admin/users/mentors'},
                    {title: name},
                ]}
                actions={
                    <Button onClick={() => navigate(`/admin/users/mentors/${id}/edit`)}>
                        <Button.Icon>
                            <Pencil size={16}/>
                        </Button.Icon>
                        {t('common.edit')}
                    </Button>
                }
            />

            <div style={{display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)'}}>
                <PageSection title={t('settings.profile')}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20}}>
                        <UserAvatar avatar={mentor.user?.avatar} name={name} size="xl"/>
                        <div>
                            <div style={{fontSize: 16, fontWeight: 600}}>{name}</div>
                            <StatusLabel status={mentor.status} i18nPrefix="mentor"/>
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: 16,
                        }}
                    >
                        <Field label={t('mentor.phone')} value={formatPhone(mentor.user?.phoneNumber)}/>
                        <Field label={t('mentor.email')} value={mentor.user?.email}/>
                        <Field label={t('mentor.profession')} value={mentor.profession}/>
                        <Field label={t('common.createdAt')} value={formatDateTime(mentor.createdAt)}/>
                    </div>
                </PageSection>

                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <PageSection title={t('mentor.changeStatus')}>
                        <Select
                            size="l"
                            width="max"
                            value={[currentStatus]}
                            onUpdate={([value]) => handleStatusChange(value)}
                            disabled={changeStatus.isPending}
                        >
                            <Select.Option value={MENTOR_STATUS.ACTIVE}>
                                {t('mentor.statusActive')}
                            </Select.Option>
                            <Select.Option value={MENTOR_STATUS.SUSPENDED}>
                                {t('mentor.statusSuspended')}
                            </Select.Option>
                            <Select.Option value={MENTOR_STATUS.FIRED}>
                                {t('mentor.statusFired')}
                            </Select.Option>
                        </Select>
                    </PageSection>

                    <PageSection
                        title={t('mentor.introVideo')}
                        actions={
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                loading={uploadVideo.isPending}
                            >
                                <Button.Icon>
                                    <Upload size={16}/>
                                </Button.Icon>
                                {t('mentor.uploadVideo')}
                            </Button>
                        }
                    >
                        {/* The picker opens only from the button above - never
                            automatically on mount. */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            style={{display: 'none'}}
                        />
                        {mentor.introVideo ? (
                            <video
                                src={cdnUrl(mentor.introVideo)}
                                controls
                                style={{width: '100%', borderRadius: 8}}
                            />
                        ) : (
                            <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                                {t('common.empty')}
                            </div>
                        )}
                    </PageSection>
                </div>
            </div>

            <PageSection title={t('mentor.statusHistory')} style={{marginTop: 16}}>
                {mentor.statusHistories?.length ? (
                    <Table
                        data={mentor.statusHistories}
                        columns={historyColumns}
                        getRowId={(row) => row.id}
                        width="max"
                    />
                ) : (
                    <EmptyState/>
                )}
            </PageSection>
        </>
    );
}

export default AdminMentorDetail;
