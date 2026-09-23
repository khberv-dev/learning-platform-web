import {useState} from 'react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useUploadMyIntroVideo} from '@/services/mentor/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import {VIDEO_RULES} from '@/shared/utils/fileValidation.js';
import {useUploadProgress} from '@/shared/hooks/useUploadProgress.js';
import SettingsPage from '@/ui/pages/settingsPage.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import FileDropCard from '@/ui/components/fileDropCard.jsx';

// Mentors get one extra card over the shared settings page: their intro video,
// which students see when picking a mentor.
function IntroVideoSection() {
    const {t} = useI18n();
    const uploadVideo = useUploadMyIntroVideo();
    const {progress, onUploadProgress, reset} = useUploadProgress();
    const [file, setFile] = useState(null);

    const handleChange = (picked) => {
        if (!picked) {
            setFile(null);
            return;
        }
        setFile(picked);

        uploadVideo.mutate(
            {file: picked, onUploadProgress},
            {
                onSuccess: () => {
                    toaster.add({name: 'intro-video', theme: 'success', title: t('common.saved')});
                    setFile(null);
                    reset();
                },
                onError: (error) => {
                    toaster.add({
                        name: 'intro-video-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    });
                    setFile(null);
                    reset();
                },
            }
        );
    };

    return (
        <PageSection title={t('mentor.introVideo')} description={t('mentor.introVideoHint')}>
            <FileDropCard
                value={file}
                onChange={handleChange}
                accept="video/mp4"
                rules={VIDEO_RULES}
                progress={progress}
                disabled={uploadVideo.isPending}
            />
        </PageSection>
    );
}

function MentorSettings() {
    return <SettingsPage extra={<IntroVideoSection/>}/>;
}

export default MentorSettings;
