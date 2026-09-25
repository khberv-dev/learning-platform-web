import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Select, Table} from '@gravity-ui/uikit';
import {KeyRound, Pencil} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    MENTOR_STATUS,
    useChangeMentorStatus,
    useMentor,
    useUploadMentorAvatar,
    useUploadMentorIntroVideo,
} from '@/services/mentor/query.js';
import {GROUP_MENTOR_ROLE} from '@/services/group/query.js';
import {IMAGE_RULES, VIDEO_RULES} from '@/shared/utils/fileValidation.js';
import {useUploadProgress} from '@/shared/hooks/useUploadProgress.js';
import {formatDateTime, formatPhone, fullName} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';
import FileDropCard from '@/ui/components/fileDropCard.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import {EmptyState, ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import SetUserPasswordDialog from '@/ui/pages/admin/users/setUserPasswordDialog.jsx';

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
    const uploadAvatar = useUploadMentorAvatar();
    const videoProgress = useUploadProgress();
    const avatarProgress = useUploadProgress();
    const [videoFile, setVideoFile] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [passwordOpen, setPasswordOpen] = useState(false);

    if (query.isPending) return <LoadingState rows={6}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const mentor = query.data;
    const name = fullName(mentor);
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

    const handleVideoChange = (file) => {
        if (!file) {
            setVideoFile(null);
            return;
        }
        setVideoFile(file);

        uploadVideo.mutate(
            {id, file, onUploadProgress: videoProgress.onUploadProgress},
            {
                onSuccess: () => {
                    toaster.add({name: 'intro-video', theme: 'success', title: t('common.saved')});
                    setVideoFile(null);
                    videoProgress.reset();
                },
                onError: (error) => {
                    toaster.add({
                        name: 'intro-video-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    });
                    setVideoFile(null);
                    videoProgress.reset();
                },
            }
        );
    };

    const handleAvatarChange = (file) => {
        if (!file) {
            setAvatarFile(null);
            return;
        }
        setAvatarFile(file);

        uploadAvatar.mutate(
            {id, file, onUploadProgress: avatarProgress.onUploadProgress},
            {
                onSuccess: () => {
                    toaster.add({name: 'avatar', theme: 'success', title: t('common.saved')});
                    setAvatarFile(null);
                    avatarProgress.reset();
                },
                onError: (error) => {
                    toaster.add({
                        name: 'avatar-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    });
                    setAvatarFile(null);
                    avatarProgress.reset();
                },
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
            name: t('mentor.changedBy'),
            template: (row) => fullName(row.changedBy) || '—',
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
                description={t(mentor.role === GROUP_MENTOR_ROLE.PRIMARY ? 'group.rolePrimary' : 'group.roleSupport')}
                backTo="/admin/users/mentors"
                breadcrumbs={[
                    {title: t('mentor.title'), to: '/admin/users/mentors'},
                    {title: name},
                ]}
                actions={
                    <div style={{display: 'flex', gap: 8}}>
                        <Button onClick={() => setPasswordOpen(true)}>
                            <Button.Icon>
                                <KeyRound size={16}/>
                            </Button.Icon>
                            {t('user.setPassword')}
                        </Button>
                        <Button onClick={() => navigate(`/admin/users/mentors/${id}/edit`)}>
                            <Button.Icon>
                                <Pencil size={16}/>
                            </Button.Icon>
                            {t('common.edit')}
                        </Button>
                    </div>
                }
            />

            <div style={{display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)'}}>
                <PageSection title={t('settings.profile')}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
                        <UserAvatar avatar={mentor.avatar} name={name} size="xl"/>
                        <div style={{flex: 1, minWidth: 0}}>
                            <div style={{fontSize: 16, fontWeight: 600}}>{name}</div>
                            <StatusLabel status={mentor.status} i18nPrefix="mentor"/>
                        </div>
                    </div>
                    <FileDropCard
                        value={avatarFile}
                        onChange={handleAvatarChange}
                        accept="image/png,image/jpeg"
                        rules={IMAGE_RULES}
                        progress={avatarProgress.progress}
                        disabled={uploadAvatar.isPending}
                    />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: 16,
                            marginTop: 20,
                        }}
                    >
                        <Field label={t('mentor.phone')} value={formatPhone(mentor.phoneNumber)}/>
                        <Field
                            label={t('mentor.role')}
                            value={t(mentor.role === GROUP_MENTOR_ROLE.PRIMARY ? 'group.rolePrimary' : 'group.roleSupport')}
                        />
                        <Field
                            label={t('mentor.gender')}
                            value={mentor.gender && t(mentor.gender === 'female' ? 'mentor.genderFemale' : 'mentor.genderMale')}
                        />
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
                            <Select.Option value={MENTOR_STATUS.WORKING}>
                                {t('mentor.statusWorking')}
                            </Select.Option>
                            <Select.Option value={MENTOR_STATUS.VACATION}>
                                {t('mentor.statusVacation')}
                            </Select.Option>
                            <Select.Option value={MENTOR_STATUS.FIRED}>
                                {t('mentor.statusFired')}
                            </Select.Option>
                        </Select>
                    </PageSection>

                    <PageSection title={t('mentor.introVideo')}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                            {mentor.introVideo ? (
                                <video
                                    src={mentor.introVideo}
                                    controls
                                    style={{width: '100%', borderRadius: 8}}
                                />
                            ) : (
                                <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                                    {t('common.empty')}
                                </div>
                            )}
                            <FileDropCard
                                value={videoFile}
                                onChange={handleVideoChange}
                                accept="video/mp4"
                                rules={VIDEO_RULES}
                                progress={videoProgress.progress}
                                disabled={uploadVideo.isPending}
                            />
                        </div>
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
            <SetUserPasswordDialog
                open={passwordOpen}
                kind="mentor"
                accountId={mentor.id}
                userName={name}
                onClose={() => setPasswordOpen(false)}
            />
        </>
    );
}

export default AdminMentorDetail;
